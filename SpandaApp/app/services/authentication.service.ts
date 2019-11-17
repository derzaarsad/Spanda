import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Token } from "~/models/token.model";
import * as appSettings from "tns-core-modules/application-settings";
import { User } from "~/models/user.model";
import { JsonConvert } from "json2typescript";
import { environment } from "~/environments/environment";

@Injectable()
export class AuthenticationService {
    private storedUser: User;
    private jsonConvert: JsonConvert;

    constructor(private http: HttpClient) {
        this.jsonConvert = new JsonConvert();

        if(this.isStoredUserAvailable()) {
            this.storedUser = this.jsonConvert.deserializeObject(JSON.parse(appSettings.getString("storedUser")), User);
        }
    }

    getBackendUrl(): string {
        return environment.backendUrl;
    }

    isStoredUserAvailable(): boolean {
        return appSettings.hasKey("storedUser");
    }

    getStoredUser(): User {
        return this.storedUser;
    }

    __authenticateAndSave__(username: string, password: string) : [string, any, any] {

        let headerOptions = new HttpHeaders({
            "Content-Type": "application/json"
        });

        return [environment.backendUrl + "/oauth/login", { username: username, password: password }, { headers: headerOptions }];
    }

    __setNewRefreshAndAccessToken__(refreshToken: string) : [string, any, any] {

        let headerOptions = new HttpHeaders({
            "Content-Type": "application/json"
        });

        return [environment.backendUrl + "/oauth/token", { refresh_token: refreshToken }, { headers: headerOptions }];
    }

    __isUserAuthenticated__(access_token: string, token_type: string) : [string, any] {

        let headerOptions = new HttpHeaders({
            "Authorization": token_type + " " + access_token,
            "Content-Type": "application/json"
         });

         return [environment.backendUrl + "/users", { headers: headerOptions }];
    }

    __register__(username: string, password: string) : [string, any, any] {

        let headerOptions = new HttpHeaders({
            "Content-Type": "application/json"
        });

        return [environment.backendUrl + "/users", { id: username, password: password, email: username, phone: "+49 99 999999-999", isAutoUpdateEnabled: false }, { headers: headerOptions }];
    }

    authenticateAndSave(username: string, password: string) : Promise<boolean> {
        let request = this.__authenticateAndSave__(username,password);
        return this.http.post(request[0],request[1],request[2]).toPromise()
        .then(res => {
            if(!this.storedUser) {
                this.storedUser = new User();
            }
            this.storedUser.Username = username;
            this.storedUser.Password = password;
            this.storedUser.UserToken = new Token(res["access_token"], res["refresh_token"], res["token_type"]);
            let storedUserJson: string = JSON.stringify(this.jsonConvert.serialize(this.storedUser));
            appSettings.setString("storedUser",storedUserJson);

            return true;
        });
    }

    setNewRefreshAndAccessToken() : Promise<boolean> {
        let request = this.__setNewRefreshAndAccessToken__(this.storedUser.UserToken.RefreshToken);
        return this.http.post(request[0],request[1],request[2]).toPromise()
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
        let request = this.__isUserAuthenticated__(access_token, token_type);
        return this.http.get(request[0],request[1]).toPromise()
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
        let request = this.__register__(username, password);
        return this.http.post(request[0],request[1],request[2]).toPromise()
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