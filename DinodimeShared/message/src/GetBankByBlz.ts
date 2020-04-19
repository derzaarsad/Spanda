import { RestMessage } from "./RestMessage";
import { SharedBank } from "dinodime-sharedmodel";

export class GetBankByBlzMessage implements RestMessage {
    constructor(banks: SharedBank[]) {
        this.creationTimestamp = Date.now();
        this.banks = banks;
    }
    creationTimestamp: number;
    banks: SharedBank[];
}