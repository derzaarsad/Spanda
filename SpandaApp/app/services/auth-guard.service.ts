import { Injectable } from "@angular/core";
import { Router, CanActivate } from "@angular/router";
import { AuthenticationService } from "./authentication.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authenticationService: AuthenticationService) { }

  canActivate() : Promise<boolean> | boolean {
    
    // Check whether there are saved credentials
    if(this.authenticationService.getStoredUser()) {
      console.log("stored user available");
      // Is access token still valid?
      return this.authenticationService.isUserAuthenticated(this.authenticationService.getStoredUser().userToken.AccessToken, this.authenticationService.getStoredUser().userToken.TokenType).then((resultAuth) => {
        if(!resultAuth) {
          console.log("get to refresh token")
          // Get access token using refresh token
          return this.authenticationService.setNewRefreshAndAccessToken(this.authenticationService.getStoredUser().userToken.RefreshToken).then((resultRefresh) => {
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