import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

import { HomeComponent } from "./home.component";
import { AllowanceComponent } from "../allowance/allowance.component";
import { RecurrentTransactionComponent } from "../recurrentTransaction/recurrentTransaction.component";

import { authProviders } from "../../app.routing"

const routes: Routes = [
    { path: "home", component: HomeComponent, children: [
        { path: "allowance", component: AllowanceComponent, outlet: "homeRouterOutlet" },
        { path: "recurrentTransaction", component: RecurrentTransactionComponent, outlet: "homeRouterOutlet" },
    ],
    canActivate: authProviders }
];

@NgModule({
    imports: [NativeScriptRouterModule.forChild(routes)],
    exports: [NativeScriptRouterModule]
})
export class HomeRoutingModule { }