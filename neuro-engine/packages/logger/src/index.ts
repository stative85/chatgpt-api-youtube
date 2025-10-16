import pino from 'pino';

export interface LoggerOptions {
  service?: string;
  level?: pino.LevelWithSilent;
  pretty?: boolean;
}

export function createLogger(options: LoggerOptions = {}) {
  const isDev = process.env.NODE_ENV !== 'production';
  const baseOptions: pino.LoggerOptions = {
    name: options.service ?? 'neuro-engine',
    level: options.level ?? (isDev ? 'debug' : 'info')
  };

  const transport = options.pretty || isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard'
        }
      }
    : undefined;

  return pino(baseOptions, transport ? pino.transport(transport) : undefined);
}

export type Logger = ReturnType<typeof createLogger>;
