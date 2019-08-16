import {JsonObject, JsonProperty} from "json2typescript";

@JsonObject("Token")
export class Token {
    @JsonProperty("AccessToken", String)
    AccessToken: string = undefined;

    @JsonProperty("RefreshToken", String)
    RefreshToken: string = undefined;

    @JsonProperty("TokenType", String)
    TokenType: string = undefined;
}