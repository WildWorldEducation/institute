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
const util = require('util');
// node native promisify
// convert callback
const query = util.promisify(conn.query).bind(conn);
const fs = require('fs');
// Import OpenAI package.
const { OpenAI } = require('openai');
const {
    // Shared
    getMessagesList,
    // Socratic tutor
    createSocraticAssistantAndThread,
    getSocraticTutorThread,
    saveSocraticTutorThread,
    socraticTutorMessage,
    // Assessing tutor
    createAssessingAssistantAndThread,
    getAssessingTutorThread,
    saveAssessingTutorThread,
    assessingTutorMessage,
    // Learning objective tutor
    createLearningObjectiveAssistantAndThread,
    getLearningObjectiveThread,
    saveLearningObjectiveThread,
    requestLearningObjectiveTutoring,
    generateLearningObjectiveQuestion,
    // To record user's token usage
    saveTokenUsage,
    getSkillDataByObjectiveId,
    checkIfSkillNeedFileSearch,
    uploadAndPollVectorStores,
    checkAssistantHaveVectorStore,
    injectVectorStoreToAssistant
} = require('../utilities/openAIAssistant');
const { textToSpeech } = require('../utilities/textToSpeech');
const { writeFile, speechToText } = require('../utilities/speechToText');
const isAuthenticated = require('../middlewares/authMiddleware');
const { findSkillByUrl } = require('../utilities/skill-relate-functions');
// Include API key.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Socratic tutor ---------------------
/**
 * Get thread from Socratic AI tutor
 */
router.post(
    '/socratic/messages-list',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const userId = req.body.userId;
            const skillUrl = req.body.skillUrl;
            const skillName = req.body.skillName;
            const skillLevel = req.body.skillLevel;
            const learningObjectives = req.body.learningObjectives;

            let assistantData = await getSocraticTutorThread(userId, skillUrl);
            const isFileSearchSkill = checkIfSkillNeedFileSearch(skillName);

            // Create assistant
            if (assistantData.length === 0) {
                const newAssistant = await createSocraticAssistantAndThread(
                    skillName,
                    skillLevel,
                    learningObjectives,
                    isFileSearchSkill
                );
                assistantData = [
                    {
                        userId: userId,
                        skillUrl: skillUrl,
                        assistantId: newAssistant.assistant.id,
                        threadId: newAssistant.thread.id
                    }
                ];
                await saveSocraticTutorThread(assistantData[0]);
                const messages = await getMessagesList(
                    assistantData[0].threadId
                );
                res.json({
                    messages: messages,
                    assistantData: assistantData[0]
                });
                return;
            } else {
                const messageData = await getMessagesList(
                    assistantData[0].thread_id
                );
                let messages = messageData.data;

                const clientAssistantData = {
                    threadId: assistantData[0].thread_id,
                    assistantId: assistantData[0].assistant_id
                };

                // Reverse the messages to get the index, for the TTS feature
                // (as Open AI returns the most recent message at index 0)
                let reversedMessages = messages.reverse();
                for (let i = 0; i < reversedMessages.length; i++) {
                    reversedMessages[i].index = i;
                }
                messages = reversedMessages.reverse();

                // Skill that require file search feature
                if (isFileSearchSkill) {
                    const myAssistant = await openai.beta.assistants.retrieve(
                        assistantData[0].assistant_id
                    );

                    // check if assistant have required file search data
                    const isAssistantHaveVectorStore =
                        checkAssistantHaveVectorStore(myAssistant);
                    // if assistant does not have vector store we update it
                    if (!isAssistantHaveVectorStore) {
                        await injectVectorStoreToAssistant(
                            assistantData[0].assistant_id
                        );
                    }
                }

                // Check if TTS audio clip has already been generated or not.
                let audioClips = [];
                try {
                    let queryString = `SELECT * 
                FROM ai_socratic_tutor_tts_urls 
                WHERE thread_id = ${conn.escape(assistantData[0].thread_id)};`;

                    audioClips = await query(queryString);

                    for (let i = 0; i < messages.length; i++) {
                        messages[i].hasAudio = false;
                        for (let j = 0; j < audioClips.length; j++) {
                            if (
                                messages[i].index ==
                                audioClips[j].message_number
                            ) {
                                messages[i].hasAudio = true;
                                messages[i].audio = audioClips[j].url;
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                    throw error;
                }

                res.json({
                    messages: messages,
                    assistantData: clientAssistantData
                });
            }
        } catch (error) {
            console.error(error);
            res.status = 500;
            res.json({ mess: 'something went wrong' });
        }
    }
);

/**
 * TTS for Socratic tutor message
 */
router.post(
    '/socratic/generate-tts',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const threadID = req.body.threadID;
            const messageNumber = req.body.messageNumber;
            const message = req.body.message;
            const tutorType = 'socratic';

            let speechClipName = await textToSpeech(
                message,
                threadID,
                messageNumber,
                tutorType
            );

            const url =
                'https://institute-socratic-tutor-tts-urls.s3.us-east-1.amazonaws.com/' +
                speechClipName;

            try {
                let queryString = `INSERT INTO ai_socratic_tutor_tts_urls 
                                (thread_id, message_number, url)
                                VALUES (
                                    ${conn.escape(threadID)},
                                    ${conn.escape(
                    messageNumber
                )},                       
                                    ${conn.escape(url)}
                                );`;
                await query(queryString);
                res.json({
                    status: 'complete',
                    speechUrl: url
                });
            } catch (error) {
                console.error(error);
                res.status = 500;
                res.json({ mess: 'something went wrong' });
                throw error;
            }
        } catch (error) {
            console.error(error);
            res.status = 500;
            res.json({ mess: 'something went wrong' });
        }
    }
);

