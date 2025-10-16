import * as SentryNode from '@sentry/node';
import * as SentryBrowser from '@sentry/browser';
import type { Options as SentryOptions } from '@sentry/node';

type Runtime = 'node' | 'browser' | 'next';

export interface SentryConfig extends SentryOptions {
  runtime?: Runtime;
}

let isInitialised = false;

export function initSentry(config: SentryConfig) {
  if (isInitialised) {
    return;
  }

  const runtime = config.runtime ?? (typeof window === 'undefined' ? 'node' : 'browser');

  if (runtime === 'node') {
    SentryNode.init(config);
  } else {
    SentryBrowser.init(config);
  }

  isInitialised = true;
}

export function captureException(error: unknown) {
  if (typeof window === 'undefined') {
    SentryNode.captureException(error);
  } else {
    SentryBrowser.captureException(error);
  }
}
