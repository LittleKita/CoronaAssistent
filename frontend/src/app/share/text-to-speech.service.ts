import { Injectable } from '@angular/core';
import { EndpointServiceService } from './endpoint-service.service';
@Injectable({
  providedIn: 'root'
})
export class TextToSpeechService {

  private cache: { [key: string]: Blob } = {};

  constructor(private endpointServiceService: EndpointServiceService) {
  }

  public synthesizeSpeech(text: string, callback: (content: Blob) => void): void {
    if (this.cache[text]) {
      callback(this.cache[text]);
      return;
    }

    const endpoint = this.endpointServiceService.subscribeTextToSpeechEndpoint((msg: Blob) => {
      if (msg === null) {
        endpoint.send(text);
      } else {
        this.cache[text] = msg;
        callback(msg);
      }
    }, (error) => {
      console.error(error);
    }, () => {
      console.log('complete');
    });
  }
}
