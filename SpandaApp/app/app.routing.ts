import { HomeComponent } from "./views/home/home.component";
import { AllowanceComponent } from "./views/allowance/allowance.component";
import { AuthGuard } from "./services/auth-guard.service";

export const authProviders = [
  AuthGuard
];

export const routes: any = [
    { path: "", component: HomeComponent },
    { path: "home", component: HomeComponent },
    { path: "allowance", component: AllowanceComponent, canActivate: authProviders }
];

export const navigatableComponents: any = [
    HomeComponent,
    AllowanceComponent
];