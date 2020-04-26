import { RestMessage } from "./RestMessage";

export class GetWebformIdMessage implements RestMessage {
    constructor(location: string, webFormId: number, secret: string) {
        this.creationTimestamp = Date.now();
        this.location = location;
        this.webFormAuth = webFormId.toString() + "-" + secret;
    }
    creationTimestamp: number;
    location: string;
    webFormAuth: string;
}