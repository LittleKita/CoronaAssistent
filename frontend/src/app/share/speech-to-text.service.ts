import { Injectable } from '@angular/core';
import { EndpointServiceService } from './endpoint-service.service';

@Injectable({
  providedIn: 'root'
})
export class SpeechToTextService {

  constructor(private endpointServiceService: EndpointServiceService) { }

  public recognize(audio: ArrayBuffer, callback: (text: string) => void): void {
    const endpoint = this.endpointServiceService.subscribeSpeechToTextEndpoint((text: string) => {
      if (text === null) {
        endpoint.send(audio);
      } else {
        callback(text);
      }
    }, (error) => {
      console.error(error);
    }, () => {
      console.log('complete');
    });
  }
}
