import { RestMessage } from "./RestMessage";
import { Token } from "dinodime-sharedmodel";
import { UserVerificationMessage } from "./UserVerificationMessage";

export class UpdateTokenMessage implements RestMessage {
    constructor(token: Token, userVerificationMessage: UserVerificationMessage) {
        this.creationTimestamp = Date.now();
        this.token = token;
        this.userVerificationMessage = userVerificationMessage;
    }
    creationTimestamp: number;
    token: Token;
    userVerificationMessage: UserVerificationMessage;
}