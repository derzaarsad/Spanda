import * as mongoose from "mongoose";
interface IBankConnection extends mongoose.Document {
    id: number;
    bankId: number;
}

const BankConnectionSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    bankId: Number
});

const BankConnectionModel = mongoose.model<IBankConnection>('BankConnection', BankConnectionSchema);

export { BankConnectionModel }