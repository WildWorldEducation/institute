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


const iconImage = JSON.parse(fs.readFileSync('aiIcon.json', 'utf8'));

const skillIconBucketName = process.env.S3_SKILL_ICON_BUCKET_NAME;

async function generateIconForSkill(skillName, skillUrl) {
    const genIconPrompt = await openai.chat.completions.create({
        messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            {
                role: 'user',
                content: `write a prompt for dall-e-3 to design a icon for subject "${skillName}". Make sure the result icon contain only one shape for easy recognized when scaling down to lower resolution. Make sure the whole image background is in white color. Use font-awesome site for reference. Return only the prompt`,
            }
        ],
        model: 'gpt-4o-mini',
    });

    const promptMessage = genIconPrompt.choices[0].message;
    console.log('Generated prompt for skill: ' + skillName)
    console.log(promptMessage)
    const prompt = promptMessage.content
    //const prompt = `Design an icon representing the subject "${skillName}". The icon should be simple and easily recognizable even when scaled down to lower resolutions. Ensure the background is white and include only one shape to convey the concept effectively.Make sure the background is white. You can refer to the font-awesome site for inspiration on creating a visually appealing and symbolic icon.`
    const iconBase64 = await openai.images.generate({
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: '1024x1024',
        response_format: 'b64_json'
    })
    const rawIcon = iconBase64.data[0].b64_json;
    const base64rawIcon = 'data:image/png;base64,' + rawIcon
    // const imgSrc = `data:image/jpeg;base64,${iconBase64.data[0].b64_json}`;

    // we also add the image into AWS bucket
    await saveBase64ImageToBucket(base64rawIcon, skillUrl, skillIconBucketName)
    const smallImage = await convertImageTo64X64(rawIcon, skillName);
    return smallImage;
}


async function convertImageTo64X64(rawIcon, skillName) {
    //const sampleImage = iconImage.data[0].b64_json
    let imgBuffer = Buffer.from(rawIcon, 'base64');
    const data = await sharp(imgBuffer).resize({ width: 50, height: 50 }).toBuffer();
    const resultBase64 = `data:image/png;base64,${data.toString('base64')}`
    console.log('base-64 for skill: ' + skillName)
    console.log(resultBase64)
    return resultBase64;
}


module.exports = { generateIconForSkill, convertImageTo64X64 }