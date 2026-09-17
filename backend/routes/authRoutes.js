import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser, getCurrentUser } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').isLength({ min: 2 }).withMessage('Name is required.'),
    body('email').isEmail().withMessage('Email is invalid.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.'),
  ],
  validateRequest,
  registerUser
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email is invalid.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  validateRequest,
  loginUser
);

router.get('/me', protect, getCurrentUser);

export default router;
