import Plan from '../models/Plan.js';

export const listPlans = async (req, res, next) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (error) {
    next(error);
  }
};

export const createPlan = async (req, res, next) => {
  try {
    const { name, pricePerMonth, description } = req.body;
    const plan = await Plan.create({ name, pricePerMonth, description });
    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

export const getPlanById = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }
    res.json({ success: true, data: plan });
  } catch (error) {
    next(error);
  }
};

export const deletePlan = async (req, res, next) => {
  try {
    const plan = await Plan.findById(req.params.id);
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Plan not found.' });
    }

    await plan.deleteOne();
    res.json({ success: true, message: 'Plan deleted.' });
  } catch (error) {
    next(error);
  }
};
