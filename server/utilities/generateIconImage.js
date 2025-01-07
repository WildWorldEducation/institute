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
const sharp = require('sharp');



async function generateIconForSkill(skillName, skillId) {
    // const genIconPrompt = await openai.chat.completions.create({
    //     messages: [
    //         { role: 'system', content: 'You are a helpful assistant.' },
    //         {
    //             role: 'user',
    //             content: `write an instruction prompt for an AI to create a base64 encode string for a an icon with 64X64 pixels that have symbol relate to subject "${skillName}" that human can associate to big subject this subject are fall into.  Make sure the string is the short in length for to store in a data base efficiency. The icon should have mono color only`,
    //         }
    //     ],
    //     model: 'gpt-4',
    // });
    // const promptMessage = genIconPrompt.choices[0].message;
    // console.log(promptMessage)
    const prompt = "Create a simple icon representing the subject 'Using AI to Code.' The icon should feature a white background with black details. It should depict a clear and minimalistic design, such as a stylized AI brain or robot combined with coding symbols like brackets, lines of code, or a computer screen. Ensure the design is straightforward, focused on the single subject, and easily relatable to 'Using AI to Code"
    const iconBase64 = await openai.images.generate({
        model: "dall-e-2",
        prompt: prompt,
        n: 1,
        size: '256x256',
        response_format: 'b64_json'
    })
    // const imgSrc = `data:image/jpeg;base64,${iconBase64.data[0].b64_json}`;
    console.log(iconBase64)
}

async function convertImageTo64X64() {
    const sampleImage = 'poo'
    console.log(typeof (sampleImage))
    let imgBuffer = Buffer.from(sampleImage, 'base64');
    const data = await sharp(imgBuffer).resize({ width: 32, height: 32 }).toBuffer();
    const resultBase64 = `data:image/png;base64,${data.toString('base64')}`
    console.log(resultBase64.length)
    console.log(resultBase64);
}


module.exports = { generateIconForSkill, convertImageTo64X64 }