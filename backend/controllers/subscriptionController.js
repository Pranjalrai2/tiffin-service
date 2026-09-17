import Subscription from '../models/Subscription.js';
import Customer from '../models/Customer.js';
import Plan from '../models/Plan.js';
import Pause from '../models/Pause.js';
import { getSubscriptionStatus, formatDateOnly, parseDate, isWithinRange } from '../utils/billing.js';

export const createSubscription = async (req, res, next) => {
  try {
    const { customerId, planId, startDate } = req.body;

    const customer = await Customer.findById(customerId);
    const plan = await Plan.findById(planId);
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found.' });
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found.' });

    const existing = await Subscription.findOne({ customerId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Customer already has a subscription.' });
    }

    const subscription = await Subscription.create({ customerId, planId, startDate, isActive: true });
    res.status(201).json({ success: true, data: subscription });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionDetails = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.subscriptionId).populate('planId').populate('customerId');
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    const pauses = await Pause.find({ subscriptionId: subscription._id }).sort({ startDate: 1 });
    const status = getSubscriptionStatus(subscription.toObject(), pauses, new Date());

    res.json({
      success: true,
      data: {
        ...subscription.toObject(),
        plan: subscription.planId,
        customer: subscription.customerId,
        pauses,
        status,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const pauseSubscription = async (req, res, next) => {
  try {
    const { startDate, endDate, reason } = req.body;
    const subscriptionId = req.params.subscriptionId;

    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    if (startDate > endDate) {
      return res.status(400).json({ success: false, message: 'Pause end date cannot be before start date.' });
    }

    const conflicts = await Pause.find({
      subscriptionId,
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    });

    if (conflicts.length > 0) {
      return res.status(400).json({ success: false, message: 'This pause overlaps with an existing pause range.' });
    }

    const pause = await Pause.create({
      subscriptionId,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({ success: true, data: pause });
  } catch (error) {
    next(error);
  }
};

export const resumeSubscription = async (req, res, next) => {
  try {
    const subscriptionId = req.params.subscriptionId;
    const { date } = req.body;
    const resumeDate = date || formatDateOnly(new Date());

    const activePause = await Pause.findOne({
      subscriptionId,
      endDate: { $gte: resumeDate },
    }).sort({ startDate: -1 });

    if (!activePause) {
      return res.status(400).json({ success: false, message: 'No active pause found to resume.' });
    }

    activePause.endDate = resumeDate;
    await activePause.save();

    res.json({ success: true, data: activePause });
  } catch (error) {
    next(error);
  }
};

export const getSubscriptionStatusOnly = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.subscriptionId);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found.' });
    }

    const pauses = await Pause.find({ subscriptionId: subscription._id });
    const status = getSubscriptionStatus(subscription.toObject(), pauses, new Date());

    res.json({ success: true, status });
  } catch (error) {
    next(error);
  }
};
