import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CrudService} from '../service/crud.service';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, Sort} from '@angular/material/sort';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-summary',
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss']
})
export class SummaryComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['cryptoName', 'quantity', 'money'];
  dataSource = new MatTableDataSource([]);
  loader = true;

  constructor(private service: CrudService, private _liveAnnouncer: LiveAnnouncer) {
  }

  botId: string;
  userCryptoData: UserCryptoData[];
  allMoney: number;
  hasAnyCrypto: boolean;

  private static round(value, precision): number {
    const multiplier = Math.pow(10, precision || 0);
    return Math.round(value * multiplier) / multiplier;
  }

  ngOnInit(): void {
    this.botId = sessionStorage.getItem('botId');
    this.service.getCryptoSummary(this.botId)
      .pipe(map((data: UserCryptoData []) => {
        this.userCryptoData = data;
        this.hasAnyCrypto = data.length > 0;
        const sumMoney = data.map(d => d.money)
          .reduce((sum, current) => sum + current, 0);
        this.allMoney = SummaryComponent.round(sumMoney, 2);
        this.dataSource = new MatTableDataSource<UserCryptoData>(data);
        setTimeout(() => {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        });
        this.loader = false;
      }))
      .subscribe();

  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

}


export interface UserCryptoData {
  cryptoName: string;
  quantity: number;
  money: number;
}
