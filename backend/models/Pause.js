import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db.js';
import Subscription from './Subscription.js';

class Pause extends Model {}

Pause.init(
  {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
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
    startDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Pause',
    tableName: 'pauses',
    timestamps: false,
  }
);

Pause.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });

export default Pause;
