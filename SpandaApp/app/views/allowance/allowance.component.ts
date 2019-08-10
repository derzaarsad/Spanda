import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { NavigationOptions } from "nativescript-angular/router/ns-location-strategy";
import { Page } from "tns-core-modules/ui/page";
import { AuthenticationService } from "../../services/authentication.service";

@Component({
    selector: "allowance",
    templateUrl: "./allowance.html",
    styleUrls: ["./allowance.css"],
    providers: [AuthenticationService]
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

        this.authenticationService
            .authenticateAndSave("testuser", "password123").then(function(result) {
            // here you can use the result of promiseB
            console.log(result);
        });
    }
}