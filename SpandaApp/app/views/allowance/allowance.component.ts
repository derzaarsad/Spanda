import { Component, OnInit } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { NavigationOptions } from "nativescript-angular/router/ns-location-strategy";
import { Page } from "tns-core-modules/ui/page";
import { AuthenticationService } from "~/services/authentication.service";
import { BankService } from "~/services/bank.service"

@Component({
    selector: "allowance",
    templateUrl: "./allowance.html",
    styleUrls: ["./allowance.css"]
})
export class AllowanceComponent implements OnInit {

    private allowanceValue: number = 0;

    constructor(
        private routerExtensions: RouterExtensions,
        private page: Page,
        private authenticationService: AuthenticationService,
        private bankService: BankService) {
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;
    }

    onTap() {
        this.routerExtensions.navigate(["searchBank"]);
    }

    onLogOut() {
        this.authenticationService.removeAllUserAuthentication();
        this.routerExtensions.navigate(["login"]);
    }

    onRefreshAllowance() {
        this.bankService.getAllowance().then((res) => {
            this.allowanceValue = res;
        });
    }
}