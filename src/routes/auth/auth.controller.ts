import { Router, Request, Response, NextFunction } from "express";
import type { Request as JWTRequest } from "express-jwt";
import { createUser, updateUser, getCurrentUser, login,  } from "./auth.service";
import auth from "./auth";

const router = Router();

router.post('/users', async (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Register user'
  // #swagger.requestBody = { required: true, content: { "application/json": { schema: { $ref: "#/definitions/RegisterUserRequest" } } } }
  // #swagger.responses[201] = { description: 'User created' }
  try {
    const user = await createUser({...req.body.user});
    res.status(201).json({ message: 'User created successfully', user: user });
  } catch (error) {
    next(error);
  }
});

router.post('/users/login', async (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Login'
  // #swagger.requestBody = { required: true, content: { "application/json": { schema: { $ref: "#/definitions/LoginRequest" } } } }
  // #swagger.responses[200] = { description: 'Authenticated user with token' }
  try {
    const user = await login(req.body.user);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.get('/user', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Get current user'
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.responses[200] = { description: 'Current user' }
  // #swagger.responses[401] = { description: 'Unauthorized' }
  try {
    const authReq = req as JWTRequest<{ id?: string }>;
    const userId = authReq.auth?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await getCurrentUser(userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.put('/user', auth.required, async (req: Request, res: Response, next: NextFunction) => {
  // #swagger.tags = ['Auth']
  // #swagger.summary = 'Update current user'
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.requestBody = { required: true, content: { "application/json": { schema: { $ref: "#/definitions/UpdateUserRequest" } } } }
  // #swagger.responses[200] = { description: 'Updated user' }
  // #swagger.responses[401] = { description: 'Unauthorized' }
  try {
    const authReq = req as JWTRequest<{ id?: string }>;
    const userId = authReq.auth?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await updateUser(req.body.user, userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
