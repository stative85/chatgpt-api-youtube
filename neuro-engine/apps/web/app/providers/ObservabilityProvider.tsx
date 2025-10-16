"use client";

import { PropsWithChildren, useEffect } from "react";
import { initSentry } from "@neuro-engine/logger/sentry";

export function ObservabilityProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      initSentry({
        dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 1,
        runtime: "browser"
      });
    }
  }, []);

  return <>{children}</>;
}
