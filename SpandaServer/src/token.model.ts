export class Token {
    AccessToken: string = undefined;
    RefreshToken: string = undefined;
    TokenType: string = undefined;

    constructor(accessToken: string, refreshToken: string, tokenType: string) {
        this.AccessToken = accessToken;
        this.RefreshToken = refreshToken;
        this.TokenType = tokenType;
    }
}