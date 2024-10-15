import mongoose, { Document, model } from 'mongoose';

interface ILevel extends Document {
    level: number;
    requiredExperience: number;
}
const levelSchema = new mongoose.Schema({
    level: {
        type: Number,
        required: true,
        unique: true,
    },
    requiredExperience: {
        type: Number,
        required: true,
    },
});

const Level = model<ILevel>('Level', levelSchema);

export default Level;
