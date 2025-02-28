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

const connectDB = async (): Promise<void> => {
  const maxRetries = 5;
  let retries = 0;
  try {
    while (retries < maxRetries) {
      try {
        await AppDataSource.initialize();
        console.log('MySQL connected!');
        return;
      } catch (error) {
        retries++;
        console.log(`Connection attempt ${retries} failed. Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
    throw new Error('Failed to connect to database after multiple retries');
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Unknown error occurred';
    console.error(`Database connection failed: ${errorMessage}`);
    if (process.env.NODE_ENV === 'production') {
      setTimeout(() => {
        console.log('Retrying database connection...');
        connectDB();
      }, 5000);
    } else process.exit(1);
  }
};

export default connectDB;
