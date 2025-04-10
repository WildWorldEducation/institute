const fs = require('fs');
const fsPromises = require('fs/promises');
// Import OpenAI package.
const { OpenAI } = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Write the file to server's disk
async function writeFile(filePath, bufferObj) {
    try {
        fs.writeFileSync(filePath, bufferObj);
    } catch (err) {
        console.error('Error occurred while reading directory:', err);
    }
}

async function speechToText(filePath) {
    try {
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-1'
        });

        // delete file
        fs.unlinkSync(filePath);

        return transcription;
    } catch (err) {
        // delete file
        fs.unlinkSync(filePath);
        console.error('Error occurred while transcribing the audio:', err);
    }
}

module.exports = {
    writeFile,
    speechToText
};
