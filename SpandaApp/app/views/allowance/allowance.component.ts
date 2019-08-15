import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { NavigationOptions } from "nativescript-angular/router/ns-location-strategy";
import { Page } from "tns-core-modules/ui/page";
import { AuthenticationService } from "~/services/authentication.service";

@Component({
    selector: "allowance",
    templateUrl: "./allowance.html",
    styleUrls: ["./allowance.css"]
})
export class AllowanceComponent implements OnInit {
    allowanceValue: number;

    constructor(
        private routerExtensions: RouterExtensions,
        private page: Page,
        private authenticationService: AuthenticationService) {
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;
        this.allowanceValue = 34;
    }

    onTap() {
        this.routerExtensions.navigate(["searchBank"]);
    }

    onLogOut() {
        this.authenticationService.removeAllUserAuthentication();
        this.routerExtensions.navigate(["login"]);
    }
}