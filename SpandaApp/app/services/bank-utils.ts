import * as Https from 'nativescript-https';
import { GetBankByBlzMessage, GetRecurrentTransactionsMessage, GetWebformIdMessage, UpdateRecurrentTransactionsMessage, GetAllowanceMessage } from "dinodime-message";
import { Token, SharedRecurrentTransaction, SharedBank } from "dinodime-sharedmodel";

const GetBankByBLZ = (backendUrl: string, blz: string) : Https.HttpsRequestOptions => {

    let headerOptions = {
        "Content-Type": "application/x-www-form-urlencoded"
    };

    return {
        url: backendUrl + "/banks/" + blz,
        method: 'GET',
        headers: headerOptions,
        timeout: 10
    };
}

const GetRecurrentTransactions = (backendUrl: string, token: Token) : Https.HttpsRequestOptions => {

    let headerOptions = {
        "Authorization": token.token_type + " " + token.access_token,
        "Content-Type": "application/json"
    };

    return {
        url: backendUrl + "/recurrentTransactions",
        method: 'GET',
        headers: headerOptions,
        timeout: 10
    };
}

const UpdateRecurrentTransactions = (backendUrl: string, recurrenttransactions: Array<SharedRecurrentTransaction>, token: Token): Https.HttpsRequestOptions => {

    let headerOptions = {
        "Authorization": token.token_type + " " + token.access_token,
        "Content-Type": "application/json"
    };

    return {
        url: backendUrl + "/recurrentTransactions/update",
        method: 'POST',
        body: { recurrenttransactions: recurrenttransactions } as any,
        headers: headerOptions,
        timeout: 10
    };
}

const GetWebformIdAndToken = (backendUrl: string, bank: SharedBank, token: Token): Https.HttpsRequestOptions => {

    let headerOptions = {
        "Authorization": token.token_type + " " + token.access_token,
        "Content-Type": "application/json"
    };

    return {
        url: backendUrl + "/bankConnections/import",
        method: 'POST',
        body: { bankId: bank.id } as any,
        headers: headerOptions,
        timeout: 10
    };
}

const GetAllowance = (backendUrl: string, username: string, token: Token): Https.HttpsRequestOptions => {

    let headerOptions = {
        "Username": username,
        "Authorization": token.token_type + " " + token.access_token,
        "Content-Type": "application/x-www-form-urlencoded"
    };

    return {
        url: backendUrl + "/allowance",
        method: 'GET',
        headers: headerOptions,
        timeout: 10
    };
}

export function GetGetBankByBlz(backendUrl: string, blz: string): Promise<GetBankByBlzMessage> {
    let request = GetBankByBLZ(backendUrl, blz);
    return Https.request(request).then(res => {
        if(res.statusCode === 200)
            return res["content"];
        else
            throw new Error(res.content["message"]);
    });
};

export function GetGetRecurrentTransactions(backendUrl: string, token: Token): Promise<GetRecurrentTransactionsMessage> {
    let request = GetRecurrentTransactions(backendUrl, token);
    return Https.request(request).then(res => {
        if(res.statusCode === 200)
            return res["content"];
        else
            throw new Error(res.content["message"]);
    });
};

export function PostUpdateRecurrentTransactions(backendUrl: string, recurrenttransactions: Array<SharedRecurrentTransaction>, token: Token): Promise<UpdateRecurrentTransactionsMessage> {
    let request = UpdateRecurrentTransactions(backendUrl, recurrenttransactions, token);
    return Https.request(request).then(res => {
        if(res.statusCode === 200)
            return res["content"];
        else
            throw new Error(res.content["message"]);
    });
};

export function PostGetWebformIdAndToken(backendUrl: string, bank: SharedBank, token: Token): Promise<GetWebformIdMessage> {
    let request = GetWebformIdAndToken(backendUrl, bank, token);
    return Https.request(request).then(res => {
        if(res.statusCode === 200)
            return res["content"];
        else
            throw new Error(res.content["message"]);
    });
};

export function GetGetAllowance(backendUrl: string, username: string, token: Token): Promise<GetAllowanceMessage> {
    let request = GetAllowance(backendUrl, username, token);
    return Https.request(request).then(res => {
        if(res.statusCode === 200)
            return res["content"];
        else
            throw new Error(res.content["message"]);
    });
};

// Only for unit test
export { GetBankByBLZ, GetRecurrentTransactions, UpdateRecurrentTransactions, GetWebformIdAndToken, GetAllowance };