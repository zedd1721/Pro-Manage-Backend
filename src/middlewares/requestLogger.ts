import { NextFunction, Request, Response } from "express";

type ResponseBody = {
    message?: string;
    error?: string;
};

const colors = {
    reset: "\x1b[0m",
    dim: "\x1b[2m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[36m",
} as const;

const getMethodColor = (method: string): string => {
    switch (method) {
        case "GET":
            return colors.green;
        case "POST":
            return colors.blue;
        case "PUT":
        case "PATCH":
            return colors.yellow;
        case "DELETE":
            return colors.red;
        default:
            return colors.cyan;
    }
};

export const requestLogger = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    let responseMessage = "";
    const startTime = Date.now();

    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    res.json = ((body: ResponseBody) => {
        if (body && typeof body === "object") {
            responseMessage = body.message ?? body.error ?? "";
        }

        return originalJson(body);
    }) as Response["json"];

    res.send = ((body: unknown) => {
        if (typeof body === "string") {
            responseMessage = body;
        }

        return originalSend(body);
    }) as Response["send"];

    res.on("finish", () => {
        const requestStatus =
            res.statusCode >= 200 && res.statusCode < 400 ? "PASS" : "FAIL";
        const duration = `${Date.now() - startTime}ms`;
        const timestamp = new Date().toLocaleString("en-IN", {
            hour12: true,
        });
        const route = req.originalUrl;
        const message = responseMessage || "No message";
        const statusColor =
            requestStatus === "PASS" ? colors.green : colors.red;
        const methodColor = getMethodColor(req.method);

        console.log(
            `${colors.dim}${timestamp}${colors.reset} ` +
            `${statusColor}[${requestStatus}]${colors.reset} ` +
            `${methodColor}${req.method}${colors.reset} ` +
            `${route} ` +
            `${colors.cyan}${res.statusCode}${colors.reset} ` +
            `${colors.dim}${duration}${colors.reset} ` +
            `- ${message}`
        );
    });

    next();
};
