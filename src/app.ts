import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';

import * as middlewares from './middlewares.js';
import type MessageResponse from './interfaces/message-response.js';
import routes from './routes/routes.js';
import { setupSwagger } from './docs/swagger.js';

const app = express();

app.use(cors());
app.use(express.json());
setupSwagger(app);

app.use('/api', routes);

app.get('/', (req: Request, res: Response<MessageResponse>, next: NextFunction) => {
  try {
    if (req.query.fail === 'true') {
      throw new Error('Failed to build response');
    }

    res.json({ message: 'Hello from server' });
  } catch (error) {
    next(error);
  }
});

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
