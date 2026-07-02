import { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncController = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<unknown>;

export const asyncHandler = (fn: AsyncController): RequestHandler => {
    return async (req, res, next) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            next(error);
        }
    };
};
