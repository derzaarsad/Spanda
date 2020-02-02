import { Component, OnInit, Inject } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ActivatedRoute } from "@angular/router";
import { NavigationOptions } from "nativescript-angular/router/ns-location-strategy";
import { Page } from "tns-core-modules/ui/page";
import { IAuthentication,AUTH_SERVICE_IMPL } from "~/services/authentication.service";
import { BankService } from "~/services/bank.service"

@Component({
    selector: "allowance",
    templateUrl: "./allowance.html",
    styleUrls: ["./allowance.css"]
})
export class AllowanceComponent implements OnInit {

    private allowanceValue: string = '0€';

    constructor(
        private routerExtensions: RouterExtensions,
        private activeRoute: ActivatedRoute,
        private page: Page,
        @Inject(AUTH_SERVICE_IMPL) private authenticationService: IAuthentication,
        private bankService: BankService) {
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;
    }

    onTap() {
        this.routerExtensions.navigate(["../searchBank"], { clearHistory: true, relativeTo: this.activeRoute });
    }

    onLogOut() {
        this.authenticationService.removeAllUserAuthentication();
        this.routerExtensions.navigate(["login"], { clearHistory: true });
    }

    onRefreshAllowance() {
        this.bankService.getAllowance().then((res) => {
            this.allowanceValue = res.toString() + "€";
        });
    }
}