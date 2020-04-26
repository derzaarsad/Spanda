import { RestMessage } from "./RestMessage";

export class GetAllowanceMessage implements RestMessage {
    constructor(allowance: number) {
        this.creationTimestamp = Date.now();
        this.allowance = allowance;
    }
    creationTimestamp: number;
    allowance: number;
}