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
const fs = require('fs');

let rawdata = fs.readFileSync('imageData.json');
const iconImage = JSON.parse(fs.readFileSync('aiIcon.json', 'utf8'));



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
    const prompt = "Create a black object on a white background representing the concept 'Power Tool' The design should feature a combination of elements like a stylized AI brain, a circuit, or a robot integrated with coding-related symbols such as brackets, lines of code, or a computer screen. The symbol should be abstract, minimalistic, and visually distinct, avoiding any use of text."
    const iconBase64 = await openai.images.generate({
        model: "dall-e-2",
        prompt: prompt,
        n: 1,
        size: '256x256',
        response_format: 'b64_json'
    })
    // const imgSrc = `data:image/jpeg;base64,${iconBase64.data[0].b64_json}`;
    console.log(iconBase64)
    fs.writeFileSync('aiIcon.json', JSON.stringify(iconBase64));
}


async function convertImageTo64X64() {
    const sampleImage = iconImage.data[0].b64_json;


    let imgBuffer = Buffer.from(sampleImage, 'base64');
    const data = await sharp(imgBuffer).resize({ width: 64, height: 64 }).toBuffer();
    const resultBase64 = `data:image/png;base64,${data.toString('base64')}`
    console.log(typeof (resultBase64));
    console.log(resultBase64);
    const writeObj = JSON.stringify({ image: resultBase64 })
    fs.writeFileSync('rawImage.json', writeObj);
}


module.exports = { generateIconForSkill, convertImageTo64X64 }