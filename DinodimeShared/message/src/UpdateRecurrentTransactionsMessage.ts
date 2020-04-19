import { RestMessage } from "./RestMessage";

export class UpdateRecurrentTransactionsMessage implements RestMessage {
    constructor(message: string) {
        this.creationTimestamp = Date.now();
        this.message = message;
    }
    creationTimestamp: number;
    message: string;
}