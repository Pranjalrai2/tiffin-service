import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';
import Customer from './Customer.js';
import Subscription from './Subscription.js';

class Bill extends Model {}

Bill.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Customer,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    subscriptionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Subscription,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    month: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    totalWeekdays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    pausedDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    billableDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    ratePerDay: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    finalAmount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    generatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Bill',
    tableName: 'bills',
    timestamps: false,
  }
);

Bill.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Bill.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });

export default Bill;
