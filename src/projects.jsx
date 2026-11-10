import React from 'react';
import { createRoot } from 'react-dom/client';
import ProjectsPage from './ProjectsPage.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { initAnalytics } from './analytics.js';
import './styles.css';

initAnalytics();

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ProjectsPage />
    </ErrorBoundary>
  </React.StrictMode>
);
