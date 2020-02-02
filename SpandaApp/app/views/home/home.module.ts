import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { HomeRoutingModule } from "./home.routing";
import { HomeComponent } from "./home.component";

import { BottomNavigationComponent } from "../../shared/components/bottom-navigation.component";

import { TranslateModule } from '../../@ngx-translate/core@10.0.2';

@NgModule({
    imports: [
        NativeScriptCommonModule,
        HomeRoutingModule,
        NativeScriptFormsModule,

        TranslateModule.forChild()
    ],
    declarations: [
        HomeComponent,

        BottomNavigationComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class HomeModule { }