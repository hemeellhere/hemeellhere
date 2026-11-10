import React, { useEffect, useRef, useState } from 'react';
import { trackEvent } from './analytics.js';

const ENDPOINT = '/api/contact.php';
const NEEDS = ['Shorts / Reels', 'Podcast clips', 'Motion + polish', 'Something else'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FALLBACK_EMAIL = 'hello@hemeellhere.com';

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Tell me your name.';
  if (!values.email.trim()) errors.email = 'Add your email so I can reply.';
  else if (!EMAIL_RE.test(values.email.trim())) errors.email = 'That email doesn\u2019t look right.';
  if (values.message.trim().length < 10)
    errors.message = 'A sentence or two about the project helps (10+ characters).';
  return errors;
}

/**
 * Lead form. Posts to /api/contact.php, which emails a "New lead" notification.
 * `buttonRef` / `buttonContent` let the page keep its magnetic star-border button styling.
 */
export default function ContactForm({ buttonRef, buttonContent }) {
  const formRef = useRef(null);
  const startedAt = useRef(Date.now());
  const focusTracked = useRef(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const readValues = () => {
    const fd = new FormData(formRef.current);
    return {
      name: String(fd.get('name') || ''),
      email: String(fd.get('email') || ''),
      need: String(fd.get('need') || NEEDS[0]),
      message: String(fd.get('message') || ''),
      website: String(fd.get('website') || ''),
    };
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (status === 'sending') return;
    const values = readValues();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) {
      requestAnimationFrame(() => formRef.current?.querySelector('[aria-invalid="true"]')?.focus());
      return;
    }

    setStatus('sending');
    setServerError('');
    const body = new FormData();
    Object.entries(values).forEach(([k, v]) => body.append(k, v));
    body.append('elapsed', String(Date.now() - startedAt.current));

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        body,
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus('sent');
        trackEvent('lead-form-sent', 'Lead form sent');
      } else {
        setServerError(data.error || 'Could not send right now.');
        setStatus('error');
      }
    } catch {
      setServerError('Could not reach the server.');
      setStatus('error');
    } finally {
      clearTimeout(timer);
    }
  };

  if (status === 'sent') {
    return (
      <div className="form-sent" role="status">
        <strong>Got it. Thanks for reaching out.</strong>
        <span>I&rsquo;ll reply within 24&ndash;48 hours.</span>
      </div>
    );
  }

  const field = (id, label, control, error) => (
    <div className="field">
      <label htmlFor={'cf-' + id}>{label}</label>
      {control}
      {error && (
        <p className="field-error" id={'cf-' + id + '-err'}>
          {error}
        </p>
      )}
    </div>
  );

  const a11y = id => ({
    id: 'cf-' + id,
    name: id,
    'aria-invalid': errors[id] ? 'true' : undefined,
    'aria-describedby': errors[id] ? 'cf-' + id + '-err' : undefined,
  });

  return (
    <form
      ref={formRef}
      className="contact-form"
      onSubmit={onSubmit}
      onFocus={() => {
        if (focusTracked.current) return;
        focusTracked.current = true;
        trackEvent('lead-form-started', 'Lead form started');
      }}
      noValidate
      aria-label="Start a project"
    >
      {field(
        'name',
        'Your name',
        <input type="text" autoComplete="name" maxLength={100} {...a11y('name')} />,
        errors.name
      )}
      {field(
        'email',
        'Email',
        <input type="email" autoComplete="email" inputMode="email" maxLength={254} {...a11y('email')} />,
        errors.email
      )}
      {field(
        'need',
        'What do you need?',
        <select defaultValue={NEEDS[0]} {...a11y('need')}>
          {NEEDS.map(n => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      )}
      {field(
        'message',
        'Tell me about it',
        <textarea
          rows={5}
          maxLength={3000}
          placeholder="Links to footage, how many videos, deadline…"
          {...a11y('message')}
        />,
        errors.message
      )}

      {/* Honeypot: hidden from people, irresistible to bots */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="cf-website">Leave this empty</label>
        <input id="cf-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <button
        ref={buttonRef}
        type="submit"
        className="cta-button star-border magnetic"
        disabled={status === 'sending'}
        aria-busy={status === 'sending'}
      >
        {buttonContent}
      </button>

      <p className="form-status" role="status" aria-live="polite">
        {status === 'sending' && 'Sending\u2026'}
      </p>
      {status === 'error' && (
        <p className="form-error" role="alert">
          {serverError} Please email <a href={'mailto:' + FALLBACK_EMAIL}>{FALLBACK_EMAIL}</a> instead.
        </p>
      )}
      <p className="form-note">I only use your details to reply about your project.</p>
    </form>
  );
}
