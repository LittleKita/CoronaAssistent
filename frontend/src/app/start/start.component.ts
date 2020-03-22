import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { TextToSpeechService } from '../share/text-to-speech.service';
import { MDBModalRef, MDBModalService } from 'angular-bootstrap-md';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit, AfterViewInit {

  output = '';

  @ViewChild('audio', { read: ElementRef, static: false })
  audio: ElementRef<HTMLAudioElement>;

  private running = false;
  private modalRef: MDBModalRef;
  private audioContext: AudioContext;
  private stream: MediaStream;
  private source: MediaStreamAudioSourceNode;
  private scriptProcessorNode: ScriptProcessorNode;

  constructor(private textToSpeechService: TextToSpeechService, private modalService: MDBModalService, private zone: NgZone) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.start();
    }, 500);
  }

  private showModal(): void {
    this.modalRef = this.modalService.show(ModalComponent);
    this.modalRef.content.action.subscribe(() => {
      this.start();
    });
  }

  private start(): void {
    this.appendOutput('Hallo ich bin der Corona-Assitent. Wie kann ich dir helfen?', () => {
      this.appendOutput('Drücke den Microphone Button um mit mir zu reden.');
    });
  }

  private appendOutput(text: string, callback?: () => void): void {
    this.audio.nativeElement.onended = null;
    this.textToSpeechService.synthesizeSpeech(text, (data: Blob) => {
      this.audio.nativeElement.src = window.URL.createObjectURL(data);
      this.audio.nativeElement.load();
      try {
        this.audio.nativeElement.play().then(() => {
          this.audio.nativeElement.onended = callback;
          this.zone.run(() => {
            this.output += text + '\r\n';
          });
        }).catch((error) => {
          console.log(error);
          this.showModal();
        });
      } catch (e) {
        console.log(e);
        this.showModal();
        return;
      }
    });
  }

  startRecordning(): void {
    if (this.running) {
      this.running = false;
      this.appendOutput('Die Verbindung zum Microphone wurde getrennt.', () => {
        this.stream.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
        });
      });
      if(this.source) {
        this.source.disconnect();
        this.source = null;
      }
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
            if (!this.audioContext) {
              this.audioContext = new AudioContext({
                sampleRate: 16000,
                latencyHint: 'interactive'
              });
              this.scriptProcessorNode = this.audioContext.createScriptProcessor(16384 / 2, 1, 1);
              this.scriptProcessorNode.addEventListener('audioprocess', (e: AudioProcessingEvent) => this.audioProcess(e));
              this.scriptProcessorNode.connect(this.audioContext.createMediaStreamDestination());
            }

            this.source = this.audioContext.createMediaStreamSource(stream);
            this.source.connect(this.scriptProcessorNode);
            console.log('OK', [this.source]);
          });
        });
      }, (error: MediaStreamError) => {
        this.appendOutput('Das Microphone konnte leider nicht verbunden werden.', () => {
        });
        this.output += 'Fehler: "' + error + '"\r\n';
        console.log(error);
      });
  }

  private audioProcess(e: AudioProcessingEvent): void {

  }
}
