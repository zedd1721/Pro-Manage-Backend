import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const accessToken = req.cookies.accessToken as string | undefined;

  if (!accessToken) {
    res.status(401).json({
      success: false,
      code: "ACCESS_TOKEN_MISSING",
      message: "Access token missing",
    });
    return;
  }

  try {
    const payload = jwt.verify(
      accessToken,
      env.JWT_ACCESS_SECRET,
    ) as JwtPayload & { userId?: string };

    if (!payload.userId) {
      res.status(401).json({
        success: false,
        code: "INVALID_TOKEN_PAYLOAD",
        message: "Invalid token payload",
      });
      return;
    }

    req.user = {
      userId: payload.userId,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        code: "ACCESS_TOKEN_EXPIRED",
        message: "Access token expired",
      });
      return;
    }

    res.status(401).json({
      success: false,
      code: "INVALID_ACCESS_TOKEN",
      message: "Invalid access token",
    });
  }
};
