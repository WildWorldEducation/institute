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

// Grok (xAI) client — xAI's API is OpenAI-compatible, so we reuse the OpenAI
// SDK pointed at the xAI base URL. Institute reads the SAME key RFab uses
// (GROK_API_KEY, populated from RFab's param store /rfab/prod/GROK_API_KEY into
// the environment), so the credential + model choice stay single-sourced with
// RFab rather than forked into institute. Grok drives the tutors (streaming +
// live web search). The OpenAI client above is kept only for TTS/STT/embeddings,
// which xAI does not provide.
const grokApiKey = process.env.GROK_API_KEY || process.env.RFAB_GROK_API_KEY;
const grok = new OpenAI({
    apiKey: grokApiKey,
    baseURL: process.env.GROK_BASE_URL || 'https://api.x.ai/v1'
});

const models = {
    // Grok tutor model + live-search toggle (matches RFab's GrokProvider).
    grokTutor: process.env.GROK_MODEL || 'grok-4.5-latest',
    grokWebSearch: (process.env.GROK_WEB_SEARCH || 'true') !== 'false',
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

module.exports = { openai, grok, models };
