/*------------------------------------------
--------------------------------------------
Middleware.
--------------------------------------------
--------------------------------------------*/
const express = require('express');
// Router.
const router = express.Router();

// Import OpenAI package.
const { OpenAI } = require('openai');
// Include API key.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Create an Assistant
async function main() {
    const assistant = await openai.beta.assistants.create({
        name: 'General Tutor',
        instructions:
            'You are a personal tutor. Answer any questions you are asked..',
        tools: [{ type: 'code_interpreter' }],
        model: 'gpt-4o'
    });

    // Create a Thread
    const thread = await openai.beta.threads.create();
    // console.log(thread);

    // Add a Message to the Thread
    const message = await openai.beta.threads.messages.create(thread.id, {
        role: 'user',
        content: 'I need to solve the equation `3x + 11 = 14`. Can you help me?'
    });

    let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
        assistant_id: assistant.id,
        instructions:
            'Please address the user as Jane Doe. The user has a premium account.'
    });

    if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(run.thread_id);
        for (const message of messages.data.reverse()) {
            console.log(`${message.role} > ${message.content[0].text.value}`);
        }
    } else {
        console.log(run.status);
    }
}

main();

// Export the router for app to use.
module.exports = router;
