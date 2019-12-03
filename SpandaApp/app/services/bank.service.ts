import { Injectable, Inject } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Bank } from "~/models/bank.model";
import { IAuthentication, AUTH_SERVICE_IMPL } from "~/services/authentication.service";
import { Token } from "~/models/token.model";

@Injectable()
export class BankService {

    constructor(private http: HttpClient, @Inject(AUTH_SERVICE_IMPL) private authenticationService: IAuthentication) { }

    __getBankByBLZ__(blz: string) : [string,any] {

        let headerOptions = new HttpHeaders({
            "Content-Type": "application/x-www-form-urlencoded"
        });

        return [this.authenticationService.getBackendUrl() + "/banks/" + blz, { headers: headerOptions }];
    }

    __getWebformIdAndToken__(bank: Bank): [string, any, any] {

        let headerOptions = new HttpHeaders({
            "Authorization": this.authenticationService.getStoredUser().UserToken.TokenType + " " + this.authenticationService.getStoredUser().UserToken.AccessToken,
            "Content-Type": "application/json"
        });

        return [this.authenticationService.getBackendUrl() + "/bankConnections/import", { bankId: bank.Id }, { headers: headerOptions }];
    }

    __getAllowance__(): [string, any] {

        let headerOptions = new HttpHeaders({
            "Username": this.authenticationService.getStoredUser().Username,
            "Authorization": this.authenticationService.getStoredUser().UserToken.TokenType + " " + this.authenticationService.getStoredUser().UserToken.AccessToken,
            "Content-Type": "application/x-www-form-urlencoded"
        });

        return [this.authenticationService.getBackendUrl() + "/allowance", { headers: headerOptions }];
    }

    getBankByBLZ(blz: string) : Promise<Bank> {
        let request = this.__getBankByBLZ__(blz);
        return this.http.get(request[0],request[1]).toPromise()
        .then(res => {
            // always take the first element, assumed blz is unique only to one bank
            let bank = new Bank();
            bank.Bic = res["banks"][0]["bic"];
            bank.Blz = res["banks"][0]["blz"];
            bank.Id = res["banks"][0]["id"];
            bank.LoginHint = res["banks"][0]["loginHint"];
            bank.Name = res["banks"][0]["name"];

            return bank;
        })
        .catch((err) => {
            console.log("Bank info acquisition failed!");
            console.log(err);
            return undefined;
        });
    }

    /*
     * return [ Id , Access Token, Status ]
     */
    getWebformIdAndToken(bank: Bank): Promise<[string, string, string, string]> {
        let request = this.__getWebformIdAndToken__(bank);
        return this.http.post(request[0],request[1],request[2]).toPromise()
        .then(res => {
            console.log("WebForm Valid");
            console.log(res);
            return res["location"] + "?callbackUrl=" + this.authenticationService.getBackendUrl() + "/webForms/callback/" + res["webFormAuth"];
        }, err => {
            console.log("WebForm Invalid");
            console.log(err);
            return undefined;
        });
    }

    getAllowance(): Promise<number> {
        let request = this.__getAllowance__();
        return this.http.get(request[0],request[1]).toPromise()
        .then(res => {
            return res["allowance"];
        })
        .catch((err) => {
            console.log("Get allowance failed!");
            console.log(err);
            return undefined;
        });
    }
}