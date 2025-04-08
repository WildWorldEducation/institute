const fs = require('fs');
const fsPromises = require('fs/promises');
// Import OpenAI package.
const { OpenAI } = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

/**
 * Calculate token usage for STT
 * @param {string} filePath - Path to audio file
 * @returns {number} - Estimated token count
 */
function calculateSSTTokens(filePath) {
    try {
        // Get file stats to determine size
        const stats = fs.statSync(filePath);
        const fileSizeInBytes = stats.size;
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

        // Estimate token usage based on file size
        // This is an approximation: 100 tokens per MB of audio
        return Math.ceil(fileSizeInMB * 100);
    } catch (error) {
        console.error('Error calculating SST tokens:', error);
        // Default fallback if calculation fails
        return 50;
    }
}

/**
 * Write the file to server's disk
 * @param {string} filePath - Destination path
 * @param {Buffer} bufferObj - File data
 */
async function writeFile(filePath, bufferObj) {
    try {
        fs.writeFileSync(filePath, bufferObj);
    } catch (err) {
        console.error('Error occurred while writing file:', err);
        throw err;
    }
}

/**
 * Convert speech to text and calculate token usage
 * @param {string} filePath - Path to audio file
 * @returns {object} - Contains transcription text and token count
 */
async function speechToText(filePath) {
    try {
        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(filePath),
            model: 'whisper-1'
        });

        // Calculate token usage
        const tokensUsed = calculateSSTTokens(filePath);

        // Delete file
        fs.unlinkSync(filePath);

        // Return both the transcription and token count
        return {
            text: transcription.text,
            tokens: tokensUsed
        };
    } catch (err) {
        // Delete file
        try {
            fs.unlinkSync(filePath);
        } catch (unlinkErr) {
            console.error('Error deleting file:', unlinkErr);
        }
        console.error('Error occurred while transcribing the audio:', err);
        throw err;
    }
}

module.exports = {
    writeFile,
    speechToText,
    calculateSSTTokens
};
