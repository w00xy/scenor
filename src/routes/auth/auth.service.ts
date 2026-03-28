import bcrypt from "bcryptjs";

import { RegisterUserInput } from "./auth.models"
import prisma from "../../../prisma/prisma-client.js";
import HttpException from '../../interfaces/http-exception.js';
import generateToken from "./token.utils.js";
import { User } from "./auth.models";

const checkUserUniqueness = async (email: string, username: string) => {
  const existingUserByEmail = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
    },
  });

  const existingUserByUsername = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      id: true,
    },
  });

  if (existingUserByEmail || existingUserByUsername) {
    throw new HttpException(422, {
      errors: {
        ...(existingUserByEmail ? { email: ['has already been taken'] } : {}),
        ...(existingUserByUsername ? { username: ['has already been taken'] } : {}),
      },
    });
  }
};

export const createUser = async (input: RegisterUserInput) => {
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const username = input.username?.trim() || null;

  if (!email) {
    throw new HttpException(422, { errors: { email: ["can't be blank"] } });
  }

  if (!username) {
    throw new HttpException(422, { errors: { username: ["can't be blank"] } });
  }

  await checkUserUniqueness(email, username);

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      username,
      email,
      passwordHash: hashedPassword
    },
    select: {
      id: true,
      email: true,
      username: true,
      createdAt: true,
    },
  })

  return user;
}

export const login = async (userPayload: any) => {
  const email = userPayload.email?.trim();
  const password = userPayload.password?.trim();

  if (!email) {
    throw new HttpException(422, { errors: { email: ["can't be blank"] } });
  }

  if (!password) {
    throw new HttpException(422, { errors: { password: ["can't be blank"] } });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      username: true,
      passwordHash: true,
    },
  });

  if (user) {
    const match = await bcrypt.compare(password, user.passwordHash);

    if (match) {
      return {
        email: user.email,
        username: user.username,
        token: generateToken(user.id),
      };
    }
  }

  throw new HttpException(403, {
    errors: {
      'email or password': ['is invalid'],
    },
  });
};

export const getCurrentUser = async (id: string) => {
  const user = (await prisma.user.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      email: true,
      username: true,
    },
  })) as User;

  return {
    ...user,
    token: generateToken(user.id),
  };
};

export const updateUser = async (userPayload: any, id: string) => {
  const { email, username, password } = userPayload;
  let hashedPassword;

  if (password) {
    hashedPassword = await bcrypt.hash(password, 10);
  }

  const user = await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      ...(email ? { email } : {}),
      ...(username ? { username } : {}),
      ...(password ? { passwordHash: hashedPassword } : {}),
    },
    select: {
      id: true,
      email: true,
      username: true,
    },
  });

  return {
    ...user,
    token: generateToken(user.id),
  };
};