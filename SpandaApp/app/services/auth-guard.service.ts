import { Injectable } from "@angular/core";
import { Router, CanActivate } from "@angular/router";
import * as appSettings from "tns-core-modules/application-settings";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate() {
    // Check whether there are saved credentials
    if(appSettings.hasKey("access_token")) {
      // Is access token still valid?
      console.log("AUth okay!!!");
      return true;
    }

    console.log("AUth not okay!!!");
    this.router.navigate(["login"]);
    return false;
  }

}