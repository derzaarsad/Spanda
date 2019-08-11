import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";
import { NativeScriptFormsModule } from "nativescript-angular/forms";
import { NativeScriptRouterModule } from "nativescript-angular/router";
import { routes, navigatableComponents, authProviders } from "./app.routing";

import { NativeScriptHttpClientModule } from "nativescript-angular/http-client";

import { AppComponent } from "./app.component";
import { HomeComponent } from "./views/home/home.component";

import { AuthenticationService } from "./services/authentication.service";
import { UserService } from "./services/user.service";

@NgModule({
  providers: [
    authProviders,
    AuthenticationService,
    UserService
  ],
  declarations: [
    AppComponent,
    ...navigatableComponents],
  entryComponents: [
  ],
  bootstrap: [AppComponent],
  imports: [
    NativeScriptModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule,
    NativeScriptRouterModule.forRoot(routes),
    NativeScriptHttpClientModule
  ],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
