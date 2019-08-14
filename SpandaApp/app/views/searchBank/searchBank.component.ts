import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { NavigationOptions } from "nativescript-angular/router/ns-location-strategy";
import { Page, EventData } from "tns-core-modules/ui/page";
import { alert } from "tns-core-modules/ui/dialogs";

import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import * as appSettings from "tns-core-modules/application-settings";
import { BankService } from "../../services/bank.service";
import { Bank } from "~/models/bank.model";

@Component({
    selector: "searchBank",
    templateUrl: "./searchBank.html",
    styleUrls: ["./searchBank.css"],
    providers: [BankService]
})
export class SearchBankComponent implements OnInit {
    private SearchedBlz: string;
    private BankName: string;
    private EnableBank: boolean;

    constructor(
        private routerExtensions: RouterExtensions,
        private page: Page,
        private bankService: BankService) {
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;
        this.SearchedBlz = "";
        this.BankName = "Unknown Bank";
        this.EnableBank = false;
    }

    alert(message: string) {
        return alert({
            title: "DERZA APP",
            okButtonText: "OK",
            message: message
        });
    }

    private onSearch() {
        if(this.SearchedBlz.length !== 8) {
            this.alert("Invalid BLZ");
            return;
        }

        this.bankService.getBankByBLZ(this.SearchedBlz).then((bank) => {
            this.BankName = bank.Name;
            this.EnableBank = true;
        }).catch(()=>{
            this.alert("Bank not found!");
        });
    }

    private onAddAccount() {

    }

    // private serverUrl = "https://sandbox.finapi.io";
    // postData(data: any) {
    //     let options = this.createRequestOptions();
    //     return this.http.post(this.serverUrl + "/api/v1/bankConnections/import", data, { headers: options });
    // }

    // private createRequestOptions() {
    //     let headers = new HttpHeaders({
    //         "Authorization": appSettings.getString("token_type") + " " + appSettings.getString("access_token"),
    //         "Content-Type": "application/json"
    //     });
    //     return headers;
    // }

    private goToWebForm() {
        // this.postData({ bankId: 277672 }).toPromise()
        // .then(res => {
        //     // It has to be an error (code 451), because we want to open the Web Form
        // }, err => {
        //     let webId = err["error"]["errors"][0]["message"];
        //     console.log(webId);

        //     let headerOptions = new HttpHeaders({
        //         "Authorization": appSettings.getString("token_type") + " " + appSettings.getString("access_token")
        //      });
        //     this.http.get(this.serverUrl + "/api/v1/webForms/" + webId, { headers: headerOptions }).toPromise()
        // .then(res => {
        //     console.log("WebForm Valid");
        //     console.log(res);
        //     return true;
        // }, err => {
        //     console.log("WebForm Invalid");
        //     console.log(err);
        //     return false;
        // });

        // });
        // //this.routerExtensions.navigate(["registration"]);
    }
}