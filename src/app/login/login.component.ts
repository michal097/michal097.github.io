import {Component, OnInit, Input} from '@angular/core';
import {Router} from '@angular/router';
import {AuthenticationService} from '../service/authentication.service';
import {CrudService} from '../service/crud.service';

export class User {
  constructor(public username: string,
              public password: string,
              public email: string,
              public roles: Role[]) {
  }
}

export class Role {
  constructor(public description: string,
              public role: string) {
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  username = '';
  password = '';
  passwordRepeat = '';
  invalidLogin = false;
  invalidPass = '';
  userGeneratedMessage = '';
  err = '';
  error = '';
  user: User;
  roles: Role[];
  showRegister = true;

  constructor(private router: Router,
              private loginservice: AuthenticationService,
              private service: CrudService) {
  }

  doc = document.getElementById('toolbar');

  ngOnInit() {

    this.user = new User('', '', '', this.roles);
    if (this.loginservice.isUserLoggedIn()) {
      this.router.navigate(['/']);
    } else {
      if (this.doc) {
        this.doc.style.visibility = 'hidden';
      }
    }
  }


  register(pass: string): boolean {

    if (pass !== this.passwordRepeat) {
      this.invalidPass = 'You entered different passwords';
      return false;
    } else {
      this.invalidPass = '';
      return true;
    }
  }

  saveUser(): void {
    this.invalidPass = '';
    this.err = '';
    this.userGeneratedMessage = '';
    if (this.register(this.user.password)) {
      this.service.register(this.user).subscribe(
        () => this.success(),
        err => this.errors(err)
      );
    }
  }

  success() {
    this.invalidPass = '';
    this.userGeneratedMessage = 'User has been generated!';
    this.err = '';
  }

  errors(err: any) {
    if (this.user.username === undefined || this.user.username === ''
      || this.user.password === '' || this.user.password === undefined ||
      this.user.username === null || this.user.password === null) {
      this.err = 'Username and password cannot be empty';
    } else if (!this.validateEmail(this.user.email)) {
      this.err = 'Invalid email passed';
    } else {
      this.err = err.error.message;
    }
    this.userGeneratedMessage = '';
  }

  validateEmail(email: string): boolean {
    // tslint:disable-next-line:max-line-length
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  checkLogin() {
    this.loginservice.authenticate(this.username, this.password).subscribe(
      () => {
        if (sessionStorage.getItem('botId')) {
          sessionStorage.removeItem('botId');
        }
        this.router.navigate(['']);
        this.loginservice.refreshAuth();
        this.invalidLogin = false;
        if (this.doc) {
          this.doc.style.visibility = 'visible';
        }
      },
      (resp) => {
        if (resp.error && resp.status === 403) {
          this.error = resp.error.message;
          return;
        }
        this.invalidLogin = true;
        if (this.username === undefined || this.username === ''
          || this.password === '' || this.password === undefined) {
          this.error = 'Username and password cannot be empty';
        } else {
          this.error = 'Invalid username or password';
        }
      }
    );
  }

  toogleRegister(): void {
    this.showRegister = false;
  }
}
