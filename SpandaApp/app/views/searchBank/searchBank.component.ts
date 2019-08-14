import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { NavigationOptions } from "nativescript-angular/router/ns-location-strategy";
import { Page, EventData } from "tns-core-modules/ui/page";
import { alert } from "tns-core-modules/ui/dialogs";

import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import * as appSettings from "tns-core-modules/application-settings";
import { BankService } from "../../services/bank.service";
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

        webview.on(WebView.loadFinishedEvent, function (args: LoadEventData) {
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
        this.bankService.getWebformIdAndToken(this.bank, appSettings.getString("token_type"), appSettings.getString("access_token")).then((res) => {
            this.webViewSrc = "https://sandbox.finapi.io/webForm/" + res[1];
            console.log(res[0]);
            console.log(res[1]);
            console.log(res[2]);
        });
    }
}