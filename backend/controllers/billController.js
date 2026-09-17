import Bill from '../models/Bill.js';
import Subscription from '../models/Subscription.js';
import Customer from '../models/Customer.js';
import Plan from '../models/Plan.js';
import Pause from '../models/Pause.js';
import { calculateMonthlyBill } from '../utils/billing.js';

export const generateBill = async (req, res, next) => {
  try {
    const { subscriptionId, monthYear } = req.body;

    const subscription = await Subscription.findByPk(subscriptionId, { include: [{ model: Plan, as: 'plan' }] });
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    const plan = subscription.plan;
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    const pauses = await Pause.findAll({ where: { subscriptionId }, order: [['startDate', 'ASC']] });
    const result = calculateMonthlyBill({
      planPrice: Number(plan.pricePerMonth),
      subscriptionStartDate: subscription.startDate,
      monthYear,
      pauses,
    });

    const bill = await Bill.create({
      customerId: subscription.customerId,
      subscriptionId: subscription.id,
      month: result.month,
      year: result.year,
      totalWeekdays: result.totalWeekdays,
      pausedDays: result.pausedDays,
      billableDays: result.billableDays,
      ratePerDay: result.ratePerDay,
      finalAmount: result.finalAmount,
    });

    res.status(201).json({
      success: true,
      data: {
        ...bill.toJSON(),
        breakdown: result,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listBills = async (req, res, next) => {
  try {
    const { customerId } = req.query;
    const where = customerId ? { customerId } : {};
    const bills = await Bill.findAll({
      where,
      order: [['year', 'DESC'], ['month', 'DESC']],
      include: [{ model: Customer, as: 'customer' }],
    });
    res.json({ success: true, data: bills });
  } catch (error) {
    next(error);
  }
};

export const getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Subscription, as: 'subscription' },
      ],
    });
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }
    res.json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};
