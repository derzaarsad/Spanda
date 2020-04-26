import { Injectable, Inject } from "@angular/core";
import { SharedBank } from "dinodime-sharedmodel";
import { IAuthentication, AUTH_SERVICE_IMPL } from "~/services/authentication.service";
import { SharedRecurrentTransaction } from "dinodime-sharedmodel";
import { environment } from "~/environments/environment";
import * as appSettings from "tns-core-modules/application-settings";
import { GetGetBankByBlz, GetGetRecurrentTransactions, PostGetWebformIdAndToken, PostUpdateRecurrentTransactions, GetGetAllowance } from "./bank-utils";

@Injectable()
export class BankService {

    constructor(@Inject(AUTH_SERVICE_IMPL) private authenticationService: IAuthentication) { }

    getBankByBLZ(blz: string) : Promise<SharedBank> {
        return GetGetBankByBlz(this.authenticationService.getBackendUrl(),blz).then(content => {
            if(content.banks.length > 0) {
                // always take the first element, assumed blz is unique only to one bank
                let bank: SharedBank;
                bank.bic = content.banks[0]["bic"];
                bank.blz = content.banks[0]["blz"];
                bank.id = content.banks[0]["id"];
                bank.loginHint = content.banks[0]["loginHint"];
                bank.name = content.banks[0]["name"];

                return bank;
            }
            else {
                return undefined;
            }
        })
        .catch((err) => {
            console.log("Bank info acquisition failed!");
            console.log(err);
            return undefined;
        });
    }

    getRecurrentTransactions() : Promise<Array<SharedRecurrentTransaction>> {
        return GetGetRecurrentTransactions(this.authenticationService.getBackendUrl(),this.authenticationService.getStoredUser().UserToken).then(content => content.recurrenttransactions)
        .catch((err) => {
            console.log("Recurrent transactions acquisition failed!");
            console.log(err);
            return undefined;
        });
    }

    /*
     * return [ Id , Access Token, Status ]
     */
    getWebformIdAndToken(bank: SharedBank): Promise<[string, string, string, string]> {
        return PostGetWebformIdAndToken(this.authenticationService.getBackendUrl(),bank,this.authenticationService.getStoredUser().UserToken).then(content => {

            console.log("WebForm Valid");
            return content.location + "?callbackUrl=" + encodeURIComponent(environment.CallbackEndpointURL + "/webForms/callback/" + encodeURIComponent(content.webFormAuth + "-" + appSettings.getString("pushToken")));
        }, err => {
            console.log("WebForm Invalid");
            console.log(err);
            return undefined;
        });
    }

    /*
     * return [ Id , Access Token, Status ]
     */
    updateRecurrentTransactions(recurrenttransactions: Array<SharedRecurrentTransaction>): Promise<boolean> {
        return PostUpdateRecurrentTransactions(this.authenticationService.getBackendUrl(),recurrenttransactions,this.authenticationService.getStoredUser().UserToken).then(content => true,
            err => {
                console.log("Update Recurrent Transaction Failed");
                console.log(err);
                return false;
            });
    }

    getAllowance(): Promise<number> {
        return GetGetAllowance(this.authenticationService.getBackendUrl(),this.authenticationService.getStoredUser().Username,this.authenticationService.getStoredUser().UserToken).then(content => {
            return content.allowance;
        })
        .catch((err) => {
            console.log("Get allowance failed!");
            console.log(err);
            return undefined;
        });
    }
}