import { Injectable, Inject } from "@angular/core";
import * as Https from 'nativescript-https';
import { Bank } from "~/models/bank.model";
import { IAuthentication, AUTH_SERVICE_IMPL } from "~/services/authentication.service";
import { Token } from "~/models/token.model";
import { RecurrentTransaction } from "~/models/recurrent-transactions.model";
import { environment } from "~/environments/environment";
import * as appSettings from "tns-core-modules/application-settings";

@Injectable()
export class BankService {

    constructor(@Inject(AUTH_SERVICE_IMPL) private authenticationService: IAuthentication) { }

    __getBankByBLZ__(blz: string) : [string,any] {

        let headerOptions = {
            "Content-Type": "application/x-www-form-urlencoded"
        };

        return [this.authenticationService.getBackendUrl() + "/banks/" + blz, headerOptions ];
    }

    __getRecurrentTransactions__() : [string,any] {

        let headerOptions = {
            "Authorization": this.authenticationService.getStoredUser().UserToken.TokenType + " " + this.authenticationService.getStoredUser().UserToken.AccessToken,
            "Content-Type": "application/json"
        };

        return [this.authenticationService.getBackendUrl() + "/recurrentTransactions", headerOptions ];
    }

    __updateRecurrentTransactions__(recurrenttransactions: Array<RecurrentTransaction>): [string, any, any] {

        let headerOptions = {
            "Authorization": this.authenticationService.getStoredUser().UserToken.TokenType + " " + this.authenticationService.getStoredUser().UserToken.AccessToken,
            "Content-Type": "application/json"
        };

        return [this.authenticationService.getBackendUrl() + "/recurrentTransactions/update", { recurrenttransactions: recurrenttransactions }, headerOptions ];
    }

    __getWebformIdAndToken__(bank: Bank): [string, any, any] {

        let headerOptions = {
            "Authorization": this.authenticationService.getStoredUser().UserToken.TokenType + " " + this.authenticationService.getStoredUser().UserToken.AccessToken,
            "Content-Type": "application/json"
        };

        return [this.authenticationService.getBackendUrl() + "/bankConnections/import", { bankId: bank.Id }, headerOptions ];
    }

    __getAllowance__(): [string, any] {

        let headerOptions = {
            "Username": this.authenticationService.getStoredUser().Username,
            "Authorization": this.authenticationService.getStoredUser().UserToken.TokenType + " " + this.authenticationService.getStoredUser().UserToken.AccessToken,
            "Content-Type": "application/x-www-form-urlencoded"
        };

        return [this.authenticationService.getBackendUrl() + "/allowance", headerOptions ];
    }

    getBankByBLZ(blz: string) : Promise<Bank> {
        let request = this.__getBankByBLZ__(blz);
        return Https.request({
            url: request[0],
            method: 'GET',
            headers: request[1],
            timeout: 10
        }).then(res => {
            // always take the first element, assumed blz is unique only to one bank
            let bank = new Bank();
            bank.Bic = res["content"]["banks"][0]["bic"];
            bank.Blz = res["content"]["banks"][0]["blz"];
            bank.Id = res["content"]["banks"][0]["id"];
            bank.LoginHint = res["content"]["banks"][0]["loginHint"];
            bank.Name = res["content"]["banks"][0]["name"];

            return bank;
        })
        .catch((err) => {
            console.log("Bank info acquisition failed!");
            console.log(err);
            return undefined;
        });
    }

    getRecurrentTransactions() : Promise<Array<RecurrentTransaction>> {
        let request = this.__getRecurrentTransactions__();
        return Https.request({
            url: request[0],
            method: 'GET',
            headers: request[1],
            timeout: 10
        }).then(res => {
            let recurrentTransactions: Array<RecurrentTransaction> = [];
            console.log(res);
            for(let item in res["content"]["recurrenttransactions"]){
                let r: RecurrentTransaction = new RecurrentTransaction();
                r.Id = res["content"]["recurrenttransactions"][item]["id"];
                r.AccountId = res["content"]["recurrenttransactions"][item]["accountId"];
                r.AbsAmount = res["content"]["recurrenttransactions"][item]["absAmount"];
                r.IsExpense = res["content"]["recurrenttransactions"][item]["isExpense"];
                r.IsConfirmed = res["content"]["recurrenttransactions"][item]["isConfirmed"];
                r.Frequency = res["content"]["recurrenttransactions"][item]["frequency"];
                r.CounterPartName = res["content"]["recurrenttransactions"][item]["counterPartName"];
                recurrentTransactions.push(r);
            }

            return recurrentTransactions;
        })
        .catch((err) => {
            console.log("Recurrent transactions acquisition failed!");
            console.log(err);
            return undefined;
        });
    }

    /*
     * return [ Id , Access Token, Status ]
     */
    getWebformIdAndToken(bank: Bank): Promise<[string, string, string, string]> {
        let request = this.__getWebformIdAndToken__(bank);
        return Https.request({
            url: request[0],
            method: 'POST',
            body: request[1],
            headers: request[2],
            timeout: 10
        }).then(res => {
            if(res.statusCode != 200) {
                return undefined;
            }
            console.log("WebForm Valid");
            console.log(res);
            return res["content"]["location"] + "?callbackUrl=" + encodeURIComponent(environment.CallbackEndpointURL + "/webForms/callback/" + res["content"]["webFormAuth"] + "-" + appSettings.getString("pushToken"));
        }, err => {
            console.log("WebForm Invalid");
            console.log(err);
            return undefined;
        });
    }

    /*
     * return [ Id , Access Token, Status ]
     */
    updateRecurrentTransactions(recurrenttransactions: Array<RecurrentTransaction>): Promise<boolean> {
        let request = this.__updateRecurrentTransactions__(recurrenttransactions);
        return Https.request({
            url: request[0],
            method: 'POST',
            body: request[1],
            headers: request[2],
            timeout: 10
        }).then(res => {
            console.log(res);
            return (res.statusCode != 200);
        }, err => {
            console.log("Update Recurrent Transaction Failed");
            console.log(err);
            return false;
        });
    }

    getAllowance(): Promise<number> {
        let request = this.__getAllowance__();
        return Https.request({
            url: request[0],
            method: 'GET',
            headers: request[1],
            timeout: 10
        }).then(res => {
            return res["content"]["allowance"];
        })
        .catch((err) => {
            console.log("Get allowance failed!");
            console.log(err);
            return undefined;
        });
    }
}