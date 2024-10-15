import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string);
        console.log('MongoDB connected...');
    } catch (err) {
        console.error(err instanceof Error ? err.message : 'Unknown error occurred');
        process.exit(1);
    }
};

export default connectDB;
