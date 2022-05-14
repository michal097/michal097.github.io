import {Component, OnInit} from '@angular/core';
import {SidenavService} from '../sidenav/sidenav.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  constructor(
    private sidenavService: SidenavService,
    private router: Router) {
  }

  clickHeader(): void {
    this.router.navigate(['']);
  }

  ngOnInit() {
  }

  toggleSidenav() {
    this.sidenavService.toggle();
  }

  hideSideNav(): void {
    this.sidenavService.close();
  }

}


