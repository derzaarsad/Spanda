import { Injectable } from "@angular/core";
import { Router, CanActivate } from "@angular/router";
import * as appSettings from "tns-core-modules/application-settings";
import { AuthenticationService } from "./authentication.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authenticationService: AuthenticationService) { }

  canActivate() : Promise<boolean> | boolean {
    
    // Check whether there are saved credentials
    if(appSettings.hasKey("access_token")) {
      console.log("get in");
      // Is access token still valid?
      return this.authenticationService.isUserAuthenticated(appSettings.getString("access_token"), appSettings.getString("token_type")).then((resultAuth) => {
        if(!resultAuth) {
          console.log("get to refresh token")
          // Get access token using refresh token
          return this.authenticationService.setNewRefreshAndAccessToken(appSettings.getString("refresh_token")).then((resultRefresh) => {
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