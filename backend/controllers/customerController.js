import Customer from '../models/Customer.js';
import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import Pause from '../models/Pause.js';
import { getSubscriptionStatus, formatDateOnly } from '../utils/billing.js';

export const getCustomers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = String(req.query.search || '').trim();
    const sortKey = String(req.query.sort || 'createdAt');
    const direction = String(req.query.direction || 'desc');
    const sortValue = direction === 'asc' ? 1 : -1;

    const query = {};
    if (search) {
      query.phone = { $regex: search, $options: 'i' };
    }

    const total = await Customer.countDocuments(query);
    let customers = await Customer.find(query);

    if (sortKey === 'status') {
      const items = await Promise.all(
        customers.map(async (customer) => {
          const currentSubscription = await Subscription.findOne({ customerId: customer._id }).sort({ createdAt: -1 }).populate('planId');
          const pauses = currentSubscription ? await Pause.find({ subscriptionId: currentSubscription._id }) : [];
          const status = currentSubscription ? getSubscriptionStatus(currentSubscription.toObject(), pauses, new Date()) : 'Inactive';

          return {
            ...customer.toObject(),
            currentPlan: currentSubscription?.planId ? { id: currentSubscription.planId._id, name: currentSubscription.planId.name } : null,
            status,
            subscriptionId: currentSubscription?._id || null,
            startDate: currentSubscription?.startDate || null,
          };
        })
      );

      items.sort((a, b) => {
        const first = a.status === 'Active' ? 1 : 0;
        const second = b.status === 'Active' ? 1 : 0;
        const comparison = first - second;
        return direction === 'asc' ? comparison : -comparison;
      });

      const paginated = items.slice(skip, skip + limit);

      return res.json({
        success: true,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
        data: paginated,
      });
    }

    customers = await Customer.find(query)
      .sort({ [sortKey]: sortValue })
      .skip(skip)
      .limit(limit);

    const items = await Promise.all(
      customers.map(async (customer) => {
        const currentSubscription = await Subscription.findOne({ customerId: customer._id }).sort({ createdAt: -1 }).populate('planId');
        const pauses = currentSubscription ? await Pause.find({ subscriptionId: currentSubscription._id }) : [];
        const status = currentSubscription ? getSubscriptionStatus(currentSubscription.toObject(), pauses, new Date()) : 'Inactive';

        return {
          ...customer.toObject(),
          currentPlan: currentSubscription?.planId ? { id: currentSubscription.planId._id, name: currentSubscription.planId.name } : null,
          status,
          subscriptionId: currentSubscription?._id || null,
          startDate: currentSubscription?.startDate || null,
        };
      })
    );

    res.json({
      success: true,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit) || 1,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

export const createCustomer = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;
    const customer = await Customer.create({ name, phone, address });
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const subscription = await Subscription.findOne({ customerId: customer._id }).sort({ createdAt: -1 }).populate('planId');
    const pauses = subscription ? await Pause.find({ subscriptionId: subscription._id }).sort({ startDate: 1 }) : [];
    const status = subscription ? getSubscriptionStatus(subscription.toObject(), pauses, new Date()) : 'Inactive';

    res.json({
      success: true,
      data: {
        ...customer.toObject(),
        subscription: subscription
          ? {
              ...subscription.toObject(),
              plan: subscription.planId,
              pauses,
              status,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await Subscription.deleteMany({ customerId: customer._id });
    await Pause.deleteMany({ subscriptionId: { $in: await Subscription.find({ customerId: customer._id }).select('_id') } });
    await customer.deleteOne();

    res.json({ success: true, message: 'Customer deleted.' });
  } catch (error) {
    next(error);
  }
};
