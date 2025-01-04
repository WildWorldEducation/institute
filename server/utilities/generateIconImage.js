// Using ChatGPT.
// Import OpenAI package.
const { OpenAI } = require('openai');
// Include API key.
// To access the .env file.
require('dotenv').config();
const openai = new OpenAI({
    apiKey: process.env.VECTOR_OPEN_API_KEY
});

// Database connection
const conn = require('../config/db');


async function generateIconForSkill(skillName, skillId) {
    const genIconPrompt = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            {
                role: 'user',
                content: `write an instruction prompt for an AI to create a base64 encode string for a an icon with 64X64 pixels that have symbol relate to subject "${skillName}" that human can associate to big subject this subject are fall into.  Make sure the string is the short in length for to store in a data base efficiency. The icon should have mono color only`,
            }
        ],
        model: 'gpt-4',
    });
    const promptMessage = genIconPrompt.choices[0].message;
    console.log(promptMessage)
    const iconBase64 = await openai.images.generate(
        model = "dall-e-3",
        prompt = genIconPrompt,
        size = "64x64",
        quality = "standard",
        response_format = 'b64_json',
        n = 1,
    )
    // const imgSrc = `data:image/jpeg;base64,${iconBase64.data[0].b64_json}`;
    console.log(iconBase64)
    console.log('image source: ')
    console.log(imgSrc)
}

module.exports = { generateIconForSkill }