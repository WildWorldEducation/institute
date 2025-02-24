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
    processingNewSkillMessage,
    initialAssistant,
    getAITutorSkillThread,
    saveAITutorSkillThread,
    getMessagesList,
    // for learning objective AI tutor
    getAITutorLearningObjectiveThread,
    saveAITutorLearningObjectiveThread,
    processingNewLearningObjectiveMessage,
    generateNewLearningObjectiveQuestion
} = require('../utilities/openAIAssistant');
const isAuthenticated = require('../middlewares/authMiddleware');
// Include API key.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Learning objective tutor

/**
 * Get thread from skill level AI tutor
 */
router.get('/messages-list', isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.query.userId;
        const skillUrl = req.query.skillUrl;
        const skillName = req.query.skillName;
        const skillLevel = req.query.skillLevel;

        let assistantData = await getAITutorSkillThread(userId, skillUrl);
        // Handle no assistant data case
        if (assistantData.length === 0) {
            const newAssistant = await initialAssistant(skillName, skillLevel);
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
        const assistantData = await getAITutorSkillThread(
            req.body.userId,
            req.body.skillUrl
        );
        const result = await processingNewSkillMessage(
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

// Learning objective tutor

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

            let assistantData = await getAITutorLearningObjectiveThread(
                userId,
                learningObjectiveId
            );

            // Handle no assistant data case
            if (assistantData.length === 0) {
                const newAssistant = await initialAssistant(
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
                await saveAITutorLearningObjectiveThread(assistantData[0]);
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
        } catch (error) {
            console.error(error);
            res.status = 500;
            res.json({ mess: 'something went wrong' });
        }
    }
);

/**
 * Send message to learning objective level AI tutor (at the moment, only explaining the learning objective)
 */
router.post(
    '/learning-objectives/new-message',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const assistantData = await getAITutorLearningObjectiveThread(
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
 * Send message to learning objective level AI tutor (at the moment, only explaining the learning objective)
 */
router.post(
    '/learning-objectives/ask-question',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const assistantData = await getAITutorLearningObjectiveThread(
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
