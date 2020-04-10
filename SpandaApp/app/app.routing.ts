import { AllowanceComponent } from "./views/allowance/allowance.component";
import { RecurrentTransactionComponent } from "./views/recurrentTransaction/recurrentTransaction.component";
import { AuthGuard } from "./services/auth-guard.service";
import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

export const authProviders = [
  AuthGuard
];

const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch: "full" }
];

export const navigatableComponents: any = [
    AllowanceComponent,
    RecurrentTransactionComponent
];

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }