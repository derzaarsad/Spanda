import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { User } from "../models/user.model";
import { AuthenticationService } from "../services/authentication.service";

@Injectable()
export class UserService {
  constructor(private router: Router, private authenticationService: AuthenticationService) { }

  login(user: User) : any {
      return this.authenticationService.authenticateAndSave(user.Email, user.Password);
  }

  register(user: User) : any {
      //TODO
  }

  resetPassword(textSTr: string) : any {
      //TODO
  }

}