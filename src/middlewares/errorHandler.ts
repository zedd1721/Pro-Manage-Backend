import { NextFunction, Request, Response } from "express";

export const errorHandler = (
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {

    const statusCode = 
        typeof err === "object" && err !== null && 
        "statusCode" in err &&
        typeof (err as {statusCode?: number }).statusCode === "number"
        ? (err as {statusCode: number}).statusCode 
        : 500;

    const message =
        err instanceof Error ? err.message : "Something went wrong";

    const code =
        typeof err === "object" && err !== null &&
        "code" in err &&
        typeof (err as {code?: string}).code === "string"
        ? (err as {code: string}).code
        : undefined;

    res.status(statusCode).json({
        success: false,
        ...(code ? { code } : {}),
        message,
    });
};
