const fs = require('fs');
const path = require('path');

// Import OpenAI package.
const { OpenAI } = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function textToSpeech(res, mostRecentMessage) {
    const speechFile = path.resolve('./speech.mp3');

    const mp3 = await openai.audio.speech.create({
        model: 'tts-1-hd',
        voice: 'fable',
        input: mostRecentMessage
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    res.send(buffer)
}

module.exports = {
    textToSpeech
};
