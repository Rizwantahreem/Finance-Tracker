import express, { urlencoded } from "express";
import cookieParser from "cookie-parser";
import { errorLogger } from "./middlewares/error.middleware.js";
import { startServer } from "./config/DbConnection.js";
import userRouter from "./routers/users.router.js";
import categoryRouter from "./routers/category.router.js";
import transactionRouter from "./routers/transaction.router.js";
import { verifyToken } from "./middlewares/auth.middleware.js";

const app = express();
const port = process.env.Port || 5000;

startServer(app, port);

// Adding middleware for request body parsing
app.use(express.json());
app.use(cookieParser());
app.use(urlencoded({ extended: false }));

app.use("/api/transaction", verifyToken, transactionRouter);
app.use("/api/user", userRouter);
app.use("/api/category", verifyToken, categoryRouter);

app.use(errorLogger);
