import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {

  private cache: { [key: string]: Blob } = {};

  constructor() {
  }

  public synthesizeSpeech(text: string, callback: (content: Blob) => void): void {
    if (this.cache[text]) {
      callback(this.cache[text]);
      return;
    }

    let url: string;
    if (location.href.indexOf('localhost') >= 0 || location.href.indexOf('127.0.0.1') >= 0) {
      url = 'ws://localhost:12345/t2s/';
    } else {
      if (location.protocol === 'https:') {
        url = 'wss:';
      } else {
        url = 'ws:';
      }
      url += '//' + location.host;
      if (location.pathname[location.pathname.length - 1] == '/') {
        url += location.pathname + 't2s/';
      } else {
        url += location.pathname + '/t2s/';
      }
    }
    const webSocket: WebSocket = new WebSocket(url);
    webSocket.onopen = () => {
      webSocket.send(text);
    };
    webSocket.onmessage = (msg) => {
      console.log('message', msg.data);
      this.cache[text] = msg.data;
      callback(msg.data);
    };
    webSocket.onclose = () => {
      console.log('close');
    };
    webSocket.onerror = (error) => {
      console.error(error);
    };
  }
}
