import { RestMessage } from "./RestMessage";

export class UserVerificationMessage implements RestMessage {
    constructor(isRecurrentTransactionConfirmed: boolean, isAllowanceReady: boolean) {
        this.creationTimestamp = Date.now();
        this.is_recurrent_transaction_confirmed = isRecurrentTransactionConfirmed;
        this.is_allowance_ready = isAllowanceReady;
    }
    creationTimestamp: number;
    is_recurrent_transaction_confirmed: boolean;
    is_allowance_ready: boolean;
}