import {JsonObject, JsonProperty} from "json2typescript";
import { Token } from "~/../../DinodimeShared/sharedmodel/src/Token";

@JsonObject("User")
export class User {

    @JsonProperty("Username", String)
    Username: string = undefined;

    @JsonProperty("Password", String)
    Password: string = undefined;

    UserToken: Token = undefined;

    @JsonProperty("IsRecurrentTransactionConfirmed", Boolean)
    IsRecurrentTransactionConfirmed: boolean = true;

    @JsonProperty("IsAllowanceReady", Boolean)
    IsAllowanceReady: boolean = true;
}