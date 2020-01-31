import { AllowanceComponent } from "./views/allowance/allowance.component";
import { LoginComponent } from "./views/login/login.component";
import { SearchBankComponent } from "./views/searchBank/searchBank.component";
import { AuthGuard } from "./services/auth-guard.service";
import { NgModule } from "@angular/core";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "nativescript-angular/router";

export const authProviders = [
  AuthGuard
];

const routes: Routes = [
    { path: "", redirectTo: "/home", pathMatch: "full" },
    { path: "login", component: LoginComponent }
];

export const navigatableComponents: any = [
    LoginComponent,
    AllowanceComponent,
    SearchBankComponent
];

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }