import fs from 'fs';
// Import OpenAI package.
const { OpenAI } = require('openai');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});
