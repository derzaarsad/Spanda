import { Component, OnInit, Inject } from "@angular/core";
import { RouterExtensions } from "nativescript-angular/router";
import { ActivatedRoute } from "@angular/router";
import { NavigationOptions } from "nativescript-angular/router/ns-location-strategy";
import { Page } from "tns-core-modules/ui/page";
import { IAuthentication,AUTH_SERVICE_IMPL } from "~/services/authentication.service";
import { BankService } from "~/services/bank.service"
import { AnimationCurve } from 'ui/enums';
import * as dialogs from "tns-core-modules/ui/dialogs";
import { SharedRecurrentTransaction } from "dinodime-sharedmodel";
import { TransactionFrequency } from "dinodime-sharedmodel";

@Component({
    selector: "allowance",
    templateUrl: "./allowance.html",
    styleUrls: ["./allowance.css"]
})
export class AllowanceComponent implements OnInit {

    private allowanceValue: string = '30€';
    private allowanceValue_: number = 30; // TODO: ONLY FOR TEST
    private isAllowanceIncreased: boolean = true;

    constructor(
        private routerExtensions: RouterExtensions,
        private activeRoute: ActivatedRoute,
        private page: Page,
        @Inject(AUTH_SERVICE_IMPL) private authenticationService: IAuthentication,
        private bankService: BankService) {
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;

        if(!this.authenticationService.getStoredUser().IsRecurrentTransactionConfirmed) {
            this.bankService.getRecurrentTransactions().then(res => {
                console.log(res);
                let updatedRecurrentTransactions: Array<SharedRecurrentTransaction> = [];
                for(let item in res){
                    dialogs.action({
                        message: "Do you " + (res[item].isExpense ? "spend " : "receive ") + res[item].absAmount + "€ "
                        + (res[item].isExpense ? "for" : "from") + " " + res[item].counterPartName,
                        cancelButtonText: "Not regularly",
                        actions: ["Yes, every month", "Yes, every 3 months", "Yes, every year"]
                    }).then(result => {
                        console.log("Dialog result " + res[item].counterPartName + ": " + result);
                        res[item].isConfirmed = true;
                        if(result == "Yes, every month"){
                            res[item].frequency = TransactionFrequency.Monthly;
                        }else if(result == "Yes, every 3 months"){
                            res[item].frequency = TransactionFrequency.Quarterly;
                        }else if(result == "Yes, every year"){
                            res[item].frequency = TransactionFrequency.Yearly;
                        }
                        updatedRecurrentTransactions.push(res[item]);
                        if(updatedRecurrentTransactions.length === res.length) {
                            console.log(updatedRecurrentTransactions);
                            this.bankService.updateRecurrentTransactions(updatedRecurrentTransactions);
                        }
                    });
                }
            });
        }

        this.isAllowanceIncreased = Math.random() >= 0.5 ? true : false; // TODO: ONLY FOR TEST
        let diff = this.isAllowanceIncreased ? 1 : (-1); // TODO: ONLY FOR TEST
        this.allowanceValue = (this.allowanceValue_ + diff).toString() + "€"; // TODO: ONLY FOR TEST
    }

    onTap() {
        this.routerExtensions.navigate(["searchBank"], { clearHistory: true });
    }

    onLogOut() {
        this.authenticationService.removeAllUserAuthentication();
        this.routerExtensions.navigate(["login"], { clearHistory: true });
    }
}