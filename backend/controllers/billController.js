import Bill from '../models/Bill.js';
import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import Pause from '../models/Pause.js';
import { calculateMonthlyBill } from '../utils/billing.js';

export const generateBill = async (req, res, next) => {
  try {
    const { subscriptionId, monthYear } = req.body;

    const subscription = await Subscription.findById(subscriptionId).populate('planId');
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    const plan = await Plan.findById(subscription.planId._id || subscription.planId);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    const pauses = await Pause.find({ subscriptionId }).sort({ startDate: 1 });
    const result = calculateMonthlyBill({
      planPrice: Number(plan.pricePerMonth),
      subscriptionStartDate: subscription.startDate,
      monthYear,
      pauses,
    });

    const bill = await Bill.create({
      customerId: subscription.customerId,
      subscriptionId: subscription._id,
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
        ...bill.toObject(),
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
    const filter = customerId ? { customerId } : {};
    const bills = await Bill.find(filter).sort({ year: -1, month: -1 }).populate('customerId');
    res.json({ success: true, data: bills });
  } catch (error) {
    next(error);
  }
};

export const getBillById = async (req, res, next) => {
  try {
    const bill = await Bill.findById(req.params.id).populate('customerId').populate('subscriptionId');
    if (!bill) {
      return res.status(404).json({ success: false, message: 'Bill not found.' });
    }
    res.json({ success: true, data: bill });
  } catch (error) {
    next(error);
  }
};
