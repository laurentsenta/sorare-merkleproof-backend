import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";

export const activateSentry = () => {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        // We recommend adjusting this value in production, or using tracesSampler
        // for finer control
        tracesSampleRate: 1.0,
    });
    console.log(Tracing) // Force import of tracing library
}

activateSentry()