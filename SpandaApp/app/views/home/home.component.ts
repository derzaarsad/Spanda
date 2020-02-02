import { Component } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { Page } from "tns-core-modules/ui/page";
import { ActivatedRoute } from "@angular/router";

@Component({
    selector: "home",
    templateUrl: "./home.html",
    styleUrls: ["./home.css"]
})
export class HomeComponent {
    constructor(private routerExtensions: RouterExtensions,
        private page: Page,
        private activeRoute: ActivatedRoute) {
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;
        this.routerExtensions.navigate([{ outlets: { homeRouterOutlet: ["allowance"] } }], { clearHistory: true, relativeTo: this.activeRoute });
    }
}