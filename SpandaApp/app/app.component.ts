import { Injectable, Inject, Component } from "@angular/core";
import { DrawerTransitionBase, RadSideDrawer, SlideInOnTopTransition } from "nativescript-ui-sidedrawer";
import { AUTH_SERVICE_IMPL, IAuthentication } from "./services/authentication.service";
import { RouterExtensions } from "nativescript-angular/router";
import * as app from "application";

import { TranslateService, LangChangeEvent } from './@ngx-translate/core@10.0.2';

import enLang from './locale/en'
import idLang from './locale/id'

@Component({
  moduleId: module.id,
  selector: "my-app",
  templateUrl: "app.component.html"
})
export class AppComponent {
  private _sideDrawerTransition: DrawerTransitionBase;

  public currentLanguage = 'id';

    constructor(
        private translate: TranslateService,
        private routerExtensions: RouterExtensions,
        @Inject(AUTH_SERVICE_IMPL) private authenticationService: IAuthentication) {
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

    ngOnInit(): void {
      this._sideDrawerTransition = new SlideInOnTopTransition();
    }

    get sideDrawerTransition(): DrawerTransitionBase {
      return this._sideDrawerTransition;
    }

    changeLanguage(locale: string): void {
      this.translate.use(locale);
    }

    onLogOut() {
      this.authenticationService.removeAllUserAuthentication();
      this.routerExtensions.navigate(["login"], { clearHistory: true });
      const sideDrawer = <RadSideDrawer>app.getRootView();
      sideDrawer.closeDrawer();
  }
}
