import { RestMessage } from "./RestMessage";
import { Token } from "dinodime-sharedmodel";

export class LoginMessage implements RestMessage {
    constructor(token: Token) {
        this.creationTimestamp = Date.now();
        this.token = token;
    }
    creationTimestamp: number;
    token: Token;
}