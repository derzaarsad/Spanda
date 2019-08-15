import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Bank } from "../models/bank.model";
import { AuthenticationService } from "../services/authentication.service";

@Injectable()
export class BankService {
    private bankPerPage = "2";

    constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }

    getBankByBLZ(blz: string) : Promise<Bank> {

        return this.authenticationService.authenticateClientAndSave().then(() => {

            let headerOptions = new HttpHeaders({
                "Authorization": this.authenticationService.getClientTokenType() + " " + this.authenticationService.getClientAccessToken(),
                "Content-Type": "application/x-www-form-urlencoded"
            });

            return this.http.get(this.authenticationService.getServerUrl() + "/api/v1/banks?search=" + blz + "&page=1&perPage=" + this.bankPerPage + "&order=id", { headers: headerOptions }).toPromise()
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
        })
        .catch(() => {
            console.log("Client authentication failed!");
            return undefined;
        });
    }

    /*
     * return [ Id , Access Token, Status ]
     */
    getWebformIdAndToken(bank: Bank): Promise<[string, string, string]> {

        let headerOptions = new HttpHeaders({
            "Authorization": this.authenticationService.getStoredUser().userToken.TokenType + " " + this.authenticationService.getStoredUser().userToken.AccessToken,
            "Content-Type": "application/json"
        });

        return this.http.post(this.authenticationService.getServerUrl() + "/api/v1/bankConnections/import", { bankId: bank.Id }, { headers: headerOptions }).toPromise()
        .then(res => {
            // It has to be an error (code 451), because we want to open the Web Form
            return undefined;
        }, err => {
            let webId = err["error"]["errors"][0]["message"];
            console.log(webId);
            
            let headerOptions = new HttpHeaders({
                "Authorization": this.authenticationService.getStoredUser().userToken.TokenType + " " + this.authenticationService.getStoredUser().userToken.AccessToken
            });
            return this.http.get(this.authenticationService.getServerUrl() + "/api/v1/webForms/" + webId, { headers: headerOptions }).toPromise()
            .then(res => {
                console.log("WebForm Valid");
                console.log(res);
                return [res["id"], res["token"], res["status"]];
            }, err => {
                console.log("WebForm Invalid");
                console.log(err);
                return undefined;
            });
        });
    }

    fetchWebformInfo(webId: string): Promise<JSON> {
        let headerOptions = new HttpHeaders({
            "Authorization": this.authenticationService.getStoredUser().userToken.TokenType + " " + this.authenticationService.getStoredUser().userToken.AccessToken,
            "Content-Type": "application/x-www-form-urlencoded"
        });

        return this.http.get(this.authenticationService.getServerUrl() + "/api/v1/webForms/" + webId, { headers: headerOptions }).toPromise()
        .then(res => {
            // always take the first element, assumed blz is unique only to one bank
            let serviceResponseBody = res["serviceResponseBody"];
            if (serviceResponseBody === undefined) {
                throw "serviceResponseBody undefined!";
            }

            return JSON.parse(serviceResponseBody);
        })
        .catch((err) => {
            console.log("Fetching webform failed!");
            console.log(err);
            return undefined;
        });
    }
}