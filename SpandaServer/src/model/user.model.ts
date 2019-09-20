import * as mongoose from "mongoose";
interface IUser extends mongoose.Document {
    username: string;
    allowance: number;
    isAllowanceReady: boolean;
    email: string;
    phone: string;
    isAutoUpdateEnabled: boolean;
    bankConnections: [number];
}

const UserSchema = new mongoose.Schema({
    username: { type: String, unique: true },
    allowance: Number,
    isAllowanceReady: Boolean,
    email: String,
    phone: String,
    isAutoUpdateEnabled: Boolean,
    bankConnections: [Number]
});

const UserModel = mongoose.model<IUser>('User', UserSchema);

function GetUserByUsername(username: string): Promise<any> {
    return new Promise((resolve, reject) => {
        UserModel.findOne({ 'username': username }, (err, user) => {
            if(err) {
                reject(err);
            }
            else {
                resolve(user);
            }
        });
    });
}

function CreateUserInDB(id: string, email: string, phone: string, isAutoUpdateEnabled: boolean): Promise<any> {
    return new Promise((resolve, reject) => {
        UserModel.create({ username: id,
            allowance: 0,
            isAllowanceReady: false,
            email: email,
            phone: phone,
            isAutoUpdateEnabled: isAutoUpdateEnabled }, function (err, user) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(user);
                }
            });
    });
}

export { GetUserByUsername, CreateUserInDB }