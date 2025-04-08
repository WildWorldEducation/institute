// AWS S3
// S3 needs access to the .env variables
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
require('dotenv').config();
const socraticTutorTTSURLSBucketName =
    process.env.S3_SOCRATIC_TUTOR_TTS_URLS_BUCKET_NAME;
const assessingTutorTTSURLSBucketName =
    process.env.S3_ASSESSING_TUTOR_TTS_URLS_BUCKET_NAME;
const learningObjectiveTutorTTSURLSBucketName =
    process.env.S3_LEARNING_OBJECTIVE_TUTOR_TTS_URLS_BUCKET_NAME;
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

// Import OpenAI package.
const { OpenAI } = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Calculate token usage for TTS
 * @param {string} text - Text to convert to speech
 * @returns {number} - Estimated token count
 */
function calculateTTSTokens(text) {
    // Estimation based on character count (approximately 1 token per 4 characters)
    return Math.ceil(text.length / 4);
}

/**
 * Convert text to speech and calculate token usage
 * @param {string} latestMessage - Text to convert to speech
 * @param {string} threadID - Thread ID
 * @param {number} messageNumber - Message number
 * @param {string} tutorType - Type of tutor (socratic, assessing, learning-objective)
 * @returns {object} - Contains filename and token count
 */
async function textToSpeech(latestMessage, threadID, messageNumber, tutorType) {
    // Different voice for normal and assessing tutors, to differentiate them
    let voice = 'fable';
    if (tutorType == 'assessing') voice = 'nova';

    const mp3 = await openai.audio.speech.create({
        // Faster option
        model: 'tts-1',
        // Choice of voice
        voice: voice,
        input: latestMessage
    });

    // Buffer is created (binary)
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Calculate token usage for billing
    const tokensUsed = calculateTTSTokens(latestMessage);

    // Save to S3
    const mp3Name = await saveMP3ToAWS(
        buffer,
        threadID,
        messageNumber,
        tutorType
    );

    // Return both the filename and token count
    return {
        filename: mp3Name,
        tokens: tokensUsed
    };
}

/**
 * Save the MP3 to AWS S3
 * @param {Buffer} buffer - binary data of audio
 * @param {string} threadID - unique thread id
 * @param {number} messageNumber - message number within the thread
 * @param {string} tutorType - Type of tutor
 * @return {string} the name of the mp3 that got saved to database or null if pass no mp3
 */
const saveMP3ToAWS = async (buffer, threadID, messageNumber, tutorType) => {
    if (!buffer) {
        return null;
    }

    // The name combines the thread ID with the message number wihin that thread
    const mp3Name = `${threadID}-${messageNumber}.mp3`;

    let bucketName = '';
    if (tutorType == 'socratic') {
        bucketName = socraticTutorTTSURLSBucketName;
    } else if (tutorType == 'assessing') {
        bucketName = assessingTutorTTSURLSBucketName;
    } else {
        bucketName = learningObjectiveTutorTTSURLSBucketName;
    }

    // Save full size mp3.
    let params = {
        // The name it will be saved as on S3
        Key: mp3Name,
        Body: buffer,
        ContentEncoding: 'base64',
        ContentType: 'audio/mpeg',
        // The S3 bucket
        Bucket: bucketName
    };

    // Send to the bucket.
    const fullSizeCommand = new PutObjectCommand(params);
    await s3.send(fullSizeCommand);
    return mp3Name;
};

module.exports = {
    textToSpeech,
    calculateTTSTokens
};
