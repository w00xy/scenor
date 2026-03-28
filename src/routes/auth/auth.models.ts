export interface RegisterUserBody {
  email?: string;
  password?: string;
  username?: string;
}

export interface RegisterUserInput {
  email: string;
  password: string;
  username?: string;
}

export interface RegisteredUser {
  id: string;
  email: string;
  username: string | null;
  createdAt: Date;
}

export interface RegisterUserResponse {
  user: RegisteredUser;
}

export class AuthServiceError extends Error {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "AuthServiceError";
    this.statusCode = statusCode;
  }
}

export interface User {
  id: string;
  email: string;
  username: string | null;
  createdAt: Date;
  updatedAt: Date;
  passwordHash: string;
  role: string;
}