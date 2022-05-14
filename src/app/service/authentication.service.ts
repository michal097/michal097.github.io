import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from 'rxjs/operators';
import {CrudService} from './crud.service';
import {Router} from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  constructor(private httpClient: HttpClient,
              private service: CrudService,
              private router: Router) {
  }

  isUser: string;

  authenticate(username: string, password: string) {
    return this.httpClient
      .post<any>(this.service.URL + 'authenticate', {username, password})
      .pipe(
        map(userData => {
          sessionStorage.setItem('username', username);
          this.service.auth().subscribe(data => {
            this.isUser = data;
            sessionStorage.setItem('auth', data);
          });
          const tokenStr = 'Bearer ' + userData.token;
          sessionStorage.setItem('token', tokenStr);
          return userData;
        })
      );
  }

  refreshAuth(): void {
    this.service.auth().subscribe(data => {
      sessionStorage.setItem('auth', data);
    });

  }

  isUserLoggedIn() {
    const user = sessionStorage.getItem('username');
    return !(user === null);

  }

  logOut() {
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('auth');
    sessionStorage.removeItem('botId');
    this.router.navigate(['/login']);
  }
}
