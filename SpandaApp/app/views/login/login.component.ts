import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { NavigationOptions } from "nativescript-angular/router/ns-location-strategy";
import { Page } from "tns-core-modules/ui/page";
import { AuthenticationService } from "../../services/authentication.service";

@Component({
    selector: "login",
    templateUrl: "./login.html",
    styleUrls: ["./login.css"],
    providers: [AuthenticationService]
})
export class LoginComponent implements OnInit {

    constructor(
        private routerExtensions: RouterExtensions,
        private page: Page,
        private authenticationService: AuthenticationService) {
    }

    ngOnInit(): void {
    }
}