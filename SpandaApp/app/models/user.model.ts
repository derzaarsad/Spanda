import {JsonObject, JsonProperty} from "json2typescript";
import { Token } from "~/models/token.model";

@JsonObject("User")
export class User {

    @JsonProperty("Username", String)
    Username: string = undefined;

    @JsonProperty("Password", String)
    Password: string = undefined;

    @JsonProperty("UserToken", Token)
    UserToken: Token = undefined;

    @JsonProperty("IsRecurrentTransactionConfirmed", Boolean)
    IsRecurrentTransactionConfirmed: boolean = true;

    @JsonProperty("IsAllowanceReady", Boolean)
    IsAllowanceReady: boolean = true;
}