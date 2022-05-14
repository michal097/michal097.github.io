import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from '../login/login.component';
import {DashboardComponent} from '../dashboard/dashboard.component';
import {AuthGuardService} from '../service/auth-guard.service';
import {UserdataComponent} from '../userdata/userdata.component';
import {TradingDecisionsComponent} from '../trading-decisions/trading-decisions.component';
import {MailVerificationComponent} from '../mail-verification/mail-verification.component';
import {SummaryComponent} from '../summary/summary.component';


const routes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'verify', component: MailVerificationComponent},
  {path: 'verify/:token', component: MailVerificationComponent},
  {path: '', component: DashboardComponent, canActivate: [AuthGuardService]},
  {path: 'my-data', component: UserdataComponent, canActivate: [AuthGuardService]},
  {path: 'trading-decisions', component: TradingDecisionsComponent, canActivate: [AuthGuardService]},
  {path: 'my-crypto', component: SummaryComponent, canActivate: [AuthGuardService]}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuardService]
})
export class AppRoutingModule {

}
