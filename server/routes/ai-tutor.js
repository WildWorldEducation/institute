/*------------------------------------------
--------------------------------------------
Middleware.
--------------------------------------------
--------------------------------------------*/
const express = require('express');
// Router.
const router = express.Router();

// Database connection
const conn = require('../config/db');

// Import OpenAI package.
const { OpenAI } = require('openai');
const {
    processingNewMessage,
    initialAssistant,
    getAssistantData,
    saveAssistantData,
    getMessagesList,
    getAssistantLearningObjectiveData,
    saveAssistantLearningObjectiveData,
    processingNewLearningObjectiveExplanation
} = require('../utilities/openAIAssistant');
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
            res.json({ message: messages.data });
        } else {
            console.log(run.status);
            res.status = 500;
            res.json({ mess: 'fails! run status: ' + run.status });
        }
    } else {
        res.redirect('/login');
    }
});

/**
 * Create New Item
 *
 * @return response()
 */
router.post('/new-message', isAuthenticated, async (req, res, next) => {
    try {
        const assistantData = await getAssistantData(
            req.body.userId,
            req.body.skillUrl
        );
        const result = await processingNewMessage(
            assistantData[0].thread_id,
            assistantData[0].assistant_id,
            req.body
        );
        res.json({ message: result });
    } catch (error) {
        console.error(error);
        res.status = 500;
        res.json({ mess: 'something went wrong' });
    }
});

router.get('/messages-list', isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.query.userId;
        const skillUrl = req.query.skillUrl;
        let assistantData = await getAssistantData(userId, skillUrl);
        // Handle no assistant data case
        if (assistantData.length === 0) {
            const newAssistant = await initialAssistant();
            assistantData = [
                {
                    userId: userId,
                    skillUrl: skillUrl,
                    assistantId: newAssistant.assistant.id,
                    threadId: newAssistant.thread.id
                }
            ];
            await saveAssistantData(assistantData[0]);
            const messages = await getMessagesList(assistantData[0].threadId);
            res.json({ messages: messages });
            return;
        } else {
            const messages = await getMessagesList(assistantData[0].thread_id);
            res.json({ messages: messages });
        }
    } catch (error) {
        console.error(error);
        res.status = 500;
        res.json({ mess: 'something went wrong' });
    }
});

/**
 * Explain learning objective
 */
router.post(
    '/explain-learning-objective',
    isAuthenticated,
    async (req, res, next) => {
        let learningObjective = req.body.learningObjective;

        try {
            const assistantData = await getAssistantLearningObjectiveData(
                req.body.userId,
                req.body.learningObjective
            );

            // Create an Assistant
            const assistant = await openai.beta.assistants.create({
                name: 'General Tutor',
                instructions:
                    'You are a personal tutor. Explain the topic please.',
                tools: [],
                model: 'gpt-4o'
            });

            // Create a Thread
            const thread = await openai.beta.threads.create();

            // Add a message to the Thread
            const message = await openai.beta.threads.messages.create(
                thread.id,
                {
                    role: 'user',
                    content: learningObjective
                }
            );

            let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
                assistant_id: assistant.id,
                instructions: `                
                Do not include the content as the header of the response document.
                Do not provide an introduction.
                Do not repeat the question.
                `
            });

            if (run.status === 'completed') {
                const messages = await openai.beta.threads.messages.list(
                    run.thread_id
                );

                res.json({ message: messages.data });
            } else {
                console.log(run.status);
                res.status = 500;
                res.json({ mess: 'fails! run status: ' + run.status });
            }
        } catch (error) {
            console.error(error);
            res.status = 500;
            res.json({ mess: 'something went wrong' });
        }
    }
);

router.get(
    '/learning-objectives/messages-list',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const userId = req.query.userId;
            const learningObjectiveId = req.query.learningObjectiveId;
            // let assistantData = await getAssistantLearningObjectiveData(
            //     userId,
            //     learningObjectiveId
            // );

            let queryString = `SELECT * 
                           FROM user_learning_objective_assistant_messages
                           WHERE user_id = ${conn.escape(
                               userId
                           )} AND learning_objective_id = ${conn.escape(
                learningObjectiveId
            )}`;
            conn.query(queryString, async (err, result) => {
                try {
                    if (err) {
                        throw err;
                    }

                    let assistantData = result;
                    // Handle no assistant data case
                    if (assistantData.length === 0) {
                        const newAssistant = await initialAssistant();
                        assistantData = [
                            {
                                userId: userId,
                                learningObjectiveId: learningObjectiveId,
                                assistantId: newAssistant.assistant.id,
                                threadId: newAssistant.thread.id
                            }
                        ];
                        await saveAssistantLearningObjectiveData(
                            assistantData[0]
                        );
                        const messages = await getMessagesList(
                            assistantData[0].threadId
                        );
                        res.json({ messages: messages });
                        return;
                    } else {
                        const messages = await getMessagesList(
                            assistantData[0].thread_id
                        );
                        res.json({ messages: messages });
                    }
                } catch (err) {
                    next(err);
                }
            });

            //  const result = await query(queryString);
        } catch (error) {
            console.error(error);
            res.status = 500;
            res.json({ mess: 'something went wrong' });
        }
    }
);

router.post(
    '/learning-objectives/new-message',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const assistantData = await getAssistantLearningObjectiveData(
                req.body.userId,
                req.body.learningObjectiveId
            );

            const result = await processingNewLearningObjectiveExplanation(
                assistantData[0].thread_id,
                assistantData[0].assistant_id,
                req.body
            );

            res.json({ message: result });
        } catch (error) {
            console.error(error);
            res.status = 500;
            res.json({ mess: 'something went wrong' });
        }
    }
);

// Export the router for app to use.
module.exports = router;
