import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { v7 as uuidv7 } from "uuid";
import { env } from "../../config/env";
import { createUser, findUserByEmail, findUserByRefreshToken, updateRefreshToken } from "../users/user.repository";
import { LoginBody, RegisterBody } from "./auth.validation";

export const registerUser = async (body: RegisterBody) => {
  const existingUser = await findUserByEmail(body.email);

  if (existingUser) {
    const error = new Error("User already exists") as Error & {statusCode?: number};
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(body.password, 10);

  const userId = uuidv7();

  const accessToken = jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  const user = await createUser({
    id: userId,
    name: body.name,
    email: body.email,
    password: hashedPassword,
    refreshToken,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
};


export const loginUser = async(body: LoginBody) => {
  const existingUser = await findUserByEmail(body.email);

  if(!existingUser){
    const error = new Error("Invalid Email or Passwords") as Error & {statusCode?:number};

    error.statusCode=400;
    throw error;
  }

  const isValidPassword = await bcrypt.compare(
    body.password,
    existingUser.password
  );

  if(!isValidPassword){
    const error = new Error("Invalid Email or Passwords") as Error & {statusCode?:number};

    error.statusCode=400;
    throw error;
  }

  const userId = existingUser.id;

  const accessToken = jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  await updateRefreshToken(userId, refreshToken)

  return {
    accessToken,
    refreshToken
  }

}

export const logoutUser = async(refreshToken: string) => {
  const user = await findUserByRefreshToken(refreshToken);

  if(!user){
    return;
  }

  await updateRefreshToken(user.id, null);
}

export const rotateRefreshToken = async(oldRefreshToken?: string) => {
  if (!oldRefreshToken) {
    const err = new Error("Refresh token missing") as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode = 401;
    err.code = "REFRESH_TOKEN_MISSING";
    throw err;
  }

  try {
    jwt.verify(
      oldRefreshToken,
      env.JWT_REFRESH_SECRET
    ) as JwtPayload;
  } catch (error) {
    const err = new Error(
      error instanceof jwt.TokenExpiredError
        ? "Refresh token expired"
        : "Invalid refresh token"
    ) as Error & { statusCode?: number; code?: string };
    err.statusCode = 401;
    err.code =
      error instanceof jwt.TokenExpiredError
        ? "REFRESH_TOKEN_EXPIRED"
        : "INVALID_REFRESH_TOKEN";
    throw err;
  }

  const user = await findUserByRefreshToken(oldRefreshToken);

  if(!user){
    const err = new Error("Invalid refresh token") as Error & {
      statusCode?: number;
      code?: string;
    };
    err.statusCode=401;
    err.code = "INVALID_REFRESH_TOKEN";
    throw err;
  }

  const userId = user.id;

  const accessToken = jwt.sign({ userId }, env.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  await updateRefreshToken(userId, refreshToken)

  return{
    accessToken,
    refreshToken
  }

}
