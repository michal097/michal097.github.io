import {Component, OnInit} from '@angular/core';
import {CrudService} from '../service/crud.service';
import {STEPPER_GLOBAL_OPTIONS} from '@angular/cdk/stepper';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {invalid} from '@angular/compiler/src/render3/view/util';

export class UserData {
  botInstanceId: string;
  pkey: string;
  skey: string;
  email: string;
  allowPercentageLoss: number;
  percentageLossInWatch: number;
  traderStart: boolean;
  toDiversificationCount: number;
  tradePair: string;

  constructor(botInstanceId: string,
              pkey: string,
              skey: string,
              email: string,
              allowPercentageLoss: number,
              percentageLossInWatch: number,
              traderStart: boolean) {
  }
}

@Component({
  selector: 'app-userdata',
  templateUrl: './userdata.component.html',
  styleUrls: ['./userdata.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: {showError: true},
    },
  ],
})


export class UserdataComponent implements OnInit {


  constructor(private service: CrudService, private _formBuilder: FormBuilder) {
  }

  userData: UserData;
  isUserHavingKeys: boolean = undefined;
  toggleSpinner = false;
  err: string;
  tradePair = 'USDT';

  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  thirdFormGroup: FormGroup;

  ngOnInit() {
    this.userData = new UserData('', '', '', '', 0, 0, false);
    this.getIsUserHavingKeys();
    this.firstFormGroup = this._formBuilder.group({
      firstCtrl: ['', Validators.required],
    });
    this.secondFormGroup = this._formBuilder.group({
      secondCtrl: ['', Validators.required],
    });
    this.thirdFormGroup = this._formBuilder.group({
      thirdCtrl: ['', Validators.required],
    });
  }

  hasAnyErrors(): boolean {
    console.log(this.firstFormGroup?.invalid || this.secondFormGroup?.invalid || this.thirdFormGroup?.invalid);
    return this.firstFormGroup?.invalid || this.secondFormGroup?.invalid || this.thirdFormGroup?.invalid;
  }

  getIsUserHavingKeys(): boolean {
    const user: string | null = sessionStorage.getItem('username');
    this.service.getUserInstance(user).subscribe((data: UserData) => {
      this.userData = data;
      this.isUserHavingKeys = data.pkey !== null && data.skey !== null;
    });
    return this.isUserHavingKeys;
  }

  toggleSpinnerFun(): void {
    this.toggleSpinner = !this.toggleSpinner && this.err === '';
  }

  changeSaveEdit(): void {
    this.isUserHavingKeys = !this.isUserHavingKeys;
  }

  updateUserData(botInstanceId: string, user: UserData): void {
    this.err = '';
    if (this.userData.allowPercentageLoss < 1 || this.userData.percentageLossInWatch < 1) {
      this.err = 'Allow percentage loss should be 1 or bigger';
      this.toggleSpinnerFun();
    } else if (this.hasAnyErrors()) {
      this.err = 'Fill all required data!';
    } else {
      user.tradePair = this.tradePair;
      this.service.updateUser(botInstanceId, user).subscribe(() => {
          this.toggleSpinnerFun();
          this.changeSaveEdit();
        },
        (resp) => {
          this.toggleSpinnerFun();
          this.err = resp.error;
        });
    }
  }


}

export interface TradePair {
  tradePair: string;
}
