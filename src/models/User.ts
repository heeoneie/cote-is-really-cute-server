import mongoose, { Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
    nickname: string;
    email: string;
    password: string;
    rivals: string[];
    levelId: mongoose.Types.ObjectId;
    experience: number;
    attendanceDates: string[];
    comparePassword(candidatePassword: string): Promise<boolean>;
}
const userSchema = new mongoose.Schema({
    nickName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rivals: [{ type: String }],
    levelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', },
    experience: { type: Number, default: 0, },
    attendanceDates: [{ type: String }],
});

userSchema.pre<IUser>('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err instanceof Error ? err : new Error('Unknown error occurred'));
    }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
