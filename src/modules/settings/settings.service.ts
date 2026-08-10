import bcrypt from "bcrypt";
import * as settingsRepository from "./settings.repository";
import {
  UpdatePasswordBody,
  UpdateProfileBody,
  UpdateProjectBody,
} from "./settings.validation";

type AppError = Error & { statusCode?: number };

const createError = (message: string, statusCode: number): AppError => {
  const error = new Error(message) as AppError;
  error.statusCode = statusCode;
  return error;
};

const hasField = <T extends object>(body: T, key: keyof T) =>
  Object.prototype.hasOwnProperty.call(body, key);

const assertProjectViewer = async (projectId: string, userId: string) => {
  const project = await settingsRepository.findProjectById(projectId);

  if (!project) {
    throw createError("Project not found", 404);
  }

  const member = await settingsRepository.findMemberByProjectAndUser(
    projectId,
    userId,
  );

  // Project settings can be viewed by the manager and anyone recorded as a project member.
  if (project.managerId !== userId && !member) {
    throw createError(
      "You are not allowed to view this project",
      403,
    );
  }

  return { project, member };
};

const assertProjectManager = async (projectId: string, userId: string) => {
  const project = await settingsRepository.findProjectById(projectId);

  if (!project) {
    throw createError("Project not found", 404);
  }

  if (project.managerId !== userId) {
    throw createError(
      "Only project manager can update project settings",
      403,
    );
  }

  return project;
};

export const getProfile = async (userId: string) => {
  const user = await settingsRepository.findUserById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  let designation: string | null = null;

  if (user.lastUsedProjectId) {
    const member = await settingsRepository.findMemberByProjectAndUser(
      user.lastUsedProjectId,
      userId,
    );
    designation = member?.designation ?? null;
  }

  return {
    name: user.name,
    email: user.email,
    designation,
  };
};

export const updateProfile = async (
  body: UpdateProfileBody,
  userId: string,
) => {
  const user = await settingsRepository.findUserById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  const updates: Parameters<typeof settingsRepository.updateUserById>[1] = {};

  if (hasField(body, "name")) updates.name = body.name;

  if (hasField(body, "email") && body.email !== user.email) {
    const existingUser = await settingsRepository.findUserByEmail(
      body.email as string,
    );

    if (existingUser && existingUser.id !== userId) {
      throw createError("Email is already in use", 409);
    }

    updates.email = body.email;
  }

  if (Object.keys(updates).length > 0) {
    await settingsRepository.updateUserById(userId, updates);
  }

  if (hasField(body, "designation")) {
    if (!user.lastUsedProjectId) {
      throw createError("No active project to update designation for", 404);
    }

    const member = await settingsRepository.findMemberByProjectAndUser(
      user.lastUsedProjectId,
      userId,
    );

    if (!member) {
      throw createError("You are not a member of the active project", 404);
    }

    await settingsRepository.updateMemberById(member.id, {
      designation: body.designation,
    });
  }

  return getProfile(userId);
};

export const updatePassword = async (
  body: UpdatePasswordBody,
  userId: string,
) => {
  const user = await settingsRepository.findUserById(userId);

  if (!user) {
    throw createError("User not found", 404);
  }

  const isValidPassword = await bcrypt.compare(
    body.currentPassword,
    user.password,
  );

  if (!isValidPassword) {
    throw createError("Invalid Email or Passwords", 401);
  }

  const hashedPassword = await bcrypt.hash(body.newPassword, 10);
  await settingsRepository.updateUserById(userId, {
    password: hashedPassword,
  });

  return { message: "Password updated successfully" };
};

export const getProjectDetails = async (projectId: string, userId: string) => {
  const { project } = await assertProjectViewer(projectId, userId);

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    type: project.type,
  };
};

export const updateProjectDetails = async (
  body: UpdateProjectBody,
  userId: string,
) => {
  await assertProjectManager(body.projectId, userId);

  const updates: Parameters<typeof settingsRepository.updateProjectById>[1] =
    {};

  if (hasField(body, "name")) updates.name = body.name;
  if (hasField(body, "description")) updates.description = body.description;
  if (hasField(body, "type")) updates.type = body.type;

  if (Object.keys(updates).length > 0) {
    await settingsRepository.updateProjectById(body.projectId, updates);
  }

  return getProjectDetails(body.projectId, userId);
};
