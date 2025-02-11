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
const { processingNewMessage, initialAssistant, getAssistantData } = require('../utilities/openAIAssistant');
const isAuthenticated = require('../middlewares/authMiddleware');
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
            instructions: `Please return the message as formatted html code. Please refer to the user as ${req.body.userName}. Please only talk about the topic: ${req.body.skillName};`
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
            res.json({ message: messages.data });
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

/**
 * Create New Item
 *
 * @return response()
 */
router.post('/new-message', isAuthenticated, async (req, res, next) => {
    try {
        const assistantData = await getAssistantData(req.body.userId, req.body.skillUrl);
        console.log(assistantData);
        // if (!req.body.threadId || !req.body.assistantId) {
        //     const newAssistant = await initialAssistant();
        //     const result = await processingNewMessage(newAssistant.thread.id, newAssistant.assistant.id, req.body.messageData);
        //     res.json({ message: result.data, assistant: newAssistant.assistant, thread: newAssistant.thread })
        //     return
        // }
        // const result = await processingNewMessage(req.body.threadId, req.body.assistantId, req.body.messageData);
        // res.json({ message: result.data })
    } catch (error) {
        console.error(error)
        res.status = 500;
        res.json({ mess: 'something went wrong' })
    }
})



// Export the router for app to use.
module.exports = router;
