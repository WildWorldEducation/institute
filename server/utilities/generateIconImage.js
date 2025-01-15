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
const { saveBase64ImageToBucket } = require('./save-image-to-aws');

let rawdata = fs.readFileSync('imageData.json');
const iconImage = JSON.parse(fs.readFileSync('aiIcon.json', 'utf8'));
let rawIcon = '';
const skillIconBucketName = process.env.S3_SKILL_ICON_BUCKET_NAME;

async function generateIconForSkill(skillName, skillUrl) {
    const genIconPrompt = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            {
                role: 'user',
                content: `write a prompt for dall-e-3 to design an icon for study subject "${skillName}". Make sure the background is white and the icon have easy to recognize shapes even if scale down to smaller size `,
            }
        ],
        model: 'gpt-4o-mini',
    });

    const promptMessage = genIconPrompt.choices[0].message;
    console.log('Generated prompt for skill: ' + skillName)
    console.log(promptMessage)
    const prompt = promptMessage.content
    const iconBase64 = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
    })
    rawIcon = iconBase64.data[0].b64_json;
    const base64rawIcon = 'data:image/png;base64,' + rawIcon
    // const imgSrc = `data:image/jpeg;base64,${iconBase64.data[0].b64_json}`;

    // we also add the image into AWS bucket
    await saveBase64ImageToBucket(base64rawIcon, skillUrl, skillIconBucketName)
    const smallImage = await convertImageTo64X64(rawIcon);
    return smallImage;
}


async function convertImageTo64X64(rawIcon) {
    //const sampleImage = iconImage.data[0].b64_json
    let imgBuffer = Buffer.from(rawIcon, 'base64');
    const data = await sharp(imgBuffer).resize({ width: 50, height: 50 }).toBuffer();
    const resultBase64 = `data:image/png;base64,${data.toString('base64')}`
    const writeObj = JSON.stringify({ image: resultBase64 })
    return resultBase64;
}


module.exports = { generateIconForSkill, convertImageTo64X64 }