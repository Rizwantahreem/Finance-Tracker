import { config } from "./config/env.js";
import express from "express";
import userRouter from "./routers/users.router.js";
import { setSecurityMiddlewares } from "./middlewares/security-middleware.js";
import { notFound } from "./middlewares/not-found.middleware.js";
import { errorLogger } from "./middlewares/error.middleware.js";
import { startServer } from "./config/DbConnection.js";
import { verifyToken } from "./middlewares/auth.middleware.js";
import categoryRouter from "./routers/category.router.js";
import transactionRouter from "./routers/transaction.router.js";
import budgetRouter from "./routers/budget.router.js";
import analyticRouter from "./routers/analytics.router.js";

const app = express();
const port = process.env.PORT || 5000;

startServer(app, port);
setSecurityMiddlewares(app);

app.use("/api/transaction", verifyToken, transactionRouter);
app.use("/api/user", userRouter);
app.use("/api/category", verifyToken, categoryRouter);
app.use("/api/budget", verifyToken, budgetRouter);
app.use("/api/dashboard", verifyToken, analyticRouter);

app.use(notFound);
app.use(errorLogger);
