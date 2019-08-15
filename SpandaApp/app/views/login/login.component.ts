// TODO
import { Component, ElementRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { alert, prompt } from "tns-core-modules/ui/dialogs";
import { Page } from "tns-core-modules/ui/page";
import { AuthenticationService } from "~/services/authentication.service";

@Component({
    selector: "login",
    templateUrl: "./login.html",
    styleUrls: ['./login.css']
})
export class LoginComponent {
    isLoggingIn = true;
    Username: string;
    Password: string;
    ConfirmPassword: string;
    @ViewChild("password", {static: false}) password: ElementRef;
    @ViewChild("confirmPassword", {static: false}) confirmPassword: ElementRef;

    constructor(private page: Page, private router: Router, private authenticationService: AuthenticationService) {
        this.page.actionBarHidden = true;

        if(this.authenticationService.getStoredUser().Username && this.authenticationService.getStoredUser().Password) {
            this.Username = this.authenticationService.getStoredUser().Username;
            this.Password = this.authenticationService.getStoredUser().Password;
        }
    }

    ngOnInit(): void {
        this.page.actionBarHidden = true;
    }

    toggleForm() {
        this.isLoggingIn = !this.isLoggingIn;
    }

    submit() {
        if (!this.Username || !this.Password) {
            this.alert("Please provide both an email address and password.");
            return;
        }

        if (this.isLoggingIn) {
            this.login();
        } else {
            this.register();
        }
    }

    login() {
        this.authenticationService.authenticateAndSave(this.Username,this.Password)
            .then(() => {
                this.router.navigate(["allowance"]);
            })
            .catch(() => {
                this.alert("Unfortunately we could not find your account.");
            });
    }

    register() {
        if (this.Password != this.ConfirmPassword) {
            this.alert("Your passwords do not match.");
            return;
        }
        this.authenticationService.register(this.Username, this.Password)
            .then(() => {
                this.alert("Your account was successfully created.");
                this.isLoggingIn = true;
                this.authenticationService.authenticateAndSave(this.Username,this.Password)
                .then(() => {
                    this.router.navigate(["searchBank"]);
                });
            })
            .catch((err) => {
                this.alert(err["error"]["errors"][0]["message"]);
            });
    }

    forgotPassword() {
        prompt({
            title: "Forgot Password",
            message: "Enter the email address you used to register for APP NAME to reset your password.",
            inputType: "email",
            defaultText: "",
            okButtonText: "Ok",
            cancelButtonText: "Cancel"
        }).then((data) => {
            if (data.result) {
                this.authenticationService.resetPassword(data.text.trim())
                    .then(() => {
                        this.alert("Your password was successfully reset. Please check your email for instructions on choosing a new password.");
                    }).catch(() => {
                        this.alert("Unfortunately, an error occurred resetting your password.");
                    });
            }
        });
    }

    focusPassword() {
        this.password.nativeElement.focus();
    }
    focusConfirmPassword() {
        if (!this.isLoggingIn) {
            this.confirmPassword.nativeElement.focus();
        }
    }

    alert(message: string) {
        return alert({
            title: "APP NAME",
            okButtonText: "OK",
            message: message
        });
    }
}
