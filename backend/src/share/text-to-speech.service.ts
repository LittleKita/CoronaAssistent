import { v1 } from '@google-cloud/text-to-speech';
import { google } from '@google-cloud/text-to-speech/build/protos/protos';

export class TextToSpeechService {

    private client: v1.TextToSpeechClient;
    private cache: { [key: string]: (Uint8Array | string | null | undefined) } = {};

    constructor() {
        this.client = new v1.TextToSpeechClient();
    }

    public async synthesizeSpeech(text: string, speaker: string) {
        if (this.cache[text]) {
            return this.cache[text];
        }

        const request: google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
            input: { text: text },
            // Select the language and SSML voice gender (optional)
            voice: { languageCode: 'de', ssmlGender: 'NEUTRAL', name: speaker },
            // select the type of audio encoding
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await this.client.synthesizeSpeech(request);
        this.cache[text] = response.audioContent;
        return response.audioContent;
    }
}
