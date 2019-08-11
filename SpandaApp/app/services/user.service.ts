import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import * as appSettings from "tns-core-modules/application-settings";
import { User } from "../models/user.model";

@Injectable()
export class UserService {
  constructor(private router: Router) { }

  login(user: User) : any {
      //TODO
  }

  register(user: User) : any {
      //TODO
  }

  resetPassword(textSTr: string) : any {
      //TODO
  }

}