import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ActivatedRoute } from "@angular/router";
import { NavigationOptions } from "nativescript-angular/router/ns-location-strategy";
import { Page, EventData } from "tns-core-modules/ui/page";
import { alert } from "tns-core-modules/ui/dialogs";

import { BankService } from "~/services/bank.service";
import { AuthenticationService } from "~/services/authentication.service";
import { Bank } from "~/models/bank.model";
import * as utils from "tns-core-modules/utils/utils";

@Component({
    selector: "searchBank",
    templateUrl: "./searchBank.html",
    styleUrls: ["./searchBank.css"],
    providers: [BankService]
})
export class SearchBankComponent implements OnInit {
    private SearchedBlz: string = "";
    private bank: Bank;
    private EnableBank: boolean = false;
    private invalidUrl = "https://invalidurl";

    constructor(
        private routerExtensions: RouterExtensions,
        private activeRoute: ActivatedRoute,
        private page: Page,
        private bankService: BankService) {
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;
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
        this.bankService.getWebformIdAndToken(this.bank).then((res) => {
            if(!res) {
                return;
            }
            utils.openUrl(res + "&redirectUrl=" + this.invalidUrl);
        });
    }
}