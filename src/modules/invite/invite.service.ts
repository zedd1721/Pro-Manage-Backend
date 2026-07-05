import { v7 as uuid } from "uuid";
import { env } from "../../config/env";
import { findUserByEmail, findUserById } from "../users/user.repository";
import { sendProjectInviteEmail } from "../../utils/email";
import {
  CreateProjectBody,
  InviteMemberBody,
  JoinProjectBody,
} from "./invite.validation";
import {
  createMember,
  createPendingMember,
  deletePendingMemberById,
  findMemberByProjectAndUser,
  findPendingMemberByProjectAndEmail,
  findProjectByJoinCode,
  findProjectById,
  insertProject,
} from "./invite.repository";

const generateProjectCode = (length: number = 6): string => {
  let code = "";
  const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * LETTERS.length);
    code += LETTERS[randomIndex];
  }

  return code;
};

const isUniqueConstraintError = (
  error: unknown,
  columnName: string,
): boolean => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    "detail" in error
  ) {
    const dbError = error as { code?: string; detail?: string };

    return (
      dbError.code === "23505" &&
      dbError.detail?.includes(`(${columnName})`) === true
    );
  }

  return false;
};

export const createProject = async (body: CreateProjectBody, managerId: string) => {
  const projectId = uuid();

  const projectData = {
    id: projectId,
    name: body.name,
    description: body.description,
    managerId,
  };

  while (true) {
    const code = generateProjectCode();

    try {
      const project = await insertProject({
        ...projectData,
        joinCode: code,
      });

      await createMember({
        id: uuid(),
        projectId: project.id,
        userId: managerId,
        role: "manager",
        designation: "Project Manager",
      });

      return project;
    } catch (error) {
      if (isUniqueConstraintError(error, "join_code")) {
        continue;
      }
      throw error;
    }
  }
};

export const inviteMember = async (
  body: InviteMemberBody,
  managerId: string,
) => {
  const project = await findProjectById(body.projectId);

  if (!project) {
    const error = new Error("Project not found") as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  if (project.managerId !== managerId) {
    const error = new Error("Only project manager can send invites") as Error & {
      statusCode?: number;
    };
    error.statusCode = 403;
    throw error;
  }

  const invitedUser = await findUserByEmail(body.email);
  const joinLink = `${env.FRONTEND_URL}/join-project?code=${project.joinCode}`;

  if (!invitedUser) {
    const signupLink = `${env.FRONTEND_URL}/signup`;

    const existingPendingMember = await findPendingMemberByProjectAndEmail(
      project.id,
      body.email,
    );

    if (existingPendingMember) {
      const error = new Error("Invitation already sent to this email") as Error & {
        statusCode?: number;
      };
      error.statusCode = 409;
      throw error;
    }

    await createPendingMember({
      id: uuid(),
      projectId: project.id,
      email: body.email,
      designation: body.designation,
      role: body.role,
    });

    await sendProjectInviteEmail({
      joinLink,
      projectName: project.name,
      recipientEmail: body.email,
      joinCode: project.joinCode,
      signupLink,
    });

    return {
      joinCode: project.joinCode,
      invitedUser: {
        email: body.email,
      },
      message:
        "Invitation email sent. User must sign up first and then join using the code.",
    };
  }

  if (invitedUser.id === managerId) {
    const error = new Error("Project manager cannot invite themselves") as Error & {
      statusCode?: number;
    };
    error.statusCode = 409;
    throw error;
  }

  const existingMember = await findMemberByProjectAndUser(project.id, invitedUser.id);

  if (existingMember) {
    const error = new Error("User already exists in this project") as Error & {
      statusCode?: number;
    };
    error.statusCode = 409;
    throw error;
  }

  const member = await createMember({
    id: uuid(),
    projectId: project.id,
    userId: invitedUser.id,
    designation: body.designation,
    role: body.role,
  });

  await sendProjectInviteEmail({
    joinLink,
    projectName: project.name,
    recipientEmail: invitedUser.email,
    joinCode: project.joinCode,
    recipientName: invitedUser.name,
  });

  return {
    memberId: member.id,
    joinCode: project.joinCode,
    invitedUser: {
      id: invitedUser.id,
      name: invitedUser.name,
      email: invitedUser.email,
    },
  };
};

export const joinProject = async (
  body: JoinProjectBody,
  userId: string,
) => {
  const project = await findProjectByJoinCode(body.joinCode);

  if (!project) {
    const error = new Error("Invalid joining code") as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  const user = await findUserById(userId);

  if (!user) {
    const error = new Error("User not found") as Error & { statusCode?: number };
    error.statusCode = 404;
    throw error;
  }

  const existingMember = await findMemberByProjectAndUser(project.id, userId);

  if (existingMember) {
    return {
      projectId: project.id,
      message: "User joined successfully",
    };
  }

  const pendingMember = await findPendingMemberByProjectAndEmail(
    project.id,
    user.email,
  );

  if (!pendingMember) {
    const error = new Error("You are not invited to this project") as Error & {
      statusCode?: number;
    };
    error.statusCode = 403;
    throw error;
  }

  await createMember({
    id: uuid(),
    projectId: project.id,
    userId,
    role: pendingMember.role,
    designation: pendingMember.designation,
  });

  await deletePendingMemberById(pendingMember.id);

  return {
    projectId: project.id,
    message: "User joined successfully",
  };
};
