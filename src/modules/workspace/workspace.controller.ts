import { Request, Response } from "express";
import * as workspaceService from "./workspace.service"
import { sendResponse } from "../../utils/apiResponse";

export const createProject = async(req: Request, res: Response) => {
    const result = await workspaceService.createProject(req.body, req.user.userId)

    sendResponse(
        res,
        201,
        "Project Created Successfully",
        result
    );
}

export const inviteMember = async (req: Request, res: Response) => {
    const result = await workspaceService.inviteMember(req.body, req.user.userId);

    sendResponse(
        res,
        200,
        "Invitation sent successfully",
        result
    );
}

export const joinProject = async (req: Request, res: Response) => {
    const result = await workspaceService.joinProject(req.body, req.user.userId);

    sendResponse(
        res,
        201,
        "Joined project successfully",
        result
    );
}
