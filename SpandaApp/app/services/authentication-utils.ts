import * as Https from 'nativescript-https';
import { UserVerificationMessage, LoginMessage, UpdateTokenMessage, RegisterMessage } from "dinodime-message";
import { Token } from "dinodime-sharedmodel";

const AuthenticateAndSave = (backendUrl: string, username: string, password: string) : Https.HttpsRequestOptions => {

    let headerOptions = {
        "Content-Type": "application/json"
    };

    return {
        url: backendUrl + "/oauth/login",
        method: 'POST',
        body: { username: username, password: password } as any,
        headers: headerOptions,
        timeout: 10
    };
}

const SetNewRefreshAndAccessToken = (backendUrl: string, token: Token) : Https.HttpsRequestOptions => {

    let headerOptions = {
        "Content-Type": "application/json"
    };

    return {
        url: backendUrl + "/oauth/token",
        method: 'POST',
        body: { refresh_token: token.refresh_token } as any,
        headers: headerOptions,
        timeout: 10
    };
}

const IsUserAuthenticated = (backendUrl: string, token: Token) : Https.HttpsRequestOptions => {

    let headerOptions = {
        "Authorization": token.token_type + " " + token.access_token,
        "Content-Type": "application/json"
     };

     return {
        url: backendUrl + "/users",
        method: 'GET',
        headers: headerOptions,
        timeout: 10
    };
}

const Register = (backendUrl: string, username: string, password: string) : Https.HttpsRequestOptions => {

    let headerOptions = {
        "Content-Type": "application/json"
    };

    return {
        url: backendUrl + "/users",
        method: 'POST',
        body: { id: username, password: password, email: username, phone: "+49 99 999999-999", isAutoUpdateEnabled: false } as any,
        headers: headerOptions,
        timeout: 10
    };
}

export function PostAuthenticateAndSave(backendUrl: string, username: string, password: string): Promise<LoginMessage> {
    let request = AuthenticateAndSave(backendUrl,username,password);
    return Https.request(request).then(res => {
        if(res.statusCode === 200)
            return res["content"];
        else
            throw new Error(res.content["message"]);
    });
};

export function PostUpdateToken(backendUrl: string, token: Token): Promise<UpdateTokenMessage> {
    let request = SetNewRefreshAndAccessToken(backendUrl,token);
    return Https.request(request).then(res => {
        if(res.statusCode === 200)
            return res["content"];
        else
            throw new Error(res.content["message"]);
    });
};

export function GetUserVerification(backendUrl: string, token: Token): Promise<UserVerificationMessage> {
    let request = IsUserAuthenticated(backendUrl,token);
    return Https.request(request).then(res => {
        if(res.statusCode === 200)
            return res["content"];
        else
            throw new Error(res.content["message"]);
    });
};

export function PostRegister(backendUrl: string, username: string, password: string): Promise<RegisterMessage> {
    let request = Register(backendUrl,username,password);
    return Https.request(request).then(res => {
        if(res.statusCode === 201)
            return res["content"];
        else
            throw new Error(res.content["message"]);
    });
};

// Only for unit test
export { AuthenticateAndSave, SetNewRefreshAndAccessToken, IsUserAuthenticated, Register };