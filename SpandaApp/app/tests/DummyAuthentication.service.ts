import { Injectable } from "@angular/core";
import { IAuthentication } from "../services/authentication.service";
import { User } from "../models/user.model";
import { environment } from "../environments/environment";
import { Token } from "~/models/token.model";

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
        user.UserToken = new Token("12345678","","bearer");
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

    register(username: string, password: string) : Promise<boolean> {
        return Promise.resolve(true);
    }

    resetPassword(textSTr: string) : any {
        //TODO
    }
}