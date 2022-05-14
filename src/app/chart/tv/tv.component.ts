import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {BarData, MockService} from '../providers/mock.service';
import {timer} from 'rxjs';
import {tap} from 'rxjs/operators';

@Component({
  selector: 'app-tv',
  templateUrl: './tv.component.html',
  styleUrls: ['./tv.component.scss']
})
export class TvComponent implements OnInit, OnDestroy {
  @Input() symbol;
  @Input() bars;
  tradingview;
  init = false;

  ws;
  wsMessage = 'you may need to send specific message to subscribe data, eg: BTC';

  granularityMap = {
    '1': 60,
    '3': 180,
    '5': 300,
    '30': 30 * 60,
    '60': 60 * 60,
    '120': 60 * 60 * 2,
    '240': 60 * 60 * 4,
    '360': 60 * 60 * 6,
    'D': 86400
  };

  constructor(private mockService: MockService) {
  }

  ngOnInit() {
    this.ws = this.mockService.fakeWebSocket();
    console.log('on init');
    this.init = true;
    this.drawTv();
    this.ws.onopen = () => {
      console.log('connect success');
      // this.drawTv();
    };
  }

  ngOnDestroy() {
    this.ws.close();
  }

  drawTv() {
    const that = this;

    this.tradingview = new (window as any).TradingView.widget({
      // debug: true, // uncomment this line to see Library errors and warnings in the console
      fullscreen: true,
      symbol: that.symbol,
      interval: '5',
      container_id: 'tradingview',
      library_path: 'assets/vendors/charting_library/',
      locale: 'en',
      theme: 'dark',
      disabled_features: [
        // 'timeframes_toolbar',
        // 'go_to_date',
        // 'use_localstorage_for_settings',
        // 'volume_force_overlay',
        // 'show_interval_dialog_on_key_press',
        'symbol_search_hot_key',
        'study_dialog_search_control',
        'display_market_status',
        /*'header_compare',
        'header_symbol_search',
        'header_fullscreen_button',
        'header_settings',
        'header_chart_type',
        'header_resolutions',*/
        'control_bar',
        'edit_buttons_in_legend',
        'border_around_the_chart',
        'main_series_scale_menu',
        'star_some_intervals_by_default',
        'datasource_copypaste',
        'header_indicators',
        // 'context_menus',
        // 'compare_symbol',
        'header_undo_redo',
        'border_around_the_chart',
        'timezone_menu',
        'remove_library_container_border',
      ],
      allow_symbol_change: true,
      // enabled_features: ['study_templates'],
      // charts_storage_url: 'http://saveload.tradingview.com',
      charts_storage_api_version: '1.1',
      client_id: 'tradingview.com',
      user_id: 'public_user_id',
      timezone: 'Europe/Berlin',
      volumePaneSize: 'tiny',
      datafeed: {
        onReady(x) {
          timer(0)
            .pipe(
              tap(() => {
                x({
                  supported_resolutions: ['1', '3', '5', '30', '60', '120', '240', '360', 'D']
                });
              })
            ).subscribe();
        },
        getBars(symbol, granularity, startTime, endTime, onResult, onError, isFirst) {

          that.mockService.getHistoryList({
            granularity: that.granularityMap[granularity],
            startTime,
            endTime
          }, that.init).subscribe((data: any) => {
            console.log('init history list', that.init);
            console.log(data);
            if (data.length && that.init) {
              onResult(data, {noData: false});
              that.init = false;
            } else {
              onResult(data, {noData: true});
            }
            onResult(data);
          });
        },
        resolveSymbol(symbol, onResolve) {
          console.log('resolve symbol');
          timer(1e3)
            .pipe(
              tap(() => {
                onResolve({
                  name: that.symbol,
                  full_name: that.symbol, // display on the chart
                  base_name: that.symbol,
                  has_intraday: true, // enable minute and others
                });
              })
            ).subscribe();
        },
        getServerTime() {
        },
        subscribeBars(symbol, granularity, onTick) {
          console.log('subscribe, arg:', arguments);
          that.mockService.getHistoryList({
            granularity: that.granularityMap[granularity],
          }, true);
          that.ws.onmessage = (e) => {
            try {
              if (e) {
                // data's timestamp === recent one ? Update the recent one : A new timestamp data
                const barData = that.prepareJoinedBarData(that.bars, e);
                onTick(barData);
              }
            } catch (e) {
              console.error(e);
            }
          };

          // subscribe the realtime data
          that.ws.send(`${that.wsMessage}_kline_${that.granularityMap[granularity]}`);
        },
        unsubscribeBars() {
          that.ws.send('stop receiving data or just close websocket');
        },
      },
    });
  }

  prepareJoinedBarData(base: Map<string, BarData>, replacement: Map<string, BarData>): BarData {
    const replacementKey = replacement.keys().next().value;
    const replacementValue = replacement.values().next().value;
    base.set(replacementKey, replacementValue);


    const translatedBar = this.mapToBarData(base, replacementValue.time);
    return translatedBar;

  }

  mapToBarData(base: Map<string, BarData>, timestamp: number): BarData {
    const barDatas = [...base.values()];
    return {
      volume: null,
      time: timestamp,
      open: this.reduceNumber(barDatas.map(b => b.open)),
      low: this.reduceNumber(barDatas.map(b => b.low)),
      close: this.reduceNumber(barDatas.map(b => b.close)),
      high: this.reduceNumber(barDatas.map(b => b.high))
    };
  }

  reduceNumber(number: number[]): number {
    return number.reduce((a, b) => a + b, 0);
  }
}
