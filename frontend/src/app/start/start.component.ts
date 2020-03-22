import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { TextToSpeechService } from '../share/text-to-speech.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit, AfterViewInit {

  output = '';
  running = false;
  stream: MediaStream;

  @ViewChild('audio', { read: ElementRef, static: false })
  audio: ElementRef<HTMLAudioElement>;

  constructor(private textToSpeechService: TextToSpeechService) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    window.setTimeout(() => {
      this.appendOutput('Hallo ich bin der Corona-Assitent. Wie kann ich dir helfen?');
    }, 100);
  }

  private appendOutput(text: string, callback?: () => void): void {
    this.textToSpeechService.synthesizeSpeech(text, (data: Blob) => {
      this.audio.nativeElement.src = window.URL.createObjectURL(data);
      this.audio.nativeElement.play();
    });
    this.output += text + '\r\n';
  }

  startRecordning(): void {
    if (this.running) {
      this.running = false;
      this.appendOutput('Die Verbindung zum Microphone wurde getrennt.', () => {
        this.stream.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
        });
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

        console.log(stream);

        this.appendOutput('Das Microphone wurde erfolgreich verbunden.', () => {
          this.appendOutput('Du kannst jetzt Sprechen.', () => {
            console.log('OK');
          });
        });
      }, (error: MediaStreamError) => {
        this.appendOutput('Das Microphone konnte leider nicht verbunden werden.', () => {
        });
        this.output += 'Fehler: "' + error + '"\r\n';
        console.log(error);
      });
  }

}
