import express from 'express';
import { login, createUser } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', protect, adminOnly, createUser);

export default router;
