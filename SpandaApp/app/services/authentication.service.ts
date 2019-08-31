import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Token } from "~/models/token.model";
import * as appSettings from "tns-core-modules/application-settings";
import { User } from "~/models/user.model";
import { JsonConvert } from "json2typescript";

@Injectable()
export class AuthenticationService {
    private serverUrl = "https://sandbox.finapi.io";
    private backendUrl = "https://192.168.1.194:8443/spanda";
    private client_id = "3996d8ae-abaf-490f-9abe-41c64bd82ab6";
    private client_secret = "35525147-fec5-4a48-8a3f-5511221a32f1";
    private clientToken: Token;
    private storedUser: User;
    private jsonConvert: JsonConvert;

    constructor(private http: HttpClient) {
        this.jsonConvert = new JsonConvert();

        if(this.isStoredUserAvailable()) {
            this.storedUser = this.jsonConvert.deserializeObject(JSON.parse(appSettings.getString("storedUser")), User);
        }
    }

    isStoredUserAvailable(): boolean {
        return appSettings.hasKey("storedUser");
    }

    getStoredUser(): User {
        return this.storedUser;
    }

    getServerUrl(): string {
        return this.serverUrl;
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
            if(!this.clientToken) {
                this.clientToken = new Token(res["access_token"],res["refresh_token"],res["token_type"]);
            }
            else {
                this.clientToken.AccessToken = res["access_token"];
                this.clientToken.RefreshToken = res["refresh_token"];
                this.clientToken.TokenType = res["token_type"];
            }

            return true;
        });
    }

    authenticateAndSave(username: string, password: string) : Promise<boolean> {

        let headerOptions = new HttpHeaders();
        headerOptions.append('Content-Type', 'application/x-www-form-urlencoded');

        return this.http.post(this.backendUrl + "/oauth/token", { username: username, password: password }, { headers: headerOptions }).toPromise()
        .then(res => {
            if(!this.storedUser) {
                this.storedUser = new User();
            }
            this.storedUser.Username = username;
            this.storedUser.Password = password;
            this.storedUser.Allowance = 0; // TODO: from backend
            this.storedUser.Email = "testuser@testdomain.com"; // TODO: from backend
            this.storedUser.IsAutoUpdateEnabled = false; // TODO: from backend
            this.storedUser.UserToken = new Token(res["access_token"], res["refresh_token"], res["token_type"]);
            let storedUserJson: string = JSON.stringify(this.jsonConvert.serialize(this.storedUser));
            appSettings.setString("storedUser",storedUserJson);

            return true;
        });
    }

    setNewRefreshAndAccessToken() : Promise<boolean> {
        const data = new HttpParams()
        .set('grant_type', "refresh_token")
        .set('client_id', this.client_id)
        .set('client_secret', this.client_secret)
        .set('refresh_token', this.storedUser.UserToken.RefreshToken);

        let headerOptions = new HttpHeaders();
        headerOptions.append('Content-Type', 'application/x-www-form-urlencoded');

        return this.http.post(this.serverUrl + "/oauth/token", data, { headers: headerOptions }).toPromise()
        .then(res => {
            this.storedUser.UserToken = new Token(res["access_token"], res["refresh_token"], res["token_type"]);
            let storedUserJson: string = JSON.stringify(this.jsonConvert.serialize(this.storedUser));
            appSettings.setString("storedUser",storedUserJson);
            
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

        return this.http.get(this.backendUrl + "/users", { headers: headerOptions }).toPromise()
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

    removeAllUserAuthentication(): void {
        appSettings.remove("storedUser");
    }

    register(username: string, password: string) : Promise<boolean> {

            let headerOptions = new HttpHeaders({
                "Content-Type": "application/json"
            });

            return this.http.post(this.backendUrl + "/users", { id: username, password: password, email: username, phone: "+49 99 999999-999", isAutoUpdateEnabled: false }, { headers: headerOptions }).toPromise()
            .then(res => {

                console.log("registration successful");
                console.log(res);

                return true;
            });
    }

    resetPassword(textSTr: string) : any {
        //TODO
    }
}