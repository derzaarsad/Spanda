import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import * as appSettings from "tns-core-modules/application-settings";

@Injectable()
export class AuthenticationService {
    private serverUrl = "https://sandbox.finapi.io/oauth/token";

    constructor(private http: HttpClient) { }

    authenticateAndSave(username: string, password: string) : Promise<boolean> {

        const data = new HttpParams()
        .set('grant_type', "password")
        .set('client_id', "3996d8ae-abaf-490f-9abe-41c64bd82ab6")
        .set('client_secret', "35525147-fec5-4a48-8a3f-5511221a32f1")
        .set('username', username)
        .set('password', password);

        let headerOptions = new HttpHeaders();
        headerOptions.append('Content-Type', 'application/x-www-form-urlencoded');

        return this.http.post(this.serverUrl, data, { headers: headerOptions }).toPromise()
        .then(res => {
            appSettings.setString("username", username);
            appSettings.setString("password", password);
            appSettings.setString("access_token", res["access_token"]);
            appSettings.setString("refresh_token", res["refresh_token"]);

            console.log(appSettings.getString("username"));
            console.log(appSettings.getString("access_token"));
            console.log(appSettings.getString("refresh_token"));
            return true;
        }, err => {
            console.log("there is an error");
            console.log(err);
            return false;
        });
    }
}