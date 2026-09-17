import { Op } from 'sequelize';
import Customer from '../models/Customer.js';
import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import Pause from '../models/Pause.js';
import { getSubscriptionStatus, formatDateOnly } from '../utils/billing.js';

const serializeCustomerWithStatus = async (customer) => {
  const currentSubscription = await Subscription.findOne({
    where: { customerId: customer.id },
    order: [['createdAt', 'DESC']],
    include: [{ model: Plan, as: 'plan' }],
  });

  const pauses = currentSubscription ? await Pause.findAll({ where: { subscriptionId: currentSubscription.id }, order: [['startDate', 'ASC']] }) : [];
  const status = currentSubscription ? getSubscriptionStatus(currentSubscription.toJSON(), pauses, new Date()) : 'Inactive';

  return {
    ...customer.toJSON(),
    currentPlan: currentSubscription?.plan ? { id: currentSubscription.plan.id, name: currentSubscription.plan.name } : null,
    status,
    subscriptionId: currentSubscription?.id || null,
    startDate: currentSubscription?.startDate || null,
  };
};

export const getCustomers = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = String(req.query.search || '').trim();
    const sortKey = String(req.query.sort || 'createdAt');
    const direction = String(req.query.direction || 'desc');

    const where = search ? { phone: { [Op.like]: `%${search}%` } } : {};
    const total = await Customer.count({ where });

    if (sortKey === 'status') {
      let customers = await Customer.findAll({ where });
      const items = await Promise.all(customers.map((customer) => serializeCustomerWithStatus(customer)));

      items.sort((a, b) => {
        const first = a.status === 'Active' ? 1 : 0;
        const second = b.status === 'Active' ? 1 : 0;
        const comparison = first - second;
        return direction === 'asc' ? comparison : -comparison;
      });

      const paginated = items.slice(offset, offset + limit);
      return res.json({
        success: true,
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
        data: paginated,
      });
    }

    const customers = await Customer.findAll({
      where,
      order: [[sortKey, direction === 'asc' ? 'ASC' : 'DESC']],
      limit,
      offset,
    });

    const items = await Promise.all(customers.map((customer) => serializeCustomerWithStatus(customer)));

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
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const subscription = await Subscription.findOne({
      where: { customerId: customer.id },
      order: [['createdAt', 'DESC']],
      include: [{ model: Plan, as: 'plan' }],
    });

    const pauses = subscription ? await Pause.findAll({ where: { subscriptionId: subscription.id }, order: [['startDate', 'ASC']] }) : [];
    const status = subscription ? getSubscriptionStatus(subscription.toJSON(), pauses, new Date()) : 'Inactive';

    res.json({
      success: true,
      data: {
        ...customer.toJSON(),
        subscription: subscription
          ? {
              ...subscription.toJSON(),
              plan: subscription.plan,
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
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    await customer.update(req.body);
    res.json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByPk(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const customerSubscriptions = await Subscription.findAll({ where: { customerId: customer.id }, attributes: ['id'] });
    const subscriptionIds = customerSubscriptions.map((subscription) => subscription.id);

    if (subscriptionIds.length > 0) {
      await Pause.destroy({ where: { subscriptionId: subscriptionIds } });
    }

    await Subscription.destroy({ where: { customerId: customer.id } });
    await customer.destroy();

    res.json({ success: true, message: 'Customer deleted.' });
  } catch (error) {
    next(error);
  }
};
