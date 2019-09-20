import {JsonObject, JsonProperty} from "json2typescript";
import { Token } from "~/models/token.model";

@JsonObject("User")
export class User {

    @JsonProperty("Username", String)
    Username: string = undefined;

    @JsonProperty("Email", String)
    Email: string = undefined;

    @JsonProperty("Password", String)
    Password: string = undefined;

    @JsonProperty("IsAutoUpdateEnabled", Boolean)
    IsAutoUpdateEnabled: boolean = undefined;

    @JsonProperty("UserToken", Token)
    UserToken: Token = undefined;
}