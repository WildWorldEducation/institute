// AWS S3
// S3 needs access to the .env variables
const {
    S3Client,
    PutObjectCommand,
    CopyObjectCommand,
    waitUntilObjectExists
} = require('@aws-sdk/client-s3');
require('dotenv').config();
const socraticTutorTTSURLSBucketName =
    process.env.S3_SOCRATIC_TUTOR_TTS_URLS_BUCKET_NAME;
const bucketRegion = process.env.S3_BUCKET_REGION;
const accessKeyId = process.env.S3_ACCESS_KEY_ID;
const accessSecretKey = process.env.S3_SECRET_ACCESS_KEY;
const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: accessSecretKey
    },
    region: bucketRegion
});

const fs = require('fs');
const path = require('path');

// Import OpenAI package.
const { OpenAI } = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function textToSpeech(latestMessage, threadID, messageNumber) {
    //const speechFile = path.resolve('./speech.mp3');

    console.log('generate speech');

    const mp3 = await openai.audio.speech.create({
        model: 'tts-1-hd',
        voice: 'fable',
        input: latestMessage
    });

    //const buffer = Buffer.from(await mp3.arrayBuffer());
    const buffer = Buffer.from(await mp3.arrayBuffer(), 'binary').toString(
        'base64'
    );

    //await fs.promises.writeFile(speechFile, buffer);
    //res.send(buffer);
    saveMP3ToAWS(buffer, threadID, messageNumber);
}

/**
 *  Save the MP3 to AWS S3
 *
 * @param {*} mp3 data file string of the image
 * @param {*} threadID unique thread id
 * @param {*} messageNumber message number within the thread
 *
 * @return the name of the mp3 that got saved to database Or null if pass no mp3
 */
const saveMP3ToAWS = async (mp3, threadID, messageNumber) => {
    if (!mp3) {
        return null;
    }
    // Get file from Base64 encoding (client sends as base64)
    //let fileData = Buffer.from(mp3, 'base64');

    let newFileData = 'data:audio/mp3;base64,' + mp3;

    console.log(newFileData);

    const mp3Name = `${threadID}_${messageNumber}`;

    // Save full size mp3.
    let fullSizeData = {
        // The name it will be saved as on S3
        Key: mp3Name,
        // The image
        Body: newFileData,
        ContentEncoding: 'base64',
        ContentType: 'audio/mp3',
        // The S3 bucket
        Bucket: socraticTutorTTSURLSBucketName
    };

    console.log(fullSizeData);

    // Send to the bucket.
    const fullSizeCommand = new PutObjectCommand(fullSizeData);
    console.log('sending');

    await s3.send(fullSizeCommand);

    return mp3Name;
};

module.exports = {
    textToSpeech
};
