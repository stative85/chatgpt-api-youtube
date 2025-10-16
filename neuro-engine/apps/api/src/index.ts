import Fastify from "fastify";
import mercurius from "mercurius";
import { captureException, initSentry } from "@neuro-engine/logger/sentry";
import { createLogger } from "@neuro-engine/logger";
import { resolvers, typeDefs } from "./schema";

const port = Number(process.env.PORT ?? 4000);

if (process.env.SENTRY_DSN) {
  initSentry({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1,
    runtime: "node"
  });
}

const logger = createLogger({ service: "api" });

async function buildServer() {
  const app = Fastify({
    logger,
    disableRequestLogging: false
  });

  await app.register(mercurius, {
    schema: typeDefs,
    resolvers,
    graphiql: true
  });

  app.get("/health", async () => ({ status: "ok" }));

  app.setErrorHandler((error, request, reply) => {
    logger.error({ err: error, requestId: request.id }, "Unhandled error");
    captureException(error);
    reply.status(500).send({ error: "Internal Server Error" });
  });

  return app;
}

if (process.env.NODE_ENV !== "test") {
  buildServer()
    .then((app) => app.listen({ port, host: "0.0.0.0" }))
    .then(() => logger.info({ port }, "API ready"))
    .catch((error) => {
      logger.error(error, "Failed to start API");
      captureException(error);
      process.exit(1);
    });
}

export { buildServer };
