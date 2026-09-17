import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import User from './models/User.js';
import Plan from './models/Plan.js';
import Customer from './models/Customer.js';
import Subscription from './models/Subscription.js';
import Pause from './models/Pause.js';

dotenv.config();

async function seed() {
  await connectDB();

  await Promise.all([
    User.destroy({ where: {} }),
    Plan.destroy({ where: {} }),
    Customer.destroy({ where: {} }),
    Subscription.destroy({ where: {} }),
    Pause.destroy({ where: {} }),
  ]);

  const passwordHash = await bcrypt.hash('admin123', 10);

  const owner = await User.create({
    name: 'Owner Admin',
    email: 'admin@tiffintrack.com',
    passwordHash,
  });

  const annualPlan = await Plan.create({
    name: 'Classic Monthly',
    pricePerMonth: 4800,
    description: 'Weekday lunch plan with daily home-style tiffin.',
  });

  const premiumPlan = await Plan.create({
    name: 'Premium Monthly',
    pricePerMonth: 6200,
    description: 'Premium meal plan with additional variety.',
  });

  const customerOne = await Customer.create({
    name: 'Arjun Sharma',
    phone: '9876543210',
    address: 'Sector 12, Indore',
  });

  const customerTwo = await Customer.create({
    name: 'Meera Patel',
    phone: '9123456780',
    address: 'Madhur Nagar, Bhopal',
  });

  const subOne = await Subscription.create({
    customerId: customerOne.id,
    planId: annualPlan.id,
    startDate: '2026-09-01',
    isActive: true,
  });

  const subTwo = await Subscription.create({
    customerId: customerTwo.id,
    planId: premiumPlan.id,
    startDate: '2026-09-10',
    isActive: true,
  });

  await Pause.bulkCreate([
    {
      subscriptionId: subOne.id,
      startDate: '2026-09-12',
      endDate: '2026-09-15',
      reason: 'Travel',
    },
    {
      subscriptionId: subTwo.id,
      startDate: '2026-09-18',
      endDate: '2026-09-20',
      reason: 'Festive holiday',
    },
  ]);

  console.log('Seed complete');
  console.log({ owner, annualPlan, premiumPlan, customerOne, customerTwo, subOne, subTwo });
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
