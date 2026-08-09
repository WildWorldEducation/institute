/*
 * Central AI configuration.
 *
 * One place to control (a) which API key the OpenAI SDK uses and (b) which
 * models each feature runs on. Everything AI-related should import from here
 * instead of instantiating `new OpenAI(...)` or hard-coding model strings.
 *
 * KEYS: institute now bills LLM/TTS/STT usage to the shared RFab key when it is
 * set (RFAB_OPENAI_API_KEY), falling back to the institute's own key
 * (OPENAI_API_KEY) so nothing breaks if the RFab key is absent.
 *
 * MODELS: every model name is env-overridable. The defaults below are the
 * current known-good values; set the *_MODEL env vars to roll the whole app
 * onto a newer model in one place (see .env.example).
 */
const { OpenAI } = require('openai');

// Prefer the shared RFab key; fall back to the institute's own key.
const apiKey = process.env.RFAB_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

const openai = new OpenAI({ apiKey });

const models = {
    // Assistants API tutors (Socratic / assessing / learning-objective).
    tutor: process.env.INSTITUTE_TUTOR_MODEL || 'gpt-4.1',
    // Mastery grading (chat completions).
    grading: process.env.INSTITUTE_GRADING_MODEL || 'gpt-4.1',
    // Essay / image answer marking (chat completions, vision for images).
    marking: process.env.INSTITUTE_MARKING_MODEL || 'gpt-4.1',
    // Skill recommendation / semantic search helpers.
    recommend: process.env.INSTITUTE_RECOMMEND_MODEL || 'gpt-4.1',
    // Embeddings for skill vector search.
    embedding: process.env.INSTITUTE_EMBEDDING_MODEL || 'text-embedding-3-small',
    // Voice.
    tts: process.env.INSTITUTE_TTS_MODEL || 'tts-1',
    ttsVoice: process.env.INSTITUTE_TTS_VOICE || 'alloy',
    stt: process.env.INSTITUTE_STT_MODEL || 'whisper-1'
};

module.exports = { openai, models };
