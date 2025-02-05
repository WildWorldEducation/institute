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

/**
 * Create New Item
 *
 * @return response()
 */
router.post('/', async (req, res, next) => {
    let userQuestion = req.body.message;
    if (req.session.userName) {
        // Create an Assistant

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
            content: userQuestion
        });

        let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
            assistant_id: assistant.id,
            instructions: 'Please return the message as formatted html code.'
        });

        if (run.status === 'completed') {
            const messages = await openai.beta.threads.messages.list(
                run.thread_id
            );
            console.log(messages.length);
            for (const message of messages.data.reverse()) {
                // console.log(
                //     `${message.role} > ${message.content[0].text.value}`
                // );
                //console.log(message.content[0].text.value);
                //    res.json({ answer: message.content[0].text.value });
            }
            res.json({ message: messages.data.reverse() });
        } else {
            console.log(run.status);
        }

        // res.json({
        //     message: `${message.role} > ${message.content[0].text.value}`
        // });

        //  res.json();
    } else {
    }
});

// Export the router for app to use.
module.exports = router;
