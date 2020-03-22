import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
import { TextToSpeechService } from '../share/text-to-speech.service';
import { MDBModalRef, MDBModalService } from 'angular-bootstrap-md';
import { ModalComponent } from '../modal/modal.component';
import { SpeechToTextService } from '../share/speech-to-text.service';
import { HttpClient } from '@angular/common/http';

function floatTo16BitPCM(input: Float32Array): ArrayBuffer {
  const output = new DataView(new ArrayBuffer(input.length * 2)); // length is in bytes (8-bit), so *2 to get 16-bit length
  for (let i = 0; i < input.length; i++) {
    const multiplier = input[i] < 0 ? 0x8000 : 0x7FFF; // 16-bit signed range is -32768 to 32767
    // tslint:disable-next-line: no-bitwise
    output.setInt16(i * 2, (input[i] * multiplier) | 0, true); // index, value, little edian
  }
  return output.buffer;
}

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
  private mediaStreamAudioDestinationNode: MediaStreamAudioDestinationNode;

  private readonly frameRate = 16000;
  private gabs = 0; // 0.25;
  private breakFrames = 0;
  private readonly breakFrameCount = this.frameRate / 1000 * 1500;  // 1.5s
  private buffer: ArrayBuffer = new ArrayBuffer(0);

  constructor(
    private speechToText: SpeechToTextService,
    private textToSpeechService: TextToSpeechService,
    private modalService: MDBModalService,
    private http: HttpClient,
    private zone: NgZone) {
  }

  ngOnInit() { }

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
    this.appendOutput('Guten Tag, Sie sind mit dem Corona Assistenten verbunden. ' +
      'Wir werden Ihr Hilfegesuch gerne an die nächstgelegene Hilfsgruppe weiterleiten.', true, () => {
        this.appendOutput('Drücke den Microphone Button um mit mir zu reden.', false);
      });
  }

  private appendOutput(text: string, useTextToSpeech: boolean, callback?: () => void): void {
//    useTextToSpeech = false;
    if (!useTextToSpeech) {
      this.zone.run(() => {
        this.output += text + '\r\n';
      });
      if (callback) {
        callback();
      }
      return;
    }

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
      this.appendOutput('Die Verbindung zum Microphone wurde getrennt.', true, () => {
        this.stream.getTracks().forEach((track: MediaStreamTrack) => {
          track.stop();
        });
      });
      if (this.source) {
        this.source.disconnect();
        this.source = null;
      }
      if (this.scriptProcessorNode) {
        this.scriptProcessorNode.disconnect();
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

        navigator.mediaDevices.enumerateDevices()
          .then((deviceInfos: MediaDeviceInfo[]) => {
            let audioInputIndex = 0;
            let videoInputIndex = 0;
            let cameraInputIndex = 0;
            const options: MediaDeviceInfo[] = [];
            for (let i = 0; i !== deviceInfos.length; ++i) {
              const deviceInfo: MediaDeviceInfo = deviceInfos[i];
              let text: string;
              if (deviceInfo.kind === 'audioinput') {
                text = deviceInfo.label || 'Microphone ' + ++audioInputIndex;
                if (!deviceInfo.label) {
                  options.push({
                    deviceId: deviceInfo.deviceId,
                    groupId: deviceInfo.groupId,
                    kind: deviceInfo.kind,
                    label: text,
                    toJSON: deviceInfo.toJSON
                  });
                } else {
                  options.push(deviceInfo);
                }
              } else if (deviceInfo.kind === 'audiooutput') {
                text = deviceInfo.label || 'Speaker ' + ++videoInputIndex;
              } else if (deviceInfo.kind === 'videoinput') {
                text = deviceInfo.label || 'Camera ' + ++cameraInputIndex;
              }
            }
            console.log(options);
            console.log('Used device', options[0]);
          }).catch((error: Error) => {
            alert('Could not enumerate devices: ' + error);
            console.log(error);
          });

        this.stream = stream;
        this.running = true;

        this.appendOutput('Du kannst jetzt Sprechen.', true, () => {
          if (!this.audioContext) {
            this.audioContext = new AudioContext({
              sampleRate: 16000,
              latencyHint: 'interactive'
            });
            this.scriptProcessorNode = this.audioContext.createScriptProcessor(16384 / 2, 1, 1);
            this.scriptProcessorNode.addEventListener('audioprocess', (e: AudioProcessingEvent) => this.audioProcess(e));
            this.mediaStreamAudioDestinationNode = this.audioContext.createMediaStreamDestination();
          }

          this.source = this.audioContext.createMediaStreamSource(stream);
          this.source.connect(this.scriptProcessorNode);
          this.scriptProcessorNode.connect(this.mediaStreamAudioDestinationNode);
          console.log('OK', [this.source]);
        });
      }, (error: MediaStreamError) => {
        this.appendOutput('Das Microphone konnte leider nicht verbunden werden.', true, () => {
        });
        this.output += 'Fehler: "' + error + '"\r\n';
        console.log(error);
      });
  }

  private audioProcess(e: AudioProcessingEvent): void {
    const audioBuffer: AudioBuffer = e.inputBuffer;

    const array: Float32Array = audioBuffer.getChannelData(0);
    let abs = 0;
    for (const entry of array) {
      abs = Math.max(abs, Math.abs(entry));
      if (abs <= (this.gabs / 100 * 5) || abs <= 0.01) {// 0.000009
        this.breakFrames++;
      } else if (this.breakFrames !== 0) {
        this.breakFrames = 0;
      }
    }

    this.gabs -= (this.gabs / 100 * 1);
    this.gabs = Math.max(this.gabs, abs);

    if (this.breakFrames >= this.breakFrameCount) {
      const buffer = this.buffer;
      if (buffer.byteLength > 0) {
        this.buffer = new ArrayBuffer(0);
        console.log('send', buffer.byteLength);
        this.speechToText.recognize(buffer, (text: string) => {
          if (text) {
            this.appendOutput('Folgende Nachricht haben wir erhalten: "' + text + '"', true, () => {
              this.http.post('https://coronaassistent.nw7.de/telegram/message', { text }).subscribe((result) => {
                console.log('result: ', result);
                this.appendOutput('Jemand aus der Hilfsgruppe "Hilfe gegen Corona Darmstadt"' +
                  ' wird sich so bald wie möglich mit Ihnen in Verbindung setzen. Einen schönen Tag noch!', true, () => {
                    if (this.running) {
                      this.startRecordning();
                    }
                  });
              }, (error) => {
                console.error(error);
                this.appendOutput('Die Nachricht konnte nicht weitergeleitet werden.', true, () => {
                  if (this.running) {
                    this.startRecordning();
                  }
                });
              });
            });
          }
        });
      }
    } else {
      const arrayBuffer: ArrayBuffer = floatTo16BitPCM(array);
      console.log('add', arrayBuffer.byteLength);
      this.addArrayBuffer(arrayBuffer);
    }
  }

  private addArrayBuffer(arrayBuffer: ArrayBuffer): void {
    const sourceView = new Uint8Array(this.buffer);
    const arrayBufferView = new Uint8Array(arrayBuffer);

    const destView = new Uint8Array(new ArrayBuffer(this.buffer.byteLength + arrayBuffer.byteLength));

    destView.set(sourceView);
    destView.set(arrayBufferView, this.buffer.byteLength);

    this.buffer = destView.buffer;
    console.log('sum', this.buffer.byteLength);
  }
}
