import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import * as appSettings from "tns-core-modules/application-settings";

@Injectable()
export class AuthenticationService {
    private serverUrl = "https://sandbox.finapi.io";
    private client_id = "3996d8ae-abaf-490f-9abe-41c64bd82ab6";
    private client_secret = "35525147-fec5-4a48-8a3f-5511221a32f1";
    private client_access_token: string;
    private client_token_type: string;

    constructor(private http: HttpClient) { }

    getClientAccessToken(): string {
        return this.client_access_token;
    }

    getClientTokenType(): string {
        return this.client_token_type;
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
            this.client_access_token = res["access_token"];
            this.client_token_type = res["token_type"];

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
            appSettings.setString("username", username);
            appSettings.setString("password", password);
            this.setTokensAtApp(res["access_token"], res["refresh_token"], res["token_type"]);

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
            this.setTokensAtApp(res["access_token"], res["refresh_token"], res["token_type"]);
            
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
            "Content-Type": "application/x-www-form-urlencoded",
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

    private setTokensAtApp(access_token: string, refresh_token: string, token_type: string): void {
        appSettings.setString("access_token", access_token);
        appSettings.setString("refresh_token", refresh_token);
        appSettings.setString("token_type", token_type);
    }
}