import { Injectable, InjectionToken } from "@angular/core";
import * as appSettings from "tns-core-modules/application-settings";
import { User } from "~/models/user.model";
import { JsonConvert } from "json2typescript";
import { environment } from "~/environments/environment";
import { Token } from "dinodime-sharedmodel";
import { PostAuthenticateAndSave, PostUpdateToken, GetUserVerification, PostRegister } from "./authentication-utils";
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
    isUserAuthenticated(token: Token) : Promise<boolean>;
    removeAllUserAuthentication(): void;
    register(username: string, password: string) : Promise<string | null>;

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

    authenticateAndSave(username: string, password: string) : Promise<boolean> {
        return PostAuthenticateAndSave(this.getBackendUrl(),username,password).then(content => {
            if(!this.storedUser) {
                this.storedUser = new User();
            }
            this.storedUser.Username = username;
            this.storedUser.Password = password;
            this.storedUser.UserToken = content.token;
            let storedUserJson: string = JSON.stringify(this.jsonConvert.serialize(this.storedUser));
            appSettings.setString("storedUser",storedUserJson);

            return true;
        }).catch(() => false);
    }

    setNewRefreshAndAccessToken() : Promise<boolean> {
        return PostUpdateToken(this.getBackendUrl(),this.storedUser.UserToken).then(content => {
            this.storedUser.UserToken = content.token;
            this.storedUser.IsRecurrentTransactionConfirmed = content.userVerificationMessage.is_recurrent_transaction_confirmed;
            this.storedUser.IsAllowanceReady = content.userVerificationMessage.is_allowance_ready;
            let storedUserJson: string = JSON.stringify(this.jsonConvert.serialize(this.storedUser));
            appSettings.setString("storedUser",storedUserJson);

            return true;
        }, err => {
            console.log("invalid refresh_token");
            console.log(err);
            return false;
        });
    }

    isUserAuthenticated(token: Token) : Promise<boolean> {
        return GetUserVerification(this.getBackendUrl(),token).then(content => {
            console.log("user is authenticated!");
            this.storedUser.IsRecurrentTransactionConfirmed = content.is_recurrent_transaction_confirmed;
            this.storedUser.IsAllowanceReady = content.is_allowance_ready;
            let storedUserJson: string = JSON.stringify(this.jsonConvert.serialize(this.storedUser));
            appSettings.setString("storedUser",storedUserJson);

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

    register(username: string, password: string) : Promise<string | null> {
        return PostRegister(this.getBackendUrl(),username,password).then(() => null).catch(err => err.message);
    }

    resetPassword(textSTr: string) : any {
        //TODO
    }
}