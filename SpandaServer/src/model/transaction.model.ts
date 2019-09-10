import * as mongoose from "mongoose";
interface ITransaction extends mongoose.Document {
    id: number;
    accountId: number;
    amount: number;
    bookingDate: Date;
    purpose: string;
    counterpartName: string;
    counterpartAccountNumber: string;
    counterpartIban: string;
    counterpartBlz: string;
    counterpartBic: string;
    counterpartBankName: string;
}

const TransactionSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    accountId: Number,
    amount: Number,
    bookingDate: Date,
    purpose: String,
    counterpartName: String,
    counterpartAccountNumber: String,
    counterpartIban: String,
    counterpartBlz: String,
    counterpartBic: String,
    counterpartBankName: String
});

const TransactionModel = mongoose.model<ITransaction>('Transaction', TransactionSchema);

export { TransactionModel }