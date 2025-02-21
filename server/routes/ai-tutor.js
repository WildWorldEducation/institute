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
    // for learning objective AI tutor
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
 * Send message to skill level AI tutor
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

/**
 * Get thread from skill level AI tutor
 */
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
 * Send message to learning objective level AI tutor (at the moment, only explaining the learning objective)
 */
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

/**
 * Get thread from learning objective level AI tutor
 */
router.get(
    '/learning-objectives/messages-list',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const userId = req.query.userId;
            const learningObjectiveId = req.query.learningObjectiveId;

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
        } catch (error) {
            console.error(error);
            res.status = 500;
            res.json({ mess: 'something went wrong' });
        }
    }
);

// Export the router for app to use.
module.exports = router;
