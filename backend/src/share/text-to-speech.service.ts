import { v1, protos } from '@google-cloud/text-to-speech';

export class TextToSpeechService {

    private client: v1.TextToSpeechClient;

    constructor() {
        this.client = new v1.TextToSpeechClient;
    }

    public async synthesizeSpeech(text: string) {
        const request: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
            input: { text: text },
            // Select the language and SSML voice gender (optional)
            voice: { languageCode: 'de', ssmlGender: 'NEUTRAL' },
            // select the type of audio encoding
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await this.client.synthesizeSpeech(request);
        return response.audioContent;
    }
}
