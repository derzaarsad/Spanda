export class UserVerificationMessage {
    constructor(isRecurrentTransactionConfirmed: boolean, isAllowanceReady: boolean) {
        this.is_recurrent_transaction_confirmed = isRecurrentTransactionConfirmed;
        this.is_allowance_ready = isAllowanceReady;
    }
    is_recurrent_transaction_confirmed: boolean;
    is_allowance_ready: boolean;
}