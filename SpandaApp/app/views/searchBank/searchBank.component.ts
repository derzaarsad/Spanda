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
    private bank: Bank;
    private EnableBank: boolean;

    constructor(
        private routerExtensions: RouterExtensions,
        private page: Page,
        private bankService: BankService) {
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;
        this.SearchedBlz = "";
        this.bank = new Bank();
        this.bank.Name = "Unknown Bank";
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
            this.bank = bank;
            this.EnableBank = true;
        }).catch(()=>{
            this.alert("Bank not found!");
        });
    }

    private onAddAccount() {
        this.bankService.getWebformIdAndToken(this.bank, appSettings.getString("token_type"), appSettings.getString("access_token")).then((res) => {
            console.log(res[0]);
            console.log(res[1]);
            console.log(res[2]);
        });
    }
}