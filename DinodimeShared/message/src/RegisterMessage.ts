import { RestMessage } from "./RestMessage";

export class RegisterMessage implements RestMessage {
    constructor(message: string) {
        this.creationTimestamp = Date.now();
        this.message = message;
    }
    creationTimestamp: number;
    message: string;
}