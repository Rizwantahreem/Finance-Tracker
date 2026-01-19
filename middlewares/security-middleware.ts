import express, { urlencoded } from "express";
import type { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit"; // precention from DDOS & brute-force
import helmet from "helmet"; // for security
import { config } from "../config/env.js";

export const setSecurityMiddlewares = (app: Express) => {
  app.use(helmet()); // prenvention from XSS, clickjacking & sniffing and unsafe framing

  const limiterOptions = rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    windowMs: 15 * 60 * 1000,
    max: 10,
  });
  app.use(limiterOptions);

  app.use(
    cors({
      credentials: true,
      methods: ["GET", "PATCH", "POST", "DELETE"],
      origin: config.CORS_ORIGIN.split(","),
    })
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(urlencoded({ extended: false, limit: "100kb" }));

  app.use(cookieParser ());
};
