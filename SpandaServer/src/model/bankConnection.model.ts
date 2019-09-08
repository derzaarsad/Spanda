import * as mongoose from "mongoose";
interface IBankConnection extends mongoose.Document {
    id: number;
    bankId: number;
}

const BankConnectionSchema = new mongoose.Schema({
    id: Number,
    bankId: Number
});

const BankConnectionModel = mongoose.model<IBankConnection>('BankConnection', BankConnectionSchema);

export { BankConnectionModel }