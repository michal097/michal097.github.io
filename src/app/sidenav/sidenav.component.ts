import {Component, OnInit, ViewChild} from '@angular/core';
import {SidenavService} from './sidenav.service';
import {AuthenticationService} from '../service/authentication.service';
import {Router} from '@angular/router';
import {MatSidenav} from '@angular/material/sidenav';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit {

  @ViewChild('sidenav', {static: true}) public sidenav: MatSidenav;

  constructor(private sidenavService: SidenavService,
              private authService: AuthenticationService,
              private router: Router) {
  }

  ngOnInit() {
    this.sidenavService.setSidenav(this.sidenav);
  }

  public logMeOut() {
    this.authService.logOut();
    this.closeSideNav();
  }

  public closeSideNav(): void {
    this.sidenavService.close();
  }

}
