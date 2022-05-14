import {Component, OnInit} from '@angular/core';
import {CrudService} from '../service/crud.service';
import {ActivatedRoute, Route, Router, RouterLink} from '@angular/router';

@Component({
  selector: 'app-mail-verification',
  templateUrl: './mail-verification.component.html',
  styleUrls: ['./mail-verification.component.scss']
})
export class MailVerificationComponent implements OnInit {
  public isSuccess: boolean;
  public info = 'Your account has been verified correctly';

  constructor(private service: CrudService, private router: Router, private activetedRoute: ActivatedRoute) {
  }

  ngOnInit() {

    this.activetedRoute.queryParams.subscribe(param => {
      const token = param['token'];
      this.service.veryfiMail(token).subscribe(() => {
          this.isSuccess = true;
        },
        (response) => {
          this.isSuccess = false;
          this.info = response.error.message;
        });
    });
  }
}
