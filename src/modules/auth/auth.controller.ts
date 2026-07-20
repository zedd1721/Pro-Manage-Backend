import { Request, Response } from "express";
import { sendResponse } from "../../utils/apiResponse";
import * as authService from "./auth.service";
import { setAuthCookies } from "../../utils/set-auth-cookies";

export const register = async(
    req: Request,
    res: Response
): Promise<void> => {
    const result = await authService.registerUser(req.body);

    setAuthCookies(res, result.accessToken, result.refreshToken);

    sendResponse(
        res,
        201,
        "User registered successfully!",
        result
    );
};

export const login = async(
    req: Request,
    res: Response
): Promise<void> => {
    const result = await authService.loginUser(req.body);
    setAuthCookies(res, result.accessToken, result.refreshToken);

    sendResponse(
        res,
        200,
        "User Verified!",
        result
    )
}

export const logout = async(
    req: Request,
    res: Response
): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;

    if(refreshToken){
        await authService.logoutUser(refreshToken);
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    sendResponse(
        res,
        200,
        "Logged out Successfully",
        null
    )
}

export const rotateToken = async(
    req: Request,
    res: Response
): Promise<void> => {
    const oldRefreshToken = req.cookies.refreshToken;

    const result = await authService.rotateRefreshToken(oldRefreshToken);

    setAuthCookies(
        res,
        result.accessToken,
        result.refreshToken
    )

    sendResponse(
        res,
        200,
        "Token Refreshed Successfully",
        null
    )
}

export const getCurrentUser = async(
    req: Request,
    res: Response
): Promise<void> => {
    const userId = req.user?.userId;

    if(!userId) {
        sendResponse(
            res,
            401,
            "Authentication required",
            null
        );
        return;
    }

    const result = await authService.getCurrentUser(userId);

    sendResponse(
        res,
        200,
        "Current user fetched",
        result,
    )

}