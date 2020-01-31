import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { AppRoutingModule, navigatableComponents, authProviders } from "./app.routing";

import { AppComponent } from "./app.component";

import { AuthenticationService, AUTH_SERVICE_IMPL } from "./services/authentication.service";
import { BankService } from "./services/bank.service";

import { HomeModule } from "./views/home/home.module";

@NgModule({
  providers: [
    authProviders,
    { provide: AUTH_SERVICE_IMPL,  useClass:   AuthenticationService },
    BankService
  ],
  declarations: [
    AppComponent,
    ...navigatableComponents],
  entryComponents: [
  ],
  bootstrap: [AppComponent],
  imports: [
    AppRoutingModule,
    HomeModule,
    NativeScriptModule,
    NativeScriptFormsModule
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
