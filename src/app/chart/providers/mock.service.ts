import {Injectable, OnInit} from '@angular/core';
import {Observable, Observer, interval, Subscription} from 'rxjs';
import {map, takeUntil, timestamp} from 'rxjs/operators';
// import { BTC_PRICE_LIST } from '../mock/btc-181123_2006-181124_0105';
import {CrudService} from '../../service/crud.service';
import {CollectStatsDto, CryptoRealPrice, CryptoStatisticsDto, UserDailyStats} from '../../dashboard/dashboard.component';
import {RxStompService} from '@stomp/ng2-stompjs';

export interface BarData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

@Injectable({
  providedIn: 'root'
})
export class MockService {
  dataTemplate: BarData = {'time': 1545572340000, 'open': 3917, 'high': 3917, 'low': 3912.03, 'close': 3912.62, 'volume': 3896};
  dataIndex = 0;
  dataLength = 0;
  BTC_PRICE_LIST = [];
  lastBarTimestamp: number;
  lastIndex = 0;
  generated = false;
  lastGranulity = 0;

  dataGenerator(time = +new Date()): BarData {
    const obj: any = {};

    Object.assign(obj, this.BTC_PRICE_LIST[this.dataIndex], {time});
    ++this.dataIndex >= this.dataLength && (this.dataIndex = 0);
    return obj;
  }

  generateHistoryData(): BarData[] {
    return this.BTC_PRICE_LIST;
  }

  constructor(private service: CrudService, private rxStompService: RxStompService) {
    this.service.getChartData(sessionStorage.getItem('botId')).subscribe(data => {
      this.dataLength = data.length;
      console.log('chart data', data);
      this.BTC_PRICE_LIST = data;
    });
  }


  getHistoryList(param, init: boolean): Observable<BarData[]> {
    let list = [];

    if (this.lastGranulity === 0) {
      this.lastGranulity = param.granularity;
    }

    console.log('get history');


    if (init || !this.generated || this.lastGranulity !== param.granularity) {
      this.lastGranulity = param.granularity;
      list = this.generateHistoryData();
      console.log(list);
      this.lastBarTimestamp = list[list.length - 1].time;
      this.generated = true;
    }
    return new Observable((ob: Observer<any>) => {
      ob.next(list);
      ob.complete();
    });
  }

  fakeWebSocket() {
    let granularity: number;
    let subscription: Subscription;

    const ws: any = {
      send(message: string) {
        const matched = message.match(/.+_kline_(\d+)/);

        // if matched, then send data base on granularity, else unsubscribe.
        if (matched) {
          granularity = +matched[1] * 1e3;
          sendData();
        } else {
          subscription.unsubscribe();
        }
      },
      close() {
      }
    };

    const sendData = () => {
      subscription = this.rxStompService.watch('/topic/statistics/' + sessionStorage.getItem('botId'))
        .pipe(map((a) => {
          const currentTimestamp = +new Date();

          if (currentTimestamp - this.lastBarTimestamp >= granularity) {
            this.lastBarTimestamp += granularity;
          }
          const message: CryptoStatisticsDto = JSON.parse(a.body);
          const collectStats: CollectStatsDto = message.userStatistics;
          const o: CryptoRealPrice = collectStats.userStatistics;
          const cryptoBarMap = new Map<string, BarData>();
          const bar: BarData = {
            time: this.lastBarTimestamp,
            volume: null,
            high: o.high,
            low: o.low,
            open: o.open,
            close: o.close
          };
          return cryptoBarMap.set(o.currentCrypto, bar);
        }))
        .subscribe(x => {
          ws.onmessage && ws.onmessage(x);
        });
    };

    setTimeout(() => {
      ws.onopen();
    }, 1e3);

    return ws;
  }
}
