import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error, info) {
    // Swallow details from the UI; log for diagnostics only.
    if (import.meta.env.DEV && typeof window !== 'undefined' && window.console)
      console.error('MAXXY.MOV render error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '14px',
            background: '#090909',
            color: '#f1f1ec',
            fontFamily: 'sans-serif',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '13px', letterSpacing: '.1em', textTransform: 'uppercase', opacity: 0.6 }}>
            Something went wrong
          </p>
          <h1 style={{ fontSize: '22px', margin: 0 }}>This page hit an unexpected error.</h1>
          <a href="mailto:hello@hemeellhere.com" style={{ color: '#c7ff3d', textDecoration: 'underline' }}>
            Email hello@hemeellhere.com
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
