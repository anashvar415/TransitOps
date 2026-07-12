import { Router } from 'express';
import { login, refresh, logout } from '../controllers/auth.controller';
import { validateBody } from '../middleware/validation.middleware';
import { loginSchema } from '../validation/schemas';

const router = Router();

router.post('/login', validateBody(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

export default router;
