<?php
/**
 * Contact form endpoint for MAXXY.MOV (Hostinger shared hosting, PHP 7.4+).
 * Receives the form POST, validates it, and emails a "New lead" notification.
 *
 * Edit the constants below if your addresses change. Nothing else needs touching.
 */

// ---- Config ---------------------------------------------------------------
const LEAD_TO    = 'hello@hemeellhere.com';   // inbox that receives new leads
const LEAD_FROM  = 'hello@hemeellhere.com';   // must be a real mailbox on this domain (Hostinger email)
const SITE_HOSTS = ['hemeellhere.com', 'www.hemeellhere.com'];
const NEEDS      = ['Shorts / Reels', 'Podcast clips', 'Motion + polish', 'Something else'];
const RATE_LIMIT  = 5;      // max accepted messages per IP...
const RATE_WINDOW = 3600;   // ...per this many seconds
const MIN_FILL_MS = 2000;   // forms submitted faster than this are almost certainly bots

// Local testing only: run `LEAD_DEV=1 php -S localhost:8000 -t public` and no email is sent.
$DEV = getenv('LEAD_DEV') === '1';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

function respond($status, array $payload)
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function fail($status, $message)
{
    respond($status, ['ok' => false, 'error' => $message]);
}

/** Single-line field: strip control characters and collapse whitespace (blocks header injection). */
function clean_line($value, $max)
{
    $value = preg_replace('/[\x00-\x1F\x7F]+/u', ' ', (string) $value);
    $value = trim(preg_replace('/\s+/u', ' ', $value));
    return mb_substr($value, 0, $max);
}

/** Multi-line field: keep newlines, strip other control characters. */
function clean_text($value, $max)
{
    $value = str_replace("\r\n", "\n", (string) $value);
    $value = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $value);
    return mb_substr(trim($value), 0, $max);
}

function rate_limited($ip)
{
    $file = sys_get_temp_dir() . '/maxxy_rl_' . hash('sha256', $ip) . '.json';
    $fh = @fopen($file, 'c+');
    if (!$fh) {
        return false; // fail open: never lose a real lead because of a temp-dir problem
    }
    flock($fh, LOCK_EX);
    $now = time();
    $hits = json_decode((string) stream_get_contents($fh), true);
    if (!is_array($hits)) {
        $hits = [];
    }
    $hits = array_values(array_filter($hits, function ($t) use ($now) {
        return is_int($t) && $t > $now - RATE_WINDOW;
    }));
    $limited = count($hits) >= RATE_LIMIT;
    if (!$limited) {
        $hits[] = $now;
    }
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode($hits));
    fflush($fh);
    flock($fh, LOCK_UN);
    fclose($fh);
    return $limited;
}

// ---- Request checks -------------------------------------------------------
if (!extension_loaded('mbstring')) {
    error_log('contact.php: PHP mbstring extension is disabled. Enable it in hPanel > PHP Configuration.');
    fail(500, 'Could not send right now. Please email ' . LEAD_TO . ' directly.');
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    fail(405, 'Method not allowed.');
}

if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 20000) {
    fail(413, 'Message too large.');
}

// Same-origin only: blocks other websites from posting to this endpoint from a visitor's browser.
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !$DEV) {
    $originHost = strtolower((string) parse_url($origin, PHP_URL_HOST));
    if (!in_array($originHost, SITE_HOSTS, true)) {
        fail(403, 'Forbidden.');
    }
}

// Bot traps. A filled honeypot gets a fake "success" so bots don't learn anything.
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    respond(200, ['ok' => true]);
}
if ((int) ($_POST['elapsed'] ?? 0) < MIN_FILL_MS) {
    fail(400, 'Please take a moment and try again.');
}

// ---- Validate -------------------------------------------------------------
foreach (['name', 'email', 'need', 'message'] as $key) {
    if (isset($_POST[$key]) && !mb_check_encoding((string) $_POST[$key], 'UTF-8')) {
        fail(400, 'Invalid characters in the form.');
    }
}

$name    = clean_line($_POST['name'] ?? '', 100);
$email   = clean_line($_POST['email'] ?? '', 254);
$need    = (string) ($_POST['need'] ?? '');
$message = clean_text($_POST['message'] ?? '', 3000);

if ($name === '') {
    fail(422, 'Please add your name.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail(422, 'Please add a valid email so I can reply.');
}
if (!in_array($need, NEEDS, true)) {
    $need = 'Something else';
}
if (mb_strlen($message) < 10) {
    fail(422, 'Tell me a little about the project (10+ characters).');
}

$ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
if (rate_limited($ip)) {
    fail(429, 'Too many messages from this connection. Please email ' . LEAD_TO . ' directly.');
}

// ---- Build the email ------------------------------------------------------
$when = (new DateTime('now', new DateTimeZone('Asia/Kolkata')))->format('D, d M Y, H:i') . ' IST';

$subject = "\u{1F514} New lead: " . mb_substr($name, 0, 60) . ' - ' . $need;
$body = "New lead from the MAXXY.MOV website\n\n"
      . "Name:     {$name}\n"
      . "Email:    {$email}\n"
      . "Needs:    {$need}\n"
      . "Received: {$when}\n"
      . "IP:       {$ip}\n\n"
      . "Message:\n{$message}\n\n"
      . "-- Hit Reply to answer them directly.\n";

$headers = [
    'From: MAXXY.MOV Leads <' . LEAD_FROM . '>',
    'Reply-To: ' . $email,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    'Importance: high',
    'X-Priority: 1',
];

$encodedSubject = mb_encode_mimeheader($subject, 'UTF-8', 'B', "\r\n");
$encodedBody    = chunk_split(base64_encode($body));

if ($DEV) {
    error_log("[LEAD_DEV] would send to " . LEAD_TO . "\nSubject: {$subject}\n{$body}");
    respond(200, ['ok' => true]);
}

$sent = mail(LEAD_TO, $encodedSubject, $encodedBody, implode("\r\n", $headers), '-f' . LEAD_FROM);
if (!$sent) {
    error_log('contact.php: mail() failed for a lead from ' . $email);
    fail(500, 'Could not send right now. Please email ' . LEAD_TO . ' directly.');
}

respond(200, ['ok' => true]);
