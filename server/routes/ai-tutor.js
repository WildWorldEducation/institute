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
    skillMessage,
    createAssistant,
    getSkillThread,
    saveAITutorSkillThread,
    getMessagesList,
    // for learning objective AI tutor
    getLearningObjectiveThread,
    saveLearningObjectiveThread,
    processingNewLearningObjectiveMessage,
    generateNewLearningObjectiveQuestion,
    generateQuestion
} = require('../utilities/openAIAssistant');
const isAuthenticated = require('../middlewares/authMiddleware');
// Include API key.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Skill tutor ---------------------

/**
 * Get thread from skill level AI tutor
 */
router.get('/messages-list', isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.query.userId;
        const skillUrl = req.query.skillUrl;
        const skillName = req.query.skillName;
        const skillLevel = req.query.skillLevel;

        let assistantData = await getSkillThread(userId, skillUrl);
        // Create assistant
        if (assistantData.length === 0) {
            const newAssistant = await createAssistant(skillName, skillLevel);
            assistantData = [
                {
                    userId: userId,
                    skillUrl: skillUrl,
                    assistantId: newAssistant.assistant.id,
                    threadId: newAssistant.thread.id
                }
            ];
            await saveAITutorSkillThread(assistantData[0]);
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
 * Send message to skill level AI tutor
 */
router.post('/new-message', isAuthenticated, async (req, res, next) => {
    try {
        const assistantData = await getSkillThread(
            req.body.userId,
            req.body.skillUrl
        );
        const result = await skillMessage(
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
 * Get the AI tutor to ask a question
 */
router.post('/ask-question', isAuthenticated, async (req, res, next) => {
    try {
        const assistantData = await getSkillThread(
            req.body.userId,
            req.body.skillUrl
        );

        const result = await generateQuestion(
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

// Learning objective tutor ------------------

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
            const learningObjective = req.query.learningObjective;
            const skillLevel = req.query.skillLevel;

            let assistantData = await getLearningObjectiveThread(
                userId,
                learningObjectiveId
            );

            // If Open AI assistant has not yet been created for this user + learning objective
            if (assistantData.length === 0) {
                // Create new Open AI assistant.
                const newAssistant = await createAssistant(
                    learningObjective,
                    skillLevel
                );
                assistantData = [
                    {
                        userId: userId,
                        learningObjectiveId: learningObjectiveId,
                        assistantId: newAssistant.assistant.id,
                        threadId: newAssistant.thread.id
                    }
                ];
                // Save the thread info to the DB for later reference.
                await saveLearningObjectiveThread(assistantData[0]);
                // Retrieve the chat history.
                const messages = await getMessagesList(
                    assistantData[0].threadId
                );
                res.json({ messages: messages });
                return;
            } else {
                // Retrieve the chat history.
                const messages = await getMessagesList(
                    assistantData[0].thread_id
                );
                res.json({ messages: messages });
            }
        } catch (error) {
            console.error(error);
            res.status = 500;
            res.json({ mess: 'something went wrong' });
        }
    }
);

/**
 * Send message to learning objective level AI tutor
 */
router.post(
    '/learning-objectives/new-message',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const assistantData = await getLearningObjectiveThread(
                req.body.userId,
                req.body.learningObjectiveId
            );

            const result = await processingNewLearningObjectiveMessage(
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
 * Get the learning objective AI tutor to ask a question
 */
router.post(
    '/learning-objectives/ask-question',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const assistantData = await getLearningObjectiveThread(
                req.body.userId,
                req.body.learningObjectiveId
            );

            const result = await generateNewLearningObjectiveQuestion(
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
