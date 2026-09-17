import express from 'express';
import { body } from 'express-validator';
import { generateBill, listBills, getBillById } from '../controllers/billController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.get('/', protect, listBills);
router.post(
  '/generate',
  protect,
  [
    body('subscriptionId').notEmpty().withMessage('Subscription ID is required.'),
    body('monthYear').matches(/^\d{4}-\d{2}$/).withMessage('monthYear must be YYYY-MM format.'),
  ],
  validateRequest,
  generateBill
);
router.get('/:id', protect, getBillById);

export default router;
