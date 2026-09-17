import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';
import Customer from './Customer.js';
import Plan from './Plan.js';

class Subscription extends Model {}

Subscription.init(
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
    planId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Plan,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    startDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions',
    timestamps: false,
  }
);

Subscription.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Subscription.belongsTo(Plan, { foreignKey: 'planId', as: 'plan' });

export default Subscription;
