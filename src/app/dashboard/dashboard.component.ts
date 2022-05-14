import {Component, OnInit, ViewChild} from '@angular/core';
import {CrudService} from '../service/crud.service';
import {UserData} from '../userdata/userdata.component';
import {Router} from '@angular/router';
import {RxStompService} from '@stomp/ng2-stompjs';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {chartData} from '../datasource';
import {BarData} from '../chart/providers/mock.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private service: CrudService,
              private router: Router,
              private rxStompService: RxStompService) {
  }

  public stockchartData: Object[];
  public title: string;
  public crosshair: {};
  userHavingKeys: boolean;
  traderStart: boolean;
  actualUser: UserData;
  loader = false;
  startWebSocket: boolean;
  private destroy$ = new Subject();
  statistics: CryptoRealPrice[] = [];
  test: string;
  stonks: boolean;
  currentCryptosAsString: string;
  low = '0';
  high = '0';
  userDailyStats: UserDailyStats[] = [];
  cryptoBars: Map<string, BarData> = new Map<string, BarData>();

  ngOnInit() {


    this.loader = false;
    const user: string | null = sessionStorage.getItem('username');
    this.service.getUserInstance(user).subscribe((data: UserData) => {
      this.actualUser = data;
      if (data.pkey !== null && data.skey !== null) {

        if (!sessionStorage.getItem('botId')) {
          const userId: string = data.botInstanceId;
          sessionStorage.setItem('botId', userId);
        }
        this.userHavingKeys = true;
        this.traderStart = data.traderStart;
        if (this.traderStart) {
          this.service.getUserDailyStats(data.botInstanceId).subscribe(dailyStats => {
            this.userDailyStats = dailyStats;
            this.low = dailyStats?.map(userDailyStat => userDailyStat.minGain)?.reduce((a, b) => a + b).toFixed(2);
            this.high = dailyStats?.map(userDailyStat => userDailyStat.maxGain)?.reduce((a, b) => a + b).toFixed(2);

          });
          this.service.getUserCryptos(data.botInstanceId).subscribe(userCryptos => {
            userCryptos.forEach(userCrypto => {
              this.statistics.push({
                currentCrypto: userCrypto.cryptoName,
                price: userCrypto.price,
                percentage: userCrypto.percentage
              } as CryptoRealPrice);

            });
            this.currentCryptosAsString = userCryptos.map(userCrypto => userCrypto.cryptoName).join(', ');
            userCryptos.forEach(u => this.createCryptoBars(u.cryptoName, u.price, u.quantity));
            this.service.alreadySellCryptoStats(data.botInstanceId).subscribe(sellStats => {
              sellStats.forEach(s => {
                console.log('misterius s', s);
                this.createSellCryptoBars(s.cryptoName, s.close);
              });
            });
            console.log('this.cryptoBars', this.cryptoBars);
            this.retrieveWebsocketData();
            this.getTradingStats();
          });

        } else {
          this.startWebSocket = true;
        }
      } else {
        this.startWebSocket = true;
      }
    });
  }

  getTradingStats(): void {
    //this.service.getUserStatistics(this.actualUser.botInstanceId).subscribe(d => this.stockchartData = d);
  }


  goToBotConfiguration(): void {
    this.router.navigate(['my-data']);
  }

  toggleStartStopTrader(): void {
    this.loader = false;
    this.traderStart = !this.traderStart;
  }

  startTraderWS(): void {
    this.loader = true;
    this.service.startTrader(this.actualUser.botInstanceId).subscribe(() => this.toggleStartStopTrader());
    console.log(this.actualUser.botInstanceId);
    this.retrieveWebsocketData();
  }

  stopTraderWS(): void {
    this.loader = true;
    console.log('stop');
    this.service.stopTrader(this.actualUser.botInstanceId).subscribe(() => this.toggleStartStopTrader());
  }

  retrieveWebsocketData(): any {

    this.rxStompService.watch('/topic/statistics/' + this.actualUser.botInstanceId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((mess: any) => {
          const message: CryptoStatisticsDto = JSON.parse(mess.body);
          this.startWebSocket = true;
          const collectStats: CollectStatsDto = message.userStatistics;
          const cryptoRealPrice: CryptoRealPrice = collectStats.userStatistics;
          const foundStat = this.statistics?.find(statistic => statistic.currentCrypto === cryptoRealPrice.currentCrypto);
          foundStat.prevPrice = foundStat.price;
          foundStat.price = cryptoRealPrice.price;
          foundStat.percentage = cryptoRealPrice.percentage;
          const userDailyStats: UserDailyStats = collectStats.userDailyStats;

          const foundDailyStat = this.userDailyStats?.find(daily => daily.cryptoName === userDailyStats?.cryptoName);
          if (!foundDailyStat) {
            this.userDailyStats.push(userDailyStats);
          }

          this.userDailyStats.forEach(daily => {
            if (daily.cryptoName === userDailyStats.cryptoName) {
              daily.maxGain = userDailyStats.maxGain;
              daily.minGain = userDailyStats.minGain;

            }
          });

          this.low = this.userDailyStats?.map(userDailyStat => userDailyStat.minGain)?.reduce((a, b) => a + b).toFixed(2);
          this.high = this.userDailyStats?.map(userDailyStat => userDailyStat.maxGain)?.reduce((a, b) => a + b).toFixed(2);

        },
        (err) => {
        });
  }

  getDailyStats(stats: any): void {
    // this.stockchartData = [];
    // const dateIndex = this.stockchartData.findIndex(((statistics: UserStatistics) =>
    //   new Date(statistics.date).toDateString() === new Date().toDateString()));
    // if (dateIndex !== -1) {
    //   this.stockchartData.length = this.stockchartData.length - 1;
    //   this.stockchartData.push(stats);
    // } else {
    //   this.stockchartData.push(stats);
    // }
  }

  checkStonks(currentCryptoStat: CryptoRealPrice): boolean {
    const actualPrice = currentCryptoStat.price;
    const prevPrice = currentCryptoStat.prevPrice;
    if (!prevPrice) {
      return null;
    }
    if (parseFloat(actualPrice) > Number.parseFloat(prevPrice)) {
      return true;
    }
    if (parseFloat(actualPrice) === Number.parseFloat(prevPrice)) {
      return null;
    }
    return false;
  }

  createCryptoBars(cryptoName: string, price: string, quantity: number): void {
    const priceNumber = Number.parseFloat(price);
    const realPrice = priceNumber * quantity;
    const barData: BarData = {
      time: new Date().getTime(),
      volume: null,
      open: realPrice,
      close: realPrice,
      low: realPrice,
      high: realPrice
    };

    this.cryptoBars.set(cryptoName, barData);

  }

  createSellCryptoBars(cryptoName: string, price: number): void {
    const barData: BarData = {
      time: new Date().getTime(),
      volume: null,
      open: price,
      close: price,
      low: price,
      high: price
    };
    this.cryptoBars.set(cryptoName, barData);
    console.log('sell bar data', barData);

  }
}


export interface CryptoRealPrice {
  quantity: number;
  currentCrypto: string;
  price: string;
  prevPrice: string;
  percentage: number;
  high: number;
  open: number;
  close: number;
  low: number;
}

export interface CryptoStatisticsDto {
  userStatistics: CollectStatsDto;
  high: number;
  low: number;
  open: number;
  close: number;
}

export interface UserDailyStats {
  cryptoName: string;
  minGain: number;
  maxGain: number;
}

export interface CollectStatsDto {
  userDailyStats: UserDailyStats;
  userStatistics: CryptoRealPrice;
}

