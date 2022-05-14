import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {HttpClient} from '@angular/common/http';
import {User} from '../login/login.component';
import {UserData} from '../userdata/userdata.component';
import {FilterProperties} from '../trading-decisions/FilterProperties';

@Injectable({
  providedIn: 'root'
})
export class CrudService {

  URL = 'http://localhost:9090/';

  constructor(private http: HttpClient) {
  }

  register(user: User): Observable<any> {
    return this.http.post(this.URL + `createAndSaveUser`, user);
  }

  auth(): Observable<any> {
    return this.http.get(this.URL + `getActualUser`, {responseType: 'text'});
  }

  getUserInstance(user: string | null): Observable<any> {
    return this.http.get(this.URL + `getUserBotInstance/${user}`);
  }

  updateUser(botInstanceId: string, user: UserData): Observable<any> {
    return this.http.put(this.URL + `updateUserBotInstance/${botInstanceId}`, user);
  }

  startTrader(botId: string): Observable<any> {
    return this.http.post(this.URL + `startTrader/${botId}`, null);
  }

  stopTrader(botId: string): Observable<any> {
    return this.http.post(this.URL + `stopTrader/${botId}`, null);
  }

  getTradingDecisions(username: string | null, page: number, size: number, filters: FilterProperties): Observable<any> {
    return this.http.post(this.URL + `getTradingDecisions/${username}/${page}/${size}`, filters);
  }

  getUserStatistics(userId: string): Observable<any> {
    return this.http.get(this.URL + `getUserStats/${userId}`);
  }

  veryfiMail(mailToken: string): Observable<any> {
    return this.http.post(this.URL + `verify/${mailToken}`, {});
  }

  getCryptoSummary(botId: string): Observable<any> {
    return this.http.get(this.URL + `userCryptoQuantity/${botId}`);
  }

  getUserCryptos(botId: string): Observable<any> {
    return this.http.get(this.URL + `getUserCryptos/${botId}`);
  }

  getUserDailyStats(botId: string): Observable<any> {
    return this.http.get(this.URL + `getUserDailyStats/${botId}`);
  }

  getChartData(botId: string): Observable<any> {
    return this.http.get(this.URL + `getChartData/${botId}`);
  }

  alreadySellCryptoStats(botId: string): Observable<any> {
    return this.http.get(this.URL + `alreadySellCryptoStats/${botId}`);
  }

}
