import express, { type Express } from "express";
import { setSecurityMiddlewares } from "./middlewares/security-middleware.js";
import { notFound } from "./middlewares/not-found.middleware.js";
import { errorLogger } from "./middlewares/error.middleware.js";
import { verifyToken } from "./middlewares/auth.middleware.js";
import { requestIdMiddleware } from "./middlewares/request-id.middleware.js";
import userRouter from "./routers/users.router.js";
import categoryRouter from "./routers/category.router.js";
import transactionRouter from "./routers/transaction.router.js";
import budgetRouter from "./routers/budget.router.js";
import analyticRouter from "./routers/analytics.router.js";
import { pinoHttp } from "pino-http";
import { logger } from "./utils/logger.js";
import { config } from "./config/env.js";

export const createApp = (): Express => {
  const app = express();

  // Request ID middleware - must be first to track all requests
  app.use(requestIdMiddleware);

  // HTTP request logging - should be early but after request ID
  app.use(
    pinoHttp({
      logger,
      genReqId: (req): string => {
        // requestId is always set by requestIdMiddleware, but TypeScript needs assurance
        return req.requestId ?? '';
      },
      customLogLevel: (req, res, err) => {
        if (res.statusCode >= 500) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },
    })
  );

  // Security middlewares
  setSecurityMiddlewares(app);

  // Health check endpoints (before authentication)
  app.get("/healthz", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.get("/readyz", async (req, res) => {
    const mongoose = await import("mongoose");
    const dbReady = mongoose.default.connection.readyState === 1;
    const status = dbReady ? 200 : 503;
    res.status(status).json({
      ready: dbReady,
      database: dbReady ? "connected" : "disconnected",
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.use("/api/transaction", verifyToken, transactionRouter);
  app.use("/api/user", userRouter);
  app.use("/api/category", verifyToken, categoryRouter);
  app.use("/api/budget", verifyToken, budgetRouter);
  app.use("/api/dashboard", verifyToken, analyticRouter);

  // 404 handler
  app.use(notFound);

  // Error handler - must be last
  app.use(errorLogger);

  return app;
};

export const app = createApp();
