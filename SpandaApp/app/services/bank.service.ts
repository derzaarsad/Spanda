import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { Bank } from "../models/bank.model";
import { AuthenticationService } from "../services/authentication.service";

@Injectable()
export class BankService {
    private serverUrl = "https://sandbox.finapi.io";
    private client_id = "3996d8ae-abaf-490f-9abe-41c64bd82ab6";
    private client_secret = "35525147-fec5-4a48-8a3f-5511221a32f1";
    private bankPerPage = "2";

    constructor(private http: HttpClient, private authenticationService: AuthenticationService) { }

    getBankByBLZ(blz: string) : Promise<Bank> {

        return this.authenticationService.authenticateClientAndSave().then(() => {

            let headerOptions = new HttpHeaders({
                "Authorization": this.authenticationService.getClientTokenType() + " " + this.authenticationService.getClientAccessToken(),
                "Content-Type": "application/x-www-form-urlencoded"
            });

            return this.http.get(this.serverUrl + "/api/v1/banks?search=" + blz + "&page=1&perPage=" + this.bankPerPage + "&order=id", { headers: headerOptions }).toPromise()
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
}