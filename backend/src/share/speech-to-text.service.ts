import { v1 } from '@google-cloud/speech';
import { google } from '@google-cloud/speech/build/protos/protos';

export class SpeechToTextService {

    private client: v1.SpeechClient;

    constructor() {
        this.client = new v1.SpeechClient();
    }

    public async recognize(audio: Uint8Array|string) {
        const config: google.cloud.speech.v1.IRecognitionConfig = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            // sampleRateHertz: 44100,
            languageCode: 'de',
          };
          const request: google.cloud.speech.v1.IRecognizeRequest = {
            audio: {
                content: audio
            },
            config: config
          };
        
          // Detects speech in the audio file
          const [response] = await this.client.recognize(request);
          if(!response || !response.results) {
              return null;
          }
          const results: google.cloud.speech.v1.ISpeechRecognitionResult[] = response.results;
          const transcription = results.map((result: any) => result.alternatives[0].transcript)
            .join('\n');
        console.log('result: ' + transcription);
        return transcription;
    }
}
