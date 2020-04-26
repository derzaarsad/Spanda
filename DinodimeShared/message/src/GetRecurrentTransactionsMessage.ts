import { RestMessage } from "./RestMessage";
import { SharedRecurrentTransaction } from "dinodime-sharedmodel";

export class GetRecurrentTransactionsMessage implements RestMessage {
    constructor(recurrenttransactions: SharedRecurrentTransaction[]) {
        this.creationTimestamp = Date.now();
        this.recurrenttransactions = recurrenttransactions;
    }
    creationTimestamp: number;
    recurrenttransactions: SharedRecurrentTransaction[];
}