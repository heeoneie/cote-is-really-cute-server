import { DataSource } from 'typeorm';
import { User } from '../entity/User.js';
import { Rival } from '../entity/Rival.js';
import { Level } from '../entity/Level.js';
import { Attendance } from '../entity/Attendance.js';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [User, Rival, Level, Attendance],
  synchronize: true,
});

const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log('MySQL connected!');
  } catch (err) {
    console.error(
      err instanceof Error ? err.message : 'Unknown error occurred',
    );
    process.exit(1);
  }
};

export default connectDB;
