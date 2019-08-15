import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Token } from "~/models/token.model";
import * as appSettings from "tns-core-modules/application-settings";
import { User } from "~/models/user.model";

@Injectable()
export class AuthenticationService {
    private serverUrl = "https://sandbox.finapi.io";
    private client_id = "3996d8ae-abaf-490f-9abe-41c64bd82ab6";
    private client_secret = "35525147-fec5-4a48-8a3f-5511221a32f1";
    private clientToken: Token;
    private storedUser: User;

    constructor(private http: HttpClient) {
        if(!this.clientToken) {
            this.clientToken = new Token();
        }

        if(!this.storedUser) {
            this.storedUser = new User();
            this.storedUser.userToken = new Token();
        }

        if(appSettings.hasKey("username")) {
            this.storedUser.Username = appSettings.getString("username");
        }

        if(appSettings.hasKey("password")) {
            this.storedUser.Password = appSettings.getString("password");
        }

        if(appSettings.hasKey("access_token")) {
            this.storedUser.userToken.AccessToken = appSettings.getString("access_token");
        }

        if(appSettings.hasKey("refresh_token")) {
            this.storedUser.userToken.RefreshToken = appSettings.getString("refresh_token");
        }

        if(appSettings.hasKey("token_type")) {
            this.storedUser.userToken.TokenType = appSettings.getString("token_type");
        }
    }

    getStoredUser(): User {
        return this.storedUser;
    }

    getServerUrl(): string {
        return this.serverUrl;
    }

    getClientId(): string {
        return this.client_id;
    }

    getClientSecret(): string {
        return this.client_secret;
    }

    getClientAccessToken(): string {
        return this.clientToken.AccessToken;
    }

    getClientTokenType(): string {
        return this.clientToken.TokenType;
    }

    authenticateClientAndSave() : Promise<boolean> {

        const data = new HttpParams()
        .set('grant_type', "client_credentials")
        .set('client_id', this.client_id)
        .set('client_secret', this.client_secret);

        let headerOptions = new HttpHeaders();
        headerOptions.append('Content-Type', 'application/x-www-form-urlencoded');

        return this.http.post(this.serverUrl + "/oauth/token", data, { headers: headerOptions }).toPromise()
        .then(res => {
            console.log("client auth success");
            this.clientToken.AccessToken = res["access_token"];
            this.clientToken.RefreshToken = res["refresh_token"];
            this.clientToken.TokenType = res["token_type"];

            return true;
        });
    }

    authenticateAndSave(username: string, password: string) : Promise<boolean> {

        const data = new HttpParams()
        .set('grant_type', "password")
        .set('client_id', this.client_id)
        .set('client_secret', this.client_secret)
        .set('username', username)
        .set('password', password);

        let headerOptions = new HttpHeaders();
        headerOptions.append('Content-Type', 'application/x-www-form-urlencoded');

        return this.http.post(this.serverUrl + "/oauth/token", data, { headers: headerOptions }).toPromise()
        .then(res => {
            this.storedUser.Username = username;
            this.storedUser.Password = password;
            this.storedUser.Email = res["email"];
            this.storedUser.IsAutoUpdateEnabled = res["isAutoUpdateEnabled"];

            appSettings.setString("username", this.storedUser.Username);
            appSettings.setString("password", this.storedUser.Password);
            this.storedUser.userToken = this.setTokensAtApp(res["access_token"], res["refresh_token"], res["token_type"]);

            return true;
        });
    }

    setNewRefreshAndAccessToken(refresh_token: string) : Promise<boolean> {
        const data = new HttpParams()
        .set('grant_type', "refresh_token")
        .set('client_id', this.client_id)
        .set('client_secret', this.client_secret)
        .set('refresh_token', refresh_token);

        let headerOptions = new HttpHeaders();
        headerOptions.append('Content-Type', 'application/x-www-form-urlencoded');

        return this.http.post(this.serverUrl + "/oauth/token", data, { headers: headerOptions }).toPromise()
        .then(res => {
            this.storedUser.userToken = this.setTokensAtApp(res["access_token"], res["refresh_token"], res["token_type"]);
            
            return true;
        }, err => {
            console.log("invalid refresh_token");
            console.log(err);
            return false;
        });
    }

    isUserAuthenticated(access_token: string, token_type: string) : Promise<boolean> {

        let headerOptions = new HttpHeaders({
            "Authorization": token_type + " " + access_token,
            "Content-Type": "application/x-www-form-urlencoded"
         });

        return this.http.get(this.serverUrl + "/api/v1/users", { headers: headerOptions }).toPromise()
        .then(res => {
            console.log("user is authenticated!");
            console.log(res);
            return true;
        }, err => {
            console.log("user not authenticated!");
            console.log(err);
            return false;
        });
    }

    private setTokensAtApp(access_token: string, refresh_token: string, token_type: string): Token {
        let token = new Token();
        token.AccessToken = access_token;
        token.RefreshToken = refresh_token;
        token.TokenType = token_type;

        appSettings.setString("access_token", token.AccessToken);
        appSettings.setString("refresh_token", token.RefreshToken);
        appSettings.setString("token_type", token.TokenType);

        return token;
    }

    removeAllUserAuthentication(): void {
        appSettings.clear();
        this.storedUser = new User();
        this.storedUser.userToken = new Token();
    }

    register(username: string, password: string) : any {
        //TODO
    }

    resetPassword(textSTr: string) : any {
        //TODO
    }
}