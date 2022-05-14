import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {CrudService} from '../service/crud.service';
import {PageEvent} from '@angular/material/paginator';
import {MatTableDataSource} from '@angular/material/table';
import {DatePipe} from '@angular/common';
import {MatSort, Sort} from '@angular/material/sort';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {FilterProperties} from './FilterProperties';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-trading-decisions',
  templateUrl: './trading-decisions.component.html',
  styleUrls: ['./trading-decisions.component.scss']
})
export class TradingDecisionsComponent implements OnInit, AfterViewInit {

  constructor(private service: CrudService, private _liveAnnouncer: LiveAnnouncer) {

  }

  @ViewChild(MatSort) sort: MatSort;

  tradingDecisions: TradingDecision[];
  tradingDecisionsSize: number;
  pageSize = 10;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  botId = sessionStorage.getItem('botId');
  displayedColumns: string[] = ['type', 'crypto', 'price', 'timestamp', 'realGain'];
  loader = true;
  dataSource;
  tradeType = null;
  cryptoName = '';
  filters: FilterProperties = null;
  range = new FormGroup({
    dateFrom: new FormControl(),
    dateTo: new FormControl(),
  });

  ngOnInit() {
    if (this.botId != null) {
      this.getTradingDecisions();
    }
  }

  getTradingDecisions(): void {
     if (this.cryptoName || this.tradeType || this.range.value.dateFrom || this.range.value.dateTo) {
      this.filters = {
        cryptoName: this.cryptoName, tradeType: this.tradeType, dateFrom: this.range.value.dateFrom,
        dateTo: this.range.value.dateTo
      };
     } else {
       this.filters = null;
     }
    this.service.getTradingDecisions(this.botId, 0, this.pageSize, this.filters).subscribe(data => {

      this.dataSource = new MatTableDataSource<TradingDecision>(data.tradingDecisions);
      this.tradingDecisionsSize = data.decisionsListSize;
      this.loader = false;
      setTimeout(() => {
        this.dataSource.sort = this.sort;
      });
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSource.sort = this.sort;
    }, 1000);
  }

  announceSortChange(sortState: Sort) {
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }

  getDecisions(e: PageEvent): any {
    this.service.getTradingDecisions(this.botId, e.pageIndex, e.pageSize, this.filters).subscribe(data =>
      this.dataSource = new MatTableDataSource<TradingDecision>(data.tradingDecisions));
    setTimeout(() => {
      this.dataSource.sort = this.sort;
    }, 1000);
  }


  translateRealGain(percentageGain: number): string {
    if (!percentageGain) {
      return '-';
    }
    return `${percentageGain} %`;
  }

  chooseStateIcon(percentageGain: number): string {
    return percentageGain > 0 ? 'up.png' : 'down.png';
  }

  formatDate(timestamp: Date): string {
    const datepipe: DatePipe = new DatePipe('en-US');
    return datepipe.transform(timestamp, 'dd-MM-YYYY HH:mm:ss');

  }
}

export interface TradingDecision {
  type: string;
  crypto: string;
  price: string;
  timestamp: Date;
  realGain: number;
}

export interface TradingDecisionDto {
  tradingDecisions: TradingDecision[];
  decisionsListSize: number;
}
