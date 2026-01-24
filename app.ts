import express, { type Express } from "express";
import { setSecurityMiddlewares } from "./middlewares/security-middleware.js";
import { notFound } from "./middlewares/not-found.middleware.js";
import { errorLogger } from "./middlewares/error.middleware.js";
import { verifyToken } from "./middlewares/auth.middleware.js";
import userRouter from "./routers/users.router.js";
import categoryRouter from "./routers/category.router.js";
import transactionRouter from "./routers/transaction.router.js";
import budgetRouter from "./routers/budget.router.js";
import analyticRouter from "./routers/analytics.router.js";

export const createApp = (): Express => {
  const app = express();

  setSecurityMiddlewares(app);

  app.use("/api/transaction", verifyToken, transactionRouter);
  app.use("/api/user", userRouter);
  app.use("/api/category", verifyToken, categoryRouter);
  app.use("/api/budget", verifyToken, budgetRouter);
  app.use("/api/dashboard", verifyToken, analyticRouter);

  app.use(notFound);
  app.use(errorLogger);

  return app;
};

export const app = createApp();
