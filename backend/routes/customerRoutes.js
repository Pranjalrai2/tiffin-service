import express from 'express';
import { body } from 'express-validator';
import { getCustomers, createCustomer, getCustomerById, updateCustomer, deleteCustomer } from '../controllers/customerController.js';
import { protect } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validate.js';

const router = express.Router();

router.get('/', protect, getCustomers);
router.post(
  '/',
  protect,
  [
    body('name').notEmpty().withMessage('Customer name is required.'),
    body('phone').notEmpty().withMessage('Phone is required.'),
  ],
  validateRequest,
  createCustomer
);
router.get('/:id', protect, getCustomerById);
router.put('/:id', protect, updateCustomer);
router.delete('/:id', protect, deleteCustomer);

export default router;
