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
let rawIcon = '';


async function generateIconForSkill(skillName, skillId) {
    // const genIconPrompt = await openai.chat.completions.create({
    //     messages: [
    //         { role: 'system', content: 'You are a helpful assistant.' },
    //         {
    //             role: 'user',
    //             content: `write a prompt for dall-e-3 to design an icon for study subject "${skillname}". Make sure the background is white and the icon have easy to recognize shapes even if scale down to smaller size `,
    //         }
    //     ],
    //     model: 'gpt-4-o',
    // });
    // const promptMessage = genIconPrompt.choices[0].message;
    // console.log(promptMessage)
    const prompt = "Design an icon representing the study subject 'Nutrition & Digestion.' The icon should feature simple and bold shapes, such as a stylized stomach, fork and spoon, or food items like fruits, vegetables, or a plate, symbolizing nutrition and the digestive process. Ensure the design is minimalistic, easy to recognize, and retains clarity even when scaled down. The background must be pure white, and the icon should not include any text or unnecessary details"
    const iconBase64 = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
    })
    rawIcon = iconBase64.data[0].b64_json;
    // const imgSrc = `data:image/jpeg;base64,${iconBase64.data[0].b64_json}`;
    fs.writeFileSync('aiIcon.json', JSON.stringify(iconBase64));
}


async function convertImageTo64X64() {
    const sampleImage = rawIcon;
    //const sampleImage = iconImage.data[0].b64_json
    let imgBuffer = Buffer.from(sampleImage, 'base64');
    const data = await sharp(imgBuffer).resize({ width: 50, height: 50 }).toBuffer();
    const resultBase64 = `data:image/png;base64,${data.toString('base64')}`
    console.log(typeof (resultBase64));
    console.log(resultBase64);
    const writeObj = JSON.stringify({ image: resultBase64 })
    fs.writeFileSync('rawImage.json', writeObj);
}


module.exports = { generateIconForSkill, convertImageTo64X64 }