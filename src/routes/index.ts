import { Router, Request, Response } from 'express';
import userRoutes from '../user/user.routes';

const router = Router();

router.use('/', userRoutes);

router.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Welcome to Hopin API' });
});

router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default router;
