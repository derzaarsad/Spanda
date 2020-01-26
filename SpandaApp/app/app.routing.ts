import { HomeComponent } from "./views/home/home.component";
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
    { path: "", pathMatch: "full", component: HomeComponent },
    { path: "home", component: HomeComponent },
    { path: "login", component: LoginComponent },
    { path: "allowance", component: AllowanceComponent, canActivate: authProviders },
    { path: "searchBank", component: SearchBankComponent, canActivate: authProviders }
];

export const navigatableComponents: any = [
    HomeComponent,
    LoginComponent,
    AllowanceComponent,
    SearchBankComponent
];

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule]
})
export class AppRoutingModule { }