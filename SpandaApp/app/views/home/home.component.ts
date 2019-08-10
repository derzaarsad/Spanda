import { Component } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "tns-core-modules/ui/page";

@Component({
    selector: "home",
    templateUrl: "./home.html",
    styleUrls: ["./home.css"]
})
export class HomeComponent {
    constructor(private routerExtensions: RouterExtensions,
        private page: Page) {
        page.actionBarHidden = true;
        this.routerExtensions.navigate(["allowance"]);
    }
}