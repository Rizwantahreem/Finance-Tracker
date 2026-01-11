import type { Request, Response, NextFunction } from "express";

export const notFound = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  res.status(404).type("application/problem+json").json({
    title: "Not Found",
    status: 404,
    detail: "The requested resource does not exist",
  });
};
