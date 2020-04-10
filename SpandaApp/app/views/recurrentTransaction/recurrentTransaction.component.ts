import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ActivatedRoute } from "@angular/router";
import { NavigationOptions } from "nativescript-angular/router/ns-location-strategy";
import { Page, EventData } from "tns-core-modules/ui/page";

@Component({
    selector: "recurrentTransaction",
    templateUrl: "./recurrentTransaction.html",
    styleUrls: ["./recurrentTransaction.css"]
})
export class RecurrentTransactionComponent implements OnInit {

    constructor(
        private routerExtensions: RouterExtensions,
        private activeRoute: ActivatedRoute,
        private page: Page) {
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;
    }
}