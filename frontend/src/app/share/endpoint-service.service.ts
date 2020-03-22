import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';

export class SendSubscription extends Subscription {
  private webSocket: WebSocket;

  constructor(private url: string, next?: any, error?: any, complete?: any) {
    super(() => {
      this.webSocket.close();
    });

    this.webSocket = new WebSocket(url);
    this.webSocket.onopen = () => {
      if (next) {
        next(null);
      }
    };
    this.webSocket.onmessage = (msg) => {
      console.log('message', msg.data);
      if (next) {
        next(msg.data);
      }
    };
    this.webSocket.onclose = () => {
      if (complete) {
        complete();
      }
    };
    this.webSocket.onerror = (err) => {
      if (error) {
        error(err);
      } else {
        throw new Error('' + err);
      }
    };
  }

  public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    this.webSocket.send(data);
  }
}

@Injectable({
  providedIn: 'root'
})
export class EndpointServiceService {

  constructor() { }

  public subscribeSpeechToTextEndpoint(next?: any, error?: any, complete?: any): SendSubscription {
    return new SendSubscription(this.createEndpointUrl('s2t'), next, error, complete);
  }

  public subscribeTextToSpeechEndpoint(next?: any, error?: any, complete?: any): SendSubscription {
    return new SendSubscription(this.createEndpointUrl('t2s'), next, error, complete);
  }

  private createEndpointUrl(path: string): string {
    let url: string;
    if (location.href.indexOf('localhost') >= 0 || location.href.indexOf('127.0.0.1') >= 0) {
      url = 'ws://localhost:12345/' + path + '/';
    } else {
      if (location.protocol === 'https:') {
        url = 'wss:';
      } else {
        url = 'ws:';
      }
      url += '//' + location.host;
      if (location.pathname[location.pathname.length - 1] === '/') {
        url += location.pathname + path + '/';
      } else {
        url += location.pathname + '/' + path + '/';
      }
    }
    return url;
  }
}
