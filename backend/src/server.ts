import fs from 'fs';
import expressWs from 'express-ws';
import express from 'express';
import * as core from 'express-serve-static-core';
import bodyParser from 'body-parser';
import WebSocket from 'ws';
import { TextToSpeechService } from './share/text-to-speech.service';
import { SpeechToTextService } from './share/speech-to-text.service';

process.env['GOOGLE_APPLICATION_CREDENTIALS'] = 'credentials.json';

interface Express extends core.Express {
    ws: expressWs.WebsocketMethod<this>;
}

const app = express() as Express;
expressWs(app);

const textToSpeechService: TextToSpeechService = new TextToSpeechService();
const speechToTextService: SpeechToTextService = new SpeechToTextService();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'PUT, GET');
    next();
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.ws('/t2s/', (ws, req) => {
    console.log('socket', req.url);
    ws.onmessage = (event: WebSocket.MessageEvent) => {
        console.log(event.data);
        textToSpeechService.synthesizeSpeech(event.data as string).then((content: any) => {
            console.log(content);
            ws.send(content);
            ws.close();
        }).catch((error) => {
            console.error(error);
            ws.send(error);
            ws.close();
        });
    };
    ws.onclose = () => {
        console.log('close');
    };
});

app.ws('/s2t/', (ws, req) => {
    console.log('socket', req.url);
    ws.onmessage = (event: WebSocket.MessageEvent) => {
        console.log(event.data);
        speechToTextService.recognize(event.data as any).then((text: string | null) => {
            console.log(text);
            ws.send(text);
            ws.close();
        }).catch((error) => {
            console.error(error);
            ws.send(error);
            ws.close();
        });
    };
    ws.onclose = () => {
        console.log('close');
    };
});

const port = 12345;

app.listen(port, () => {
    // tslint:disable-next-line:no-console
    console.log(`server started at http://localhost:${port}`);
});
