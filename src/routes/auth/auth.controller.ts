import { Router, Request, Response, NextFunction } from "express";
import { createUser } from "./auth.service";

const router = Router();

router.post('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await createUser({...req.body.user});
    res.status(201).json({ message: 'User created successfully', user: user });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({message: "test"})
})

export default router;