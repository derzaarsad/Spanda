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
import { WebView, LoadEventData } from "tns-core-modules/ui/web-view";
import * as appSettings from "tns-core-modules/application-settings";

@Component({
    selector: "searchBank",
    templateUrl: "./searchBank.html",
    styleUrls: ["./searchBank.css"],
    providers: [BankService]
})
export class SearchBankComponent implements OnInit {
    private SearchedBlz: string = "";
    private bank: Bank;
    private enableBank: boolean = false;
    private enableWebView: boolean = false;
    private webViewSrc = "";

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
            this.enableBank = true;
        }).catch(()=>{
            this.alert("Bank not found!");
        });
    }

    private onAddAccount() {
        this.bankService.getWebformIdAndToken(this.bank).then((res) => {
            if(!res) {
                return;
            }
            this.webViewSrc = res + "-" + encodeURIComponent(appSettings.getString("pushToken"));
            this.enableWebView = true;
        });
    }

    onLoadStarted(args: LoadEventData) {
        const webView = args.object as WebView;

        if (!args.error) {
            console.log("Load Start");
            console.log(`EventName: ${args.eventName}`);
            console.log(`NavigationType: ${args.navigationType}`);
            console.log(`Url: ${args.url}`);
        } else {
            console.log(`EventName: ${args.eventName}`);
            console.log(`Error: ${args.error}`);
        }
    }

    onLoadFinished(args: LoadEventData) {
        const webView = args.object as WebView;

        if (!args.error) {
            console.log("Load Finished");
            console.log(`EventName: ${args.eventName}`);
            console.log(`NavigationType: ${args.navigationType}`);
            console.log(`Url: ${args.url}`);
        } else {
            console.log(`EventName: ${args.eventName}`);
            console.log(`Error: ${args.error}`);
        }
    }

}