import * as mongoose from "mongoose";
interface IUser extends mongoose.Document {
    username: string;
    allowance: number;
    email: string;
    phone: string;
    isAutoUpdateEnabled: boolean;
    bankConnections: [number];
}

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    allowance: Number,
    email: String,
    phone: String,
    isAutoUpdateEnabled: Boolean,
    bankConnections: [Number]
});

const UserModel = mongoose.model<IUser>('User', UserSchema);

export { UserModel }