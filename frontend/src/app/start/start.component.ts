import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit {

  output = '';
  running = false;
  stream: MediaStream;

  constructor() { }

  ngOnInit() {
  }

  startRecordning(): void {
    if(this.running) {
      this.running = false;
      this.output += 'Die Verbindung zum Microphone wurde getrennt.\r\n';
      this.stream.getTracks().forEach((track: MediaStreamTrack) => {
        track.stop();
      });
      return;
    }

    this.output += '. . .\r\n';

    navigator.getUserMedia(
      {
        audio: {
          deviceId: undefined, // { exact: this.selected }
          noiseSuppression: {
            exact: false,
            ideal: false,
          },
          channelCount: {
            exact: 1,
            ideal: 1,
            min: 1,
            max: 1
          },
          sampleRate: {
            //            exact: 16000,
            ideal: 16000,
            //            max: 16000,
            min: 16000
          },
          // sampleRate: 16000,
          sampleSize: { // 16bit == 2 bytes
            ideal: 16,
            exact: 16
          }
        },
        video: false
      }, (stream: MediaStream) => {
        this.stream = stream;
        this.running = true;
        this.output += 'Das Microphone wurde erfolgreich verbunden.\r\n';
        this.output += 'Du kannst jetzt Sprechen.\r\n';
        console.log(stream);
      }, (error: MediaStreamError) => {
        this.output += 'Das Microphone konnte leider nicht verwendet werden: "' + error + '"\r\n';
        console.log(error);
      });
  }

}
