import {InjectableRxStompConfig} from '@stomp/ng2-stompjs';

export const myRxStompConfig: InjectableRxStompConfig = {
  brokerURL: 'wss://auto-crypto-trader.herokuapp.com/websocket',


  connectHeaders: {
    login: '',
    passcode: ''
  },


  heartbeatIncoming: 0,
  heartbeatOutgoing: 20000,


  reconnectDelay: 1000,

  debug: (msg: string): void => {
  }
};
