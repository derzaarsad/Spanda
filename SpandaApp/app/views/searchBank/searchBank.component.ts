import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { NavigationOptions } from "nativescript-angular/router/ns-location-strategy";
import { Page, EventData } from "tns-core-modules/ui/page";
import { alert } from "tns-core-modules/ui/dialogs";

import { BankService } from "~/services/bank.service";
import { AuthenticationService } from "~/services/authentication.service";
import { Bank } from "~/models/bank.model";

import { WebView, LoadEventData } from "tns-core-modules/ui/web-view";
import { Label } from "tns-core-modules/ui/label";

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
    private webViewSrc: string = "";
    private invalidUrl = "https://invalidurl";

    private webId: string = "";

    @ViewChild("myWebView", { read: ElementRef, static: false }) webViewRef: ElementRef;
    @ViewChild("labelResult", { read: ElementRef, static: false }) labelResultRef: ElementRef;

    constructor(
        private routerExtensions: RouterExtensions,
        private page: Page,
        private bankService: BankService) {
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;
    }

    ngAfterViewInit() {
        let webview: WebView = this.webViewRef.nativeElement;
        let label: Label = this.labelResultRef.nativeElement;
        label.text = "WebView is still loading...";

        webview.on(WebView.loadFinishedEvent, (args: LoadEventData) => {
            if((args.url !== undefined) && (args.url.startsWith(this.invalidUrl))) {
                // This is a workaround until I get a better solution

                // fetch the info from webform
                this.bankService.fetchWebformInfo(this.webId).then((res) => {
                    console.log(res);
                    this.routerExtensions.navigate(["allowance"]);
                }).catch((err) => {
                    this.routerExtensions.navigate(["allowance"]);
                });
            }

            let message;
            if (!args.error) {
                message = "WebView finished loading of " + args.url;
            } else {
                message = "Error loading " + args.url + ": " + args.error;
            }

            label.text = message;
            console.log("WebView message - " + message);
        });
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
            this.webId = res[0];
            this.webViewSrc = this.bankService.getServerUrl() + "/webForm/" + res[1] + "?redirectUrl=" + this.invalidUrl;
            console.log(res[0]);
            console.log(res[1]);
            console.log(res[2]);
        });
    }
}