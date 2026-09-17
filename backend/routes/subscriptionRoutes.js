import express from 'express';
import { body } from 'express-validator';
import { createSubscription, getSubscriptionDetails, pauseSubscription, resumeSubscription, getSubscriptionStatusOnly } from '../controllers/subscriptionController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('customerId').notEmpty().withMessage('Customer ID is required.'),
    body('planId').notEmpty().withMessage('Plan ID is required.'),
    body('startDate').notEmpty().withMessage('Start date is required.'),
  ],
  validateRequest,
  createSubscription
);
router.get('/:subscriptionId', protect, getSubscriptionDetails);
router.get('/:subscriptionId/status', protect, getSubscriptionStatusOnly);
router.post(
  '/:subscriptionId/pause',
  protect,
  [
    body('startDate').notEmpty().withMessage('Pause start date is required.'),
    body('endDate').notEmpty().withMessage('Pause end date is required.'),
  ],
  validateRequest,
  pauseSubscription
);
router.post('/:subscriptionId/resume', protect, resumeSubscription);

export default router;
