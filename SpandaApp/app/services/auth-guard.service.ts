import { Injectable, Inject } from "@angular/core";
import { Router, CanActivate } from "@angular/router";
import { IAuthentication,AUTH_SERVICE_IMPL } from "./authentication.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, @Inject(AUTH_SERVICE_IMPL) private authenticationService: IAuthentication) { }

  canActivate() : Promise<boolean> | boolean {
    
    // Check whether there are saved credentials
    if(this.authenticationService.isStoredUserAvailable()) {
      console.log("stored user available");
      // Is access token still valid?
      return this.authenticationService.isUserAuthenticated(this.authenticationService.getStoredUser().UserToken.AccessToken, this.authenticationService.getStoredUser().UserToken.TokenType).then((resultAuth) => {
        if(!resultAuth) {
          console.log("get to refresh token")
          // Get access token using refresh token
          return this.authenticationService.setNewRefreshAndAccessToken().then((resultRefresh) => {
            if(!resultRefresh) {
              this.router.navigate(['login']);
            }

            return resultRefresh;
          });
        }

        return resultAuth;
      });
    }

    console.log("no credentials!");
    this.router.navigate(['login']);
    return false;
  }

}