/**
 * Get thread from Assessing AI tutor
 */
router.post(
    '/assessing/messages-list',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const userId = req.body.userId;
            const skillUrl = req.body.skillUrl;
            const skillName = req.body.skillName;
            const skillLevel = req.body.skillLevel;
            const learningObjectives = req.body.learningObjectives;

            let assistantData = await getAssessingTutorThread(userId, skillUrl);

            const isFileSearchSkill = checkIfSkillNeedFileSearch(skillName);
            // Create assistant
            if (assistantData.length === 0) {
                const newAssistant = await createAssessingAssistantAndThread(
                    skillName,
                    skillLevel,
                    learningObjectives,
                    isFileSearchSkill
                );
                assistantData = [
                    {
                        userId: userId,
                        skillUrl: skillUrl,
                        assistantId: newAssistant.assistant.id,
                        threadId: newAssistant.thread.id
                    }
                ];
                await saveAssessingTutorThread(assistantData[0]);
                const messages = await getMessagesList(
                    assistantData[0].threadId
                );

                res.json({
                    messages: messages,
                    assistantData: assistantData[0]
                });
                return;
            } else {
                const messageData = await getMessagesList(
                    assistantData[0].thread_id
                );

                let messages = messageData.data;

                const clientAssistantData = {
                    threadId: assistantData[0].thread_id,
                    assistantId: assistantData[0].assistant_id
                };

                if (isFileSearchSkill) {
                    const myAssistant = await openai.beta.assistants.retrieve(
                        assistantData[0].assistant_id
                    );
                    // check if assistant have required file search data
                    const isAssistantHaveVectorStore =
                        checkAssistantHaveVectorStore(myAssistant);
                    // if assistant does not have vector store we update it
                    if (!isAssistantHaveVectorStore) {
                        await injectVectorStoreToAssistant(
                            assistantData[0].assistant_id
                        );
                    }
                }

                // Reverse the messages to get the index, for the TTS feature
                // (as Open AI returns the most recent message at index 0)
                let reversedMessages = messages.reverse();
                for (let i = 0; i < reversedMessages.length; i++) {
                    reversedMessages[i].index = i;
                }
                messages = reversedMessages.reverse();

                // Check if TTS audio clip has already been generated or not.
                let audioClips = [];
                try {
                    let queryString = `SELECT * 
                    FROM ai_assessing_tutor_tts_urls 
                    WHERE thread_id = ${conn.escape(
                        assistantData[0].thread_id
                    )};`;

                    audioClips = await query(queryString);

                    for (let i = 0; i < messages.length; i++) {
                        messages[i].hasAudio = false;
                        for (let j = 0; j < audioClips.length; j++) {
                            if (
                                messages[i].index ==
                                audioClips[j].message_number
                            ) {
                                messages[i].hasAudio = true;
                                messages[i].audio = audioClips[j].url;
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                    throw error;
                }

                res.json({
                    messages: messages,
                    assistantData: clientAssistantData
                });
            }
        } catch (error) {
            console.error(error);
            res.status = 500;
            res.json({ mess: 'something went wrong' });
        }
    }
);

/**
 * TTS for Assessing tutor message
 */
router.post(
    '/assessing/generate-tts',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const threadID = req.body.threadID;
            const messageNumber = req.body.messageNumber;
            const message = req.body.message;
            const tutorType = 'assessing';

            let speechClipName = await textToSpeech(
                message,
                threadID,
                messageNumber,
                tutorType
            );

            const url =
                'https://institute-assessing-tutor-tts-urls.s3.us-east-1.amazonaws.com/' +
                speechClipName;

            try {
                let queryString = `INSERT INTO ai_assessing_tutor_tts_urls 
                                (thread_id, message_number, url)
                                VALUES (
                                    ${conn.escape(threadID)},
                                    ${conn.escape(
                    messageNumber
                )},                       
                                    ${conn.escape(url)}
                                );`;
                await query(queryString);
                res.json({
                    status: 'complete',
                    speechUrl: url,
                });
            } catch (error) {
                console.error(error);
                res.status = 500;
                res.json({ mess: 'something went wrong' });
                throw error;
            }
        } catch (error) {
            console.error(error);
            res.status = 500;
            res.json({ mess: 'something went wrong' });
        }
    }
);

/**
 * AI tutor automatically assess
 */
router.post('/assessing/assess', isAuthenticated, async (req, res, next) => {
    try {
        const userId = req.session.userId;

        let transcriptForAssessment = JSON.stringify(
            req.body.transcriptForAssessment
        );

        let prompt = `Please review the following conversation between an examiner and a student: ${transcriptForAssessment}.
                    
                    The examiner is asking the student questions, while the student is trying to answer them.
                    Determine what percentage of the questions the student answered correctly.
                    Bear in mind that the student is being examined at the following level:
                    ${req.body.skillLevel}.
                    
                    The subject that the student is being examined on is ${req.body.skillName},
                    which consists of the following learning objectives: ${req.body.learningObjectives}.
                    
                    Please return only the percentage of correct answers, and nothing else.
                    Please return a single JSON object containing the result, named "result".                    
                    `;

        const completion = await openai.chat.completions.create({
            model: 'gpt-4.5-preview',
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: 'You are a helpful assistant.' },
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });

        // Save the user's token usage
        let tokenCount = completion.usage.total_tokens;
        saveTokenUsage(userId, tokenCount);

        let responseJSON = completion.choices[0].message.content;
        // Convert string to object.       ;
        let result = JSON.parse(responseJSON);
        res.json({
            result: result
        });
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
    '/learning-objective/messages-list',
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

            let skillData = await getSkillDataByObjectiveId(
                learningObjectiveId
            );
            const isFileSearchSkill = checkIfSkillNeedFileSearch(
                skillData.name
            );

            // If Open AI assistant has not yet been created for this user + learning objective
            if (assistantData.length === 0) {
                // Create new Open AI assistant.
                const newAssistant =
                    await createLearningObjectiveAssistantAndThread(
                        learningObjective,
                        skillLevel,
                        isFileSearchSkill
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
                const messageData = await getMessagesList(
                    assistantData[0].threadId
                );
                let messages = messageData.data;

                res.json({
                    messages: messages,
                    assistantData: assistantData[0]
                });
                return;
            } else {
                // Retrieve the chat history.
                const messageData = await getMessagesList(
                    assistantData[0].thread_id
                );

                if (isFileSearchSkill) {
                    const myAssistant = await openai.beta.assistants.retrieve(
                        assistantData[0].assistant_id
                    );
                    // check if assistant have required file search data
                    const isAssistantHaveVectorStore =
                        checkAssistantHaveVectorStore(myAssistant);
                    // if assistant does not have vector store we update it
                    if (!isAssistantHaveVectorStore) {
                        await injectVectorStoreToAssistant(
                            assistantData[0].assistant_id
                        );
                    }
                }

                let messages = messageData.data;

                // Reverse the messages to get the index, for the TTS feature
                // (as Open AI returns the most recent message at index 0)
                let reversedMessages = messages.reverse();
                for (let i = 0; i < reversedMessages.length; i++) {
                    reversedMessages[i].index = i;
                }
                messages = reversedMessages.reverse();

                // Check if TTS audio clip has already been generated or not.
                let audioClips = [];
                try {
                    let queryString = `SELECT * 
                    FROM ai_learning_objective_tutor_tts_urls 
                    WHERE thread_id = ${conn.escape(
                        assistantData[0].thread_id
                    )};`;

                    audioClips = await query(queryString);

                    for (let i = 0; i < messages.length; i++) {
                        messages[i].hasAudio = false;
                        for (let j = 0; j < audioClips.length; j++) {
                            if (
                                messages[i].index ==
                                audioClips[j].message_number
                            ) {
                                messages[i].hasAudio = true;
                                messages[i].audio = audioClips[j].url;
                            }
                        }
                    }
                } catch (error) {
                    console.error(error);
                    throw error;
                }

                const assistantDataForClient = {
                    assistantId: assistantData[0].assistant_id,
                    threadId: assistantData[0].thread_id
                };
                res.json({
                    messages: messages,
                    assistantData: assistantDataForClient
                });
            }
        } catch (error) {
            console.error(error);
            res.status = 500;
            res.json({ mess: 'something went wrong' });
        }
    }
);

/**
 * TTS for Learning objectives tutor message
 */
router.post(
    '/learning-objective/generate-tts',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const threadID = req.body.threadID;
            const messageNumber = req.body.messageNumber;
            const message = req.body.message;
            const tutorType = 'learning-objective';

            let speechClipName = await textToSpeech(
                message,
                threadID,
                messageNumber,
                tutorType
            );

            const url =
                'https://institute-learning-objective-tutor-tts-urls.s3.us-east-1.amazonaws.com/' +
                speechClipName;

            try {
                let queryString = `INSERT INTO ai_learning_objective_tutor_tts_urls 
                                (thread_id, message_number, url)
                                VALUES (
                                    ${conn.escape(threadID)},
                                    ${conn.escape(
                    messageNumber
                )},                       
                                    ${conn.escape(url)}
                                );`;
                await query(queryString);
                res.json({
                    status: 'complete',
                    speechUrl: url
                });
            } catch (error) {
                console.error(error);
                res.status = 500;
                res.json({ mess: 'something went wrong' });
                throw error;
            }
        } catch (error) {
            console.error(error);
            res.status = 500;
            res.json({ mess: 'something went wrong' });
        }
    }
);

/**
 * Get the learning objective AI tutor to tutor on that learning objective
 */
router.post(
    '/learning-objective/request-tutoring',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const assistantData = await getLearningObjectiveThread(
                req.body.userId,
                req.body.learningObjectiveId
            );

            await requestLearningObjectiveTutoring(
                assistantData[0].thread_id,
                assistantData[0].assistant_id,
                req.body
            );

            res.end();
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
    '/learning-objective/ask-question',
    isAuthenticated,
    async (req, res, next) => {
        try {
            const assistantData = await getLearningObjectiveThread(
                req.body.userId,
                req.body.learningObjectiveId
            );

            await generateLearningObjectiveQuestion(
                assistantData[0].thread_id,
                assistantData[0].assistant_id,
                req.body
            );

            res.end();
        } catch (error) {
            console.error(error);
            res.status = 500;
            res.json({ mess: 'something went wrong' });
        }
    }
);

/**
 * STT (Speech to Text) for tutors
 */
router.post('/stt/convert', async (req, res, next) => {
    // prepare variables
    const userId = req.session.userId;
    const skillUrl = req.body.skillUrl;
    const skillName = req.body.skillName;
    const skillLevel = req.body.skillLevel;
    const learningObjectives = req.body.learningObjectives;
    const audioData = req.body.audioData;
    const tutorType = req.body.tutorType;

    // Convert Base64 to buffer
    let bufferObj = Buffer.from(
        audioData.replace('data:audio/webm; codecs=opus;base64,', ''),
        'base64'
    );

    // Generate unique filename
    function makeName(length) {
        let result = '';
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        let counter = 0;
        while (counter < length) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength)
            );
            counter += 1;
        }
        return result;
    }
    let uniqueName = makeName(10);
    let filePath =
        './public/audio/tempSpeechRecordings/' + uniqueName + '.webm';

    await writeFile(filePath, bufferObj);

    let messageObject = await speechToText(filePath);
    let message = messageObject.text;
    //console.log(message);

    if (tutorType == 'socratic')
        await sendSpeechToSocraticAI(
            userId,
            skillUrl,
            skillName,
            skillLevel,
            learningObjectives,
            message
        );
    else if (tutorType == 'assessing')
        await sendSpeechToAssessingAI(
            userId,
            skillUrl,
            skillName,
            skillLevel,
            learningObjectives,
            message
        );

    //console.log('res.end()');

    res.end();
});

// crete new vector store (NEED TO CHANGE FROM GET TO POST LATER)
router.get('/new-vector-store', async (req, res, next) => {
    const vectorStore = await uploadAndPollVectorStores();
    res.json(vectorStore);
});

async function sendSpeechToSocraticAI(
    userId,
    skillUrl,
    skillName,
    skillLevel,
    learningObjectives,
    message
) {
    try {
        //console.log('get thread');
        const assistantData = await getSocraticTutorThread(userId, skillUrl);

        let messageData = {
            userId: userId,
            skillName: skillName,
            skillLevel: skillLevel,
            learningObjectives: learningObjectives,
            message: message
        };

        //console.log('send message');
        await socraticTutorMessage(
            assistantData[0].thread_id,
            assistantData[0].assistant_id,
            messageData
        );
    } catch (error) {
        console.error(error);
    }
}

async function sendSpeechToAssessingAI(
    userId,
    skillUrl,
    skillName,
    skillLevel,
    learningObjectives,
    message
) {
    try {
        const assistantData = await getAssessingTutorThread(userId, skillUrl);

        let messageData = {
            userId: userId,
            skillName: skillName,
            skillLevel: skillLevel,
            learningObjectives: learningObjectives,
            message
        };

        await assessingTutorMessage(
            assistantData[0].thread_id,
            assistantData[0].assistant_id,
            messageData
        );
    } catch (error) {
        console.error(error);
    }
}

// Export the router for app to use.
module.exports = router;
