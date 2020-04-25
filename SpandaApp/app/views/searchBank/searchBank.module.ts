import { NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { NativeScriptCommonModule } from "nativescript-angular/common";
import { NativeScriptFormsModule } from "nativescript-angular/forms";

import { SearchBankRoutingModule } from "./searchBank.routing";
import { SearchBankComponent } from "./searchBank.component";

import { TranslateModule } from '../../@ngx-translate/core@10.0.2';

@NgModule({
    imports: [
        NativeScriptCommonModule,
        SearchBankRoutingModule,
        NativeScriptFormsModule,

        TranslateModule.forChild()
    ],
    declarations: [
        SearchBankComponent
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class SearchBankModule { }