import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0,

  // Environment
  environment: process.env.NODE_ENV,

  // Error filtering - don't send to Sentry in development
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Sentry Error (dev):', hint.originalException || event);
      return null;
    }
    return event;
  },
});
