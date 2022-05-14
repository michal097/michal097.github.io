import './polyfills';

import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatNativeDateModule} from '@angular/material/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DemoMaterialModule} from './app/material-module';

import {AppComponent} from './app/app.component';
import {SidenavComponent} from './app/sidenav/sidenav.component';
import {SidenavService} from './app/sidenav/sidenav.service';
import {ToolbarComponent} from './app/toolbar/toolbar.component';
import {RouterModule} from '@angular/router';
import {AppRoutingModule} from './app/app-routing/app-routing.module';
import {LoginComponent} from './app/login/login.component';
import {APP_BASE_HREF} from '@angular/common';
import {DashboardComponent} from './app/dashboard/dashboard.component';
import {AuthGuardService} from './app/service/auth-guard.service';
import {UserdataComponent} from './app/userdata/userdata.component';
import {FooterComponent} from './app/footer/footer.component';
import {BasicAuthHtppInterceptorService} from './app/service/basic-auth-interceptor.service';
import {InjectableRxStompConfig, RxStompService, rxStompServiceFactory} from '@stomp/ng2-stompjs';
import {myRxStompConfig} from './rx-stomp.config';
import {TradingDecisionsComponent} from './app/trading-decisions/trading-decisions.component';
// import {MatListModule, MatSelectModule} from '@angular/material/autocomplete';
import {MailVerificationComponent} from './app/mail-verification/mail-verification.component';
import {MatSelectModule} from '@angular/material/select';
import {MatListModule} from '@angular/material/list';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {TvComponent} from './app/chart/tv/tv.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    DemoMaterialModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    RouterModule,
    AppRoutingModule,
    MatSelectModule,
    MatListModule,
    MatTableModule,
    MatSortModule,
  ],
    declarations: [AppComponent,
        SidenavComponent,
        ToolbarComponent,
        LoginComponent,
        DashboardComponent,
        UserdataComponent,
        FooterComponent,
        TradingDecisionsComponent,
        MailVerificationComponent,
        TvComponent],
    bootstrap: [AppComponent],
    providers: [SidenavService, AuthGuardService, { provide: APP_BASE_HREF, useValue: '/' }, {
            provide: HTTP_INTERCEPTORS,
            useClass: BasicAuthHtppInterceptorService,
            multi: true
        }, {
            provide: InjectableRxStompConfig,
            useValue: myRxStompConfig
        },
        {
            provide: RxStompService,
            useFactory: rxStompServiceFactory,
            deps: [InjectableRxStompConfig]
        },
       ]
})
export class AppModule {
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

