# @neuro-engine/logger

Unified observability helpers built for the Neuro-Engine stack. The package exports a Pino-based
logger preconfigured for pretty output in local dev, JSON logs in production, and Sentry bindings to
route exceptions automatically.

## Usage

```ts
import { createLogger } from '@neuro-engine/logger';

const logger = createLogger({ service: 'websim-router' });
logger.info('Booting builder ops stack');
```

To enable Sentry, call the exported `initSentry` function once per process and provide the DSN from
the environment.
