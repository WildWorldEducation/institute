// AWS S3
// S3 needs access to the .env variables
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
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
    latestMessage = 'test test ABC';

    const mp3 = await openai.audio.speech.create({
        model: 'tts-1-hd',
        voice: 'fable',
        input: latestMessage
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    //  await fs.promises.writeFile(speechFile, buffer);

    console.log('buffer generated');

    // const buffer = Buffer.from(await mp3.arrayBuffer(), 'binary').toString(
    //     'base64'
    // );

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
const saveMP3ToAWS = async (buffer, threadID, messageNumber) => {
    if (!buffer) {
        return null;
    }

    const mp3Name = `${threadID}-${messageNumber}.mp3`;
    // Save full size mp3.
    let params = {
        // The name it will be saved as on S3
        Key: mp3Name,
        // The image
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: 'audio/mpeg',
        // The S3 bucket
        Bucket: socraticTutorTTSURLSBucketName
    };

    // Read in the file, convert it to base64, store to S3

    //   var s3 = new AWS.S3();
    // S3Client.putObject({
    //     Bucket: socraticTutorTTSURLSBucketName,
    //     Key: mp3Name,
    //     Body: buffer
    // }).done(function (resp) {
    //     console.log('Successfully uploaded package.');
    // });

    // Send to the bucket.
    const fullSizeCommand = new PutObjectCommand(params);
    console.log('sending');
    await s3.send(fullSizeCommand);

    console.log('sent');
    return mp3Name;
};

module.exports = {
    textToSpeech
};
