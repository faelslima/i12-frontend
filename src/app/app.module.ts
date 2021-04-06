import {APP_INITIALIZER, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http';
import {ClipboardModule} from 'ngx-clipboard';
import {TranslateModule} from '@ngx-translate/core';
import {InlineSVGModule} from 'ng-inline-svg';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
// Highlight JS
import {HIGHLIGHT_OPTIONS, HighlightModule} from 'ngx-highlightjs';
import {SplashScreenModule} from './_metronic/partials/layout/splash-screen/splash-screen.module';
import {AuthService} from './modules/auth';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { GenericDeleteComponent } from './shared/components/generic-delete/generic-delete.component';

function appInitializer(authService: AuthService) {
    return () => {
        return new Promise((resolve) => {
            authService.getUserByToken().subscribe().add(resolve);
        });
    };
}

@NgModule({
    declarations: [AppComponent, GenericDeleteComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        SplashScreenModule,
        TranslateModule.forRoot(),
        HttpClientModule,
        HighlightModule,
        ClipboardModule,
        AppRoutingModule,
        InlineSVGModule.forRoot(),
        NgbModule,
        SweetAlert2Module.forRoot()
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: appInitializer,
            multi: true,
            deps: [AuthService],
        },
        {
            provide: HIGHLIGHT_OPTIONS,
            useValue: {
                coreLibraryLoader: () => import('highlight.js/lib/core'),
                languages: {
                    xml: () => import('highlight.js/lib/languages/xml'),
                    typescript: () => import('highlight.js/lib/languages/typescript'),
                    scss: () => import('highlight.js/lib/languages/scss'),
                    json: () => import('highlight.js/lib/languages/json')
                },
            },
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
}
