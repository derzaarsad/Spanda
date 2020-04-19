import { RestMessage } from "dinodime-message";
import { Transaction } from "dinodime-lib";

export class GetUserDataMessage implements RestMessage {
    constructor(transactions: Transaction[]) {
        this.creationTimestamp = Date.now();
        this.transactions = transactions;
    }
    creationTimestamp: number;
    transactions: Transaction[]
}