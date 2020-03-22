'use strict';

function text2speech(
){
  // [START tts_quickstart]
  // Imports the Google Cloud client library
  const textToSpeech = require('@google-cloud/text-to-speech');

  // Import other required libraries
  const fs = require('fs');
  const util = require('util');
  // Creates a client
  const client = new textToSpeech.TextToSpeechClient();
  async function quickStart() {

    // The text to synthesize
    const text = 'Hallo Google das hier ist ein Test deiner Sprache zu Text EPA wir wollen nämlich gerne wissen wie gut die auf Deutsch funktioniert vielen Dank für deine Kooperation hier spricht Alex auf Wiedersehen';

    // Construct the request
    const request = {
      input: {text: text},
      // Select the language and SSML voice gender (optional)
      voice: {languageCode: 'de', ssmlGender: 'NEUTRAL'},
      // select the type of audio encoding
      audioConfig: {audioEncoding: 'MP3'},
    };

    // Performs the text-to-speech request
    const [response] = await client.synthesizeSpeech(request);
    // Write the binary audio content to a local file
    const writeFile = util.promisify(fs.writeFile);
    await writeFile('resources/output.mp3', response.audioContent, 'binary');
    console.log('Audio content written to file: output.mp3');
  }
  quickStart().catch(console.error);
  // [END tts_quickstart]
}

text2speech();
