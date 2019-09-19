import * as mongoose from "mongoose";
interface IBankAccount extends mongoose.Document {
    id: number;
    bankConnectionId: number;
    accountName: string;
    iban: string;
    accountCurrency: string;
}

const BankAccountSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    bankConnectionId: Number,
    accountName: String,
    iban: String,
    accountCurrency: String
});

const BankAccountModel = mongoose.model<IBankAccount>('BankAccount', BankAccountSchema);

export { BankAccountModel }