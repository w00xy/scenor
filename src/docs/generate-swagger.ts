import path from "node:path";
import { fileURLToPath } from "node:url";

import swaggerAutogen from "swagger-autogen";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputFile = path.resolve(__dirname, "swagger-output.json");
const endpointsFiles = [path.resolve(__dirname, "../routes/auth/auth.controller.ts")];

const doc = {
  info: {
    title: "Scenor API",
    description: "Auto-generated API docs",
    version: "1.0.0",
  },
  host: "localhost:3000",
  basePath: "/",
  schemes: ["http"],
  tags: [
    {
      name: "Auth",
      description: "Authentication endpoints",
    },
  ],
  definitions: {
    RegisterUserRequest: {
      user: {
        email: "user@example.com",
        username: "w00xy",
        password: "strong-password",
      },
    },
    LoginRequest: {
      user: {
        email: "user@example.com",
        password: "strong-password",
      },
    },
    UpdateUserRequest: {
      user: {
        email: "new@example.com",
        username: "new-name",
        password: "new-password",
      },
    },
    AuthUser: {
      id: "uuid",
      email: "user@example.com",
      username: "w00xy",
      token: "jwt-token",
    },
  },
  securityDefinitions: {
    bearerAuth: {
      type: "apiKey",
      in: "header",
      name: "Authorization",
      description: "Use `Bearer <token>`",
    },
  },
};

await swaggerAutogen({ openapi: "3.0.0" })(outputFile, endpointsFiles, doc);
