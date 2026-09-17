import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Plan from './models/Plan.js';
import Customer from './models/Customer.js';
import Subscription from './models/Subscription.js';
import Pause from './models/Pause.js';

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tiffintrack';

async function seed() {
  await mongoose.connect(mongoUri);

  await Promise.all([
    User.deleteMany({}),
    Plan.deleteMany({}),
    Customer.deleteMany({}),
    Subscription.deleteMany({}),
    Pause.deleteMany({}),
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
    customerId: customerOne._id,
    planId: annualPlan._id,
    startDate: '2026-09-01',
    isActive: true,
  });

  const subTwo = await Subscription.create({
    customerId: customerTwo._id,
    planId: premiumPlan._id,
    startDate: '2026-09-10',
    isActive: true,
  });

  await Pause.insertMany([
    {
      subscriptionId: subOne._id,
      startDate: '2026-09-12',
      endDate: '2026-09-15',
      reason: 'Travel',
    },
    {
      subscriptionId: subTwo._id,
      startDate: '2026-09-18',
      endDate: '2026-09-20',
      reason: 'Festive holiday',
    },
  ]);

  console.log('Seed complete');
  console.log({ owner, annualPlan, premiumPlan, customerOne, customerTwo, subOne, subTwo });
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
