import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const verifyToken = async (req, res, next) => {
  let token = req.headers.authorization || req.headers.Authorization;

  if (!token || !token?.startsWith("Bearer "))
    return res.status(401).json({ messge: "Unauthorized access." });

  token = token?.split(" ")[1];
  try {
    const decodedUser = await jwt.verify(token, config.SECRET_KEY);
    req.user = decodedUser;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }

    return res.status(401).json({ message: "Invalid token" });
  }
};
