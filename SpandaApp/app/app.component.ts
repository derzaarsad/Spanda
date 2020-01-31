import { Component } from "@angular/core";

import { TranslateService, LangChangeEvent } from './@ngx-translate/core@10.0.2';

import enLang from './locale/en'
import idLang from './locale/id'

@Component({
  moduleId: module.id,
  selector: "my-app",
  templateUrl: "app.component.html"
})
export class AppComponent {
  public currentLanguage = 'id';

    constructor(
        private translate: TranslateService) {
        // Add translations
        translate.setTranslation('en', enLang);
        translate.setTranslation('id', idLang);

        // this language will be used as a fallback when a translation isn't found in the current language
        translate.setDefaultLang('id');

        // the lang to use, if the lang isn't available, it will use the current loader to get them
        translate.use('id');

        // 
        translate.onLangChange.subscribe((event: LangChangeEvent) => {
            this.currentLanguage = event.lang;
        });
    }
}
