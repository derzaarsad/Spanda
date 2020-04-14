import { Injectable, Inject } from "@angular/core";
import { CanActivate } from "@angular/router";
import { RouterExtensions } from "nativescript-angular/router";
import { IAuthentication,AUTH_SERVICE_IMPL } from "./authentication.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private routerExtensions: RouterExtensions, @Inject(AUTH_SERVICE_IMPL) private authenticationService: IAuthentication) { }

  canActivate() : Promise<boolean> | boolean {
    
    // Check whether there are saved credentials
    if(this.authenticationService.isStoredUserAvailable()) {
      console.log("stored user available");
      // Is access token still valid?
      return this.authenticationService.isUserAuthenticated(this.authenticationService.getStoredUser().UserToken.access_token, this.authenticationService.getStoredUser().UserToken.token_type).then((resultAuth) => {
        if(!resultAuth) {
          console.log("get to refresh token")
          // Get access token using refresh token
          return this.authenticationService.setNewRefreshAndAccessToken().then((resultRefresh) => {
            if(!resultRefresh) {
              this.routerExtensions.navigate(['login'], { clearHistory: true });
            }

            return resultRefresh;
          });
        }

        return resultAuth;
      });
    }

    console.log("no credentials!");
    this.routerExtensions.navigate(['login'], { clearHistory: true });
    return false;
  }

}