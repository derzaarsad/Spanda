import { Injectable } from "@angular/core";
import { IAuthentication } from "../services/authentication.service";
import { User } from "../models/user.model";
import { environment } from "../environments/environment";

@Injectable()
export class DummyAuthenticationService implements IAuthentication {

    getBackendUrl(): string {
        return "onlyfortest";
    }

    isStoredUserAvailable(): boolean {
        return true;
    }

    getStoredUser(): User {
        let user = new User();
        user.UserToken = {
            access_token: "12345678",
            refresh_token: "",
            token_type: "bearer",
            expires_in: 0,
            scope: ""
        };
        return user;
    }

    authenticateAndSave(username: string, password: string) : Promise<boolean> {
        return Promise.resolve(true);
    }

    setNewRefreshAndAccessToken() : Promise<boolean> {
        return Promise.resolve(true);
    }

    isUserAuthenticated(access_token: string, token_type: string) : Promise<boolean> {
        return Promise.resolve(true);
    }

    removeAllUserAuthentication(): void {
    }

    register(username: string, password: string) : Promise<[boolean,string]> {
        return Promise.resolve([true,""]);
    }

    resetPassword(textSTr: string) : any {
        //TODO
    }
}