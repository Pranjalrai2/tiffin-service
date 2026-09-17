import express from 'express';
import { body } from 'express-validator';
import { listPlans, createPlan, getPlanById, updatePlan, deletePlan } from '../controllers/planController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.get('/', protect, listPlans);
router.post(
  '/',
  protect,
  [
    body('name').notEmpty().withMessage('Plan name is required.'),
    body('pricePerMonth').isFloat({ min: 0 }).withMessage('Price must be a non-negative number.'),
  ],
  validateRequest,
  createPlan
);
router.get('/:id', protect, getPlanById);
router.put('/:id', protect, updatePlan);
router.delete('/:id', protect, deletePlan);

export default router;
