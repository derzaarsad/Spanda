import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { LoginRoutingModule } from "./login.routing";
import { LoginComponent } from "./login.component";

import { TranslateModule } from '../../@ngx-translate/core@10.0.2';

@NgModule({
    imports: [
        NativeScriptCommonModule,
        LoginRoutingModule,
        NativeScriptFormsModule,

        TranslateModule.forChild()
    ],
    declarations: [
        LoginComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class LoginModule { }