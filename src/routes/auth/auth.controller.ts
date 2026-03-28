import { Router, Request, Response, NextFunction } from "express";
import type { Request as JWTRequest } from "express-jwt";
import { createUser, updateUser, getCurrentUser, login,  } from "./auth.service";
import auth from "./auth";

const router = Router();

/**
 * @openapi
 * /api/auth/users:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Register user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   username:
 *                     type: string
 *                   password:
 *                     type: string
 *     responses:
 *       201:
 *         description: User created
 */
router.post('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await createUser({...req.body.user});
    res.status(201).json({ message: 'User created successfully', user: user });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/auth/users/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   password:
 *                     type: string
 *     responses:
 *       200:
 *         description: Authenticated user with token
 */
router.post('/users/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await login(req.body.user);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

/**
 * @openapi
 * /api/auth/user:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Get current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user
 *       401:
 *         description: Unauthorized
 */
router.get('/user', auth.required, async (req: Request, res: Response, next: NextFunction) => {
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

/**
 * @openapi
 * /api/auth/user:
 *   put:
 *     tags:
 *       - Auth
 *     summary: Update current user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   username:
 *                     type: string
 *                   password:
 *                     type: string
 *     responses:
 *       200:
 *         description: Updated user
 *       401:
 *         description: Unauthorized
 */
router.put('/user', auth.required, async (req: Request, res: Response, next: NextFunction) => {
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
