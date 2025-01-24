import { DataSource } from 'typeorm';
import { User } from '../entity/User';
import { Rival } from '../entity/Rival';
import { Level } from '../entity/Level';
import { Attendance } from '../entity/Attendance';

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
