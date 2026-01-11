import express, { urlencoded } from "express";
import type { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import rateLimit from "express-rate-limit"; // precention from DDOS & brute-force
import helmet from "helmet"; // for security

export const setSecurityMiddlewares = (app: Express) => {
  app.use(helmet()); // prenvention from XSS, clickjacking & sniffing and unsafe framing

  const limiterOptions = rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    windowMs: 15 * 60 * 1000,
    max: 8,
  });
  app.use(limiterOptions);

  app.use(
    cors({
      Credential: true,
      methods: ["GET", "PATCH", "POST", "DELETE"],
      origin: process.env.CORS_ORIGIN.split(","),
    })
  );
  app.use(express.json({ limit: "100kb" }));
  app.use(urlencoded({ extended: false, limit: "100kb" }));

  app.use(cookieParser());
};
