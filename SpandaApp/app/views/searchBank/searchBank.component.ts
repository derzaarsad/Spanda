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

    private onBack() {
        this.routerExtensions.navigate(['../home'], { clearHistory: true, relativeTo: this.activeRoute });
    }

}