import path from 'node:path';
import fs from 'node:fs';
import { Sequelize } from 'sequelize';

const dbPath = path.resolve(process.cwd(), process.env.DATABASE_PATH || './data/tiffin.sqlite');
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false,
});

export const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`SQLite connected: ${dbPath}`);
    await sequelize.sync();
  } catch (error) {
    console.error('SQLite connection failed:', error.message);
    process.exit(1);
  }
};

export default sequelize;
