import { Router } from 'express';
import router from './auth/auth.controller.js';

const api = Router()
  .use('/auth', router);


export default api;