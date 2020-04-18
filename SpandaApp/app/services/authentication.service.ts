import { Injectable, InjectionToken } from "@angular/core";
import * as Https from 'nativescript-https';
import * as appSettings from "tns-core-modules/application-settings";
import { User } from "~/models/user.model";
import { JsonConvert } from "json2typescript";
import { environment } from "~/environments/environment";
import { UserVerificationMessage, LoginMessage, UpdateTokenMessage } from "dinodime-message";
export const AUTH_SERVICE_IMPL = new InjectionToken<IAuthentication>('authServiceImpl');

/*
 * This interface is implemented for Inversion of Control in the unit tests
 */
export interface IAuthentication {
    //define the API
    getBackendUrl(): string;
    isStoredUserAvailable(): boolean;
    getStoredUser(): User;
    authenticateAndSave(username: string, password: string) : Promise<boolean>;
    setNewRefreshAndAccessToken() : Promise<boolean>;
    isUserAuthenticated(access_token: string, token_type: string) : Promise<boolean>;
    removeAllUserAuthentication(): void;
    register(username: string, password: string) : Promise<[boolean,string]>;

    resetPassword(textSTr: string) : any;
}
    

@Injectable()
export class AuthenticationService implements IAuthentication {
    private storedUser: User;
    private jsonConvert: JsonConvert;

    constructor() {
        this.jsonConvert = new JsonConvert();

        if(this.isStoredUserAvailable()) {
            this.storedUser = this.jsonConvert.deserializeObject(JSON.parse(appSettings.getString("storedUser")), User);
        }
    }

    getBackendUrl(): string {
        return environment.APIEndpointURL;
    }

    isStoredUserAvailable(): boolean {
        return appSettings.hasKey("storedUser");
    }

    getStoredUser(): User {
        return this.storedUser;
    }

    __authenticateAndSave__(username: string, password: string) : [string, any, any] {

        let headerOptions = {
            "Content-Type": "application/json"
        };

        return [this.getBackendUrl() + "/oauth/login", { username: username, password: password }, headerOptions ];
    }

    __setNewRefreshAndAccessToken__(refreshToken: string) : [string, any, any] {

        let headerOptions = {
            "Content-Type": "application/json"
        };

        return [this.getBackendUrl() + "/oauth/token", { refresh_token: refreshToken }, headerOptions ];
    }

    __isUserAuthenticated__(access_token: string, token_type: string) : [string, any] {

        let headerOptions = {
            "Authorization": token_type + " " + access_token,
            "Content-Type": "application/json"
         };

         return [this.getBackendUrl() + "/users", headerOptions ];
    }

    __register__(username: string, password: string) : [string, any, any] {

        let headerOptions = {
            "Content-Type": "application/json"
        };

        return [this.getBackendUrl() + "/users", { id: username, password: password, email: username, phone: "+49 99 999999-999", isAutoUpdateEnabled: false }, headerOptions ];
    }

    authenticateAndSave(username: string, password: string) : Promise<boolean> {
        let request = this.__authenticateAndSave__(username,password);
        return Https.request({
            url: request[0],
            method: 'POST',
            body: request[1],
            headers: request[2],
            timeout: 10
        }).then(res => {
            if(res.statusCode === 200) {
                let content: LoginMessage = res["content"];
                if(!this.storedUser) {
                    this.storedUser = new User();
                }
                this.storedUser.Username = username;
                this.storedUser.Password = password;
                this.storedUser.UserToken = content.token;
                let storedUserJson: string = JSON.stringify(this.jsonConvert.serialize(this.storedUser));
                appSettings.setString("storedUser",storedUserJson);

                return true;
            }

            return false;
        });
    }

    setNewRefreshAndAccessToken() : Promise<boolean> {
        let request = this.__setNewRefreshAndAccessToken__(this.storedUser.UserToken.refresh_token);
        return Https.request({
            url: request[0],
            method: 'POST',
            body: request[1],
            headers: request[2],
            timeout: 10
        }).then(res => {
            console.log(res);
            if(res["statusCode"] === 200) {
                let content: UpdateTokenMessage = res["content"];
                this.storedUser.UserToken = content.token;
                this.storedUser.IsRecurrentTransactionConfirmed = content.userVerificationMessage.is_recurrent_transaction_confirmed;
                this.storedUser.IsAllowanceReady = content.userVerificationMessage.is_allowance_ready;
                let storedUserJson: string = JSON.stringify(this.jsonConvert.serialize(this.storedUser));
                appSettings.setString("storedUser",storedUserJson);

                return true;
            }
            else {
                return false;
            }
        }, err => {
            console.log("invalid refresh_token");
            console.log(err);
            return false;
        });
    }

    isUserAuthenticated(access_token: string, token_type: string) : Promise<boolean> {
        let request = this.__isUserAuthenticated__(access_token, token_type);
        return Https.request({
            url: request[0],
            method: 'GET',
            headers: request[1],
            timeout: 10
        }).then(res => {
            console.log("user is authenticated!");
            console.log(res);
            if(res["statusCode"] === 200) {
                let content: UserVerificationMessage = res["content"];
                this.storedUser.IsRecurrentTransactionConfirmed = content.is_recurrent_transaction_confirmed;
                this.storedUser.IsAllowanceReady = content.is_allowance_ready;
                let storedUserJson: string = JSON.stringify(this.jsonConvert.serialize(this.storedUser));
                appSettings.setString("storedUser",storedUserJson);

                return true;
            }
            else {
                return false;
            }
        }, err => {
            console.log("user not authenticated!");
            console.log(err);
            return false;
        });
    }

    removeAllUserAuthentication(): void {
        appSettings.remove("storedUser");
    }

    register(username: string, password: string) : Promise<[boolean,string]> {
        let request = this.__register__(username, password);
        return Https.request({
            url: request[0],
            method: 'POST',
            body: request[1],
            headers: request[2],
            timeout: 10
        }).then(res => {
            console.log(res);
            return [((res["statusCode"] === 201) ? true : false), res.content["message"]];
        });
    }

    resetPassword(textSTr: string) : any {
        //TODO
    }
}