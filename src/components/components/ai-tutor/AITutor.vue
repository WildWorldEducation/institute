<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import { useUserSkillsStore } from '../../../stores/UserSkillsStore.js';
import { useSkillTreeStore } from '../../../stores/SkillTreeStore.js';
import TutorLoadingSymbol from './tutorLoadingSymbol.vue';
import TooltipBtn from './../share-components/TooltipBtn.vue';
import SpeechRecorder from './SpeechRecorder.vue';
import { socket, socketState } from '../../../socket.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const userSkillsStore = useUserSkillsStore();
        const skillTreeStore = useSkillTreeStore();
        const stateOfSocket = socketState;
        return {
            stateOfSocket,
            userDetailsStore,
            userSkillsStore,
            skillTreeStore
        };
    },
    props: [
        'skill',
        'showTutorialTip7',
        'showTutorialTip8',
        'showTutorialTip9'
    ],
    emits: ['progressTutorial'],
    components: { TutorLoadingSymbol, TooltipBtn, SpeechRecorder },
    data() {
        return {
            message: '',
            socraticTutorChatHistory: [],
            assessingTutorChatHistory: [],
            transcriptForAssessment: [],
            chatHistory: [],
            waitForAIresponse: false,
            mode: 'big',
            englishSkillLevel: '',
            learningObjectives: [],
            tutorType: 'socratic',
            // hide / show chat
            showChat: true,
            isTextToSpeech: true,
            threadID: '',
            audio: null,
            isAudioPlaying: false,
            isSuggestedInteraction: false,
            assistantData: {
                assistantId: null,
                threadId: null
            }
        };
    },
    async created() {
        this.connectToSocketSever();
    },

    async mounted() {
        this.learningObjectives = this.skill.learningObjectives.map(
            (a) => a.objective
        );

        this.englishSkillLevel = this.skill.level.replace('_', ' ');
        await this.getChatHistory();
    },
    // updated() {
    //     if (this.mode !== 'hide') {
    //         this.scrollToMessageInput();
    //     }
    // },
    methods: {
        // Setting this method to allow the user to be able to create a new line with shift+enter
        handleKeyDown(e) {
            if (e.shiftKey || this.$parent.isAITokenLimitReached) {
                return;
            }
            e.preventDefault();
            this.sendMessage();
        },
        // 2 different threads
        async changeTutorType(type) {
            this.tutorType = type;

            await this.getChatHistory();

            if (type == 'socratic')
                this.chatHistory = this.socraticTutorChatHistory;
            else if (type == 'assessing') {
                this.chatHistory = this.assessingTutorChatHistory;
            }

            console.log(this.chatHistory);
        },
        // For both tutors
        async getChatHistory() {
            try {
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: this.userDetailsStore.userId,
                        skillName: this.skill.name,
                        skillUrl: this.skill.url,
                        skillLevel: this.englishSkillLevel,
                        learningObjectives: this.learningObjectives
                    })
                };

                let url = '';
                if (this.tutorType == 'socratic') {
                    url = `/ai-tutor/socratic/messages-list`;
                } else if (this.tutorType == 'assessing') {
                    url = `/ai-tutor/assessing/messages-list`;
                }

                const response = await fetch(url, requestOptions);
                const resData = await response.json();

                this.assistantData.assistantId =
                    resData.assistantData.assistantId;
                this.assistantData.threadId = resData.assistantData.threadId;

                if (this.tutorType == 'socratic') {
                    this.socraticTutorChatHistory = resData.messages;
                    this.chatHistory = this.socraticTutorChatHistory;
                } else if (this.tutorType == 'assessing') {
                    this.assessingTutorChatHistory = resData.messages;
                    this.chatHistory = this.assessingTutorChatHistory;
                    if (
                        this.chatHistory.length >=
                        this.learningObjectives.length * 2
                    ) {
                        this.assessMastery();
                    }
                }

                if (this.chatHistory.length > 0) {
                    this.threadID = this.chatHistory[0].thread_id;
                }

                this.$parent.checkTokenUsage();
            } catch (error) {
                console.error(error);
            }
        },
        async generateAudio(index, message) {
            // Loading animation on
            for (let i = 0; i < this.chatHistory.length; i++) {
                if (this.chatHistory[i].index == index) {
                    this.chatHistory[i].isAudioGenerating = true;
                }
            }

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    messageNumber: index,
                    threadID: this.threadID
                })
            };

            let url = '';
            if (this.tutorType == 'socratic')
                url = `/ai-tutor/socratic/generate-tts`;
            else url = `/ai-tutor/assessing/generate-tts`;

            const response = await fetch(url, requestOptions);
            const resData = await response.json();

            // Loading animation off
            for (let i = 0; i < this.chatHistory.length; i++) {
                if (this.chatHistory[i].index == index) {
                    this.chatHistory[i].isAudioGenerating = false;
                    this.chatHistory[i].hasAudio = true;
                }
            }
            this.getChatHistory();
        },
        playAudio(index) {
            if (this.isAudioPlaying == true) {
                this.isAudioPlaying = false;
                this.audio.pause();
            } else {
                let url = `https://institute-${this.tutorType}-tutor-tts-urls.s3.us-east-1.amazonaws.com/${this.threadID}-${index}.mp3`;
                this.audio = new Audio(url);
                this.isAudioPlaying = true;
                this.audio.play();
            }
        },
        async sendMessage() {
            if (this.waitForAIresponse) {
                return;
            }

            // If the message is empty, the AI will ask a question.
            function isEmptyOrSpaces(message) {
                return message === null || message.match(/^ *$/) !== null;
            }
            if (isEmptyOrSpaces(this.message)) {
                this.askQuestion();
                return;
            }

            this.waitForAIresponse = true;

            try {
                // Define assistant instructions
                let responseLength = '';
                // regular responses should be short
                if (this.isSuggestedInteraction == false) {
                    responseLength = 'Please keep all responses succinct.';
                }
                // reset the variable
                this.isSuggestedInteraction = false;
                let socketChannel = 'new-message';

                // Add the student's message to the chat on screen.
                const userMessage = {
                    role: 'user',
                    content: [{ text: { value: this.message } }]
                };

                if (typeof this.chatHistory.length == 'undefined') {
                    this.chatHistory = [];
                    this.chatHistory.push(userMessage);
                } else this.chatHistory.unshift(userMessage);

                const messageData = {
                    threadId: this.assistantData.threadId,
                    assistantId: this.assistantData.assistantId,
                    tutorType: this.tutorType,
                    skillName: this.skill.name,
                    skillLevel: this.skillLevel,
                    learningObjectives: this.learningObjectives,
                    responseLength: responseLength,
                    // The message from the student
                    message: this.message,
                    userId: this.userDetailsStore.userId
                };
                this.message = '';
                socket.emit(socketChannel, messageData);
            } catch (error) {
                console.error(error);
                this.waitForAIresponse = false;
            }
        },
        async askQuestion() {
            if (this.waitForAIresponse) {
                return;
            }
            this.waitForAIresponse = true;
            try {
                let socketChannel = 'ask-question';

                const messageData = {
                    tutorType: this.tutorType,
                    skillLevel: this.skill.level,
                    learningObjectives: this.learningObjectives,
                    threadId: this.assistantData.threadId,
                    assistantId: this.assistantData.assistantId,
                    message: '',
                    userId: this.userDetailsStore.userId
                };

                socket.emit(socketChannel, messageData);
                this.message = '';
            } catch (error) {
                console.error(error);
                this.waitForAIresponse = false;
            }
        },
        async assessMastery() {
            for (let i = 0; i < this.assessingTutorChatHistory.length; i++) {
                let chat = this.assessingTutorChatHistory[i];
                // AI question
                if (chat.role == 'assistant') {
                    let question = chat.content[0].text.value;
                    let transcriptItem = {
                        examiner: question
                    };
                    this.transcriptForAssessment.push(transcriptItem);
                }
                // Student answer
                else if (chat.role == 'user') {
                    let answer = chat.content[0].text.value;
                    let transcriptItem = {
                        student: answer
                    };
                    this.transcriptForAssessment.push(transcriptItem);
                }
            }
            this.transcriptForAssessment =
                this.transcriptForAssessment.reverse();

            try {
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: this.userDetailsStore.userId,
                        skillName: this.skill.name,
                        skillUrl: this.skill.url,
                        skillLevel: this.englishSkillLevel,
                        learningObjectives: this.learningObjectives,
                        transcriptForAssessment: this.transcriptForAssessment
                    })
                };

                const url = '/ai-tutor/assessing/assess';

                const res = await fetch(url, requestOptions);
                if (res.status === 500) {
                    return;
                }

                const response = await res.json();
                let result = response.result.result;
                if (result >= 70) {
                    this.makeMastered();
                }

                this.waitForAIresponse = false;
            } catch (error) {
                console.error(error);
                this.waitForAIresponse = false;
            }
        },
        // Format the response.
        applyMarkDownFormatting(string) {
            const md = window
                .markdownit({
                    breaks: true
                })
                .use(window.texmath, {
                    engine: katex,
                    delimiters: ['brackets', 'dollars'],
                    katexOptions: { macros: { '\\RR': '\\mathbb{R}' } }
                });

            let formattedMessage = md.render(string);
            return formattedMessage;
        },
        scrollToMessageInput() {
            let inputMessage = this.$refs.messageInputDiv;
            inputMessage.scrollTop = inputMessage.scrollHeight;
        },
        // smoothScrollToMessageInput() {
        //     let inputMessage = this.$refs.messageInputDiv;
        //     inputMessage.scrollIntoView({ behavior: 'smooth' });
        // },
        async makeMastered() {
            alert('Congratulations, you have mastered this skill!');
            await this.userSkillsStore.MakeMastered(
                this.userDetailsStore.userId,
                this.skill
            );
        },
        // Streaming
        connectToSocketSever() {
            socket.connect();
        },
        disconnectToSocketSever() {
            console.log('disconnect');
            socket.disconnect();
        },
        createChatStream() {
            console.log('create-stream');
            socket.emit(
                'create-stream',
                this.userDetailsStore.userId,
                this.skill.id,
                this.skill.name,
                this.skill.level,
                this.skill.url,
                (val) => {}
            );
        },
        removeStreamMessage() {
            // We dont want this to be watched and added to the chat history.
            socketState.streamType = 'pause';
            socketState.streamingMessage = '';
        }
    },
    watch: {
        stateOfSocket: {
            async handler(newItem, oldItem) {
                if (newItem.streamType !== 'aiTutor') {
                    return;
                }
                if (newItem.isStreaming) {
                    this.waitForAIresponse = false;
                }
                if (!newItem.isStreaming && newItem.isRunJustEnded) {
                    const assistantMessage = {
                        role: 'assistant',
                        content: [
                            {
                                text: {
                                    value: this.stateOfSocket.streamingMessage
                                },
                                type: 'text'
                            }
                        ]
                    };

                    this.removeStreamMessage();

                    if (typeof this.chatHistory.length == 'undefined') {
                        this.chatHistory = [];
                        this.chatHistory.push(assistantMessage);
                    } else this.chatHistory.unshift(assistantMessage);

                    // Reverse the messages to get the index, for the TTS feature
                    // (as Open AI returns the most recent message at index 0)
                    let reversedMessages = this.chatHistory.reverse();
                    for (let i = 0; i < reversedMessages.length; i++) {
                        reversedMessages[i].index = i;
                    }
                    this.chatHistory = reversedMessages.reverse();
                    this.getChatHistory();
                }
            },
            deep: true
        }
    }
};
</script>

<template>
    <div
        v-if="mode !== 'hide'"
        :class="{
            'container mt-3': mode === 'big',
            'minimize-chat-container': mode === 'mini'
        }"
    >
        <!-- Heading, tooltip and minimise/maximise buttons -->
        <div
            class="d-flex flex-column flex-md-row gap-2 align-items-baseline mb-1"
        >
            <div class="d-flex flex-row w-100 justify-content-between">
                <div class="d-flex gap-2">
                    <!-- Pin button -->
                    <button
                        v-if="mode === 'big'"
                        class="btn"
                        title="Minimize and pin the chat"
                        b-tooltip.hover
                        @click="mode = 'mini'"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 384 512"
                            class="primary-icon"
                            width="17"
                            height="17"
                        >
                            <path
                                d="M32 32C32 14.3 46.3 0 64 0L320 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-29.5 0 11.4 148.2c36.7 19.9 65.7 53.2 79.5 94.7l1 3c3.3 9.8 1.6 20.5-4.4 28.8s-15.7 13.3-26 13.3L32 352c-10.3 0-19.9-4.9-26-13.3s-7.7-19.1-4.4-28.8l1-3c13.8-41.5 42.8-74.8 79.5-94.7L93.5 64 64 64C46.3 64 32 49.7 32 32zM160 384l64 0 0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96z"
                            />
                        </svg>
                    </button>
                    <h2 class="secondary-heading">AI tutor</h2>

                    <TooltipBtn
                        v-if="mode === 'big'"
                        class="d-none d-md-block"
                        toolTipText="Press the 'generate audio' button to hear the tutor speak with AI generated speech."
                        bubbleWidth="350px"
                        trianglePosition="left"
                        absoluteTop="37px"
                    />
                    <!-- Mobile tooltip has smaller width -->
                    <TooltipBtn
                        v-if="mode === 'big'"
                        class="d-md-none"
                        toolTipText="Chat with ours AI Tutor about the subjects"
                        bubbleWidth="100px"
                        trianglePosition="left"
                        absoluteTop="37px"
                    />
                </div>

                <!-- Expand button -->
                <div class="d-flex gap-2">
                    <div tile="Expand chat component" b-tooltip.hover>
                        <button
                            v-if="mode === 'mini'"
                            class="symbol-btn"
                            @click="mode = 'big'"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                height="25"
                                width="25"
                                fill="#5f31dd"
                            >
                                <path
                                    d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm11.3-395.3l112 112c4.6 4.6 5.9 11.5 3.5 17.4s-8.3 9.9-14.8 9.9l-64 0 0 96c0 17.7-14.3 32-32 32l-32 0c-17.7 0-32-14.3-32-32l0-96-64 0c-6.5 0-12.3-3.9-14.8-9.9s-1.1-12.9 3.5-17.4l112-112c6.2-6.2 16.4-6.2 22.6 0z"
                                />
                            </svg>
                        </button>
                    </div>
                    <div tile="Hide chat component" b-tooltip.hover>
                        <button
                            v-if="mode === 'mini'"
                            class="symbol-btn"
                            @click="mode = 'hide'"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                fill="#5f31dd"
                                height="25"
                                width="25"
                            >
                                <path
                                    d="M256 0a256 256 0 1 0 0 512A256 256 0 1 0 256 0zM244.7 395.3l-112-112c-4.6-4.6-5.9-11.5-3.5-17.4s8.3-9.9 14.8-9.9l64 0 0-96c0-17.7 14.3-32 32-32l32 0c17.7 0 32 14.3 32 32l0 96 64 0c6.5 0 12.3 3.9 14.8 9.9s1.1 12.9-3.5 17.4l-112 112c-6.2 6.2-16.4 6.2-22.6 0z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <!-- AI Tutor Tooltip -->
        <div
            v-if="userDetailsStore.role == 'student' && showTutorialTip7"
            class="tool-tip-base d-flex justify-content-start"
        >
            <div class="explain-tool-tip hovering-info-panel triangle-top-left">
                <div class="tool-tip-text">
                    <p>
                        The AI Tutor is here to help you master this skill
                        through personalized assistance. You can ask questions,
                        receive explanations, practice concepts, or get guidance
                        at any time during your learning journey.
                    </p>
                    <button
                        class="btn primary-btn"
                        @click="$emit('progressTutorial', 7)"
                    >
                        next
                    </button>
                </div>
            </div>
        </div>

        <!--Tutor types -->
        <span v-if="mode === 'big'" class="d-flex justify-content-between">
            <!--Tutor types -->
            <span>
                <!-- Socratic Tutor agent -->
                <div class="d-inline-block">
                    <button
                        class="btn suggested-interactions ms-1 socratic-btn"
                        :class="{ underline: tutorType === 'socratic' }"
                        @click="changeTutorType('socratic')"
                    >
                        Socratic Tutor
                    </button>

                    <!-- Socratic Tutor Tooltip -->
                    <div
                        v-if="
                            userDetailsStore.role == 'student' &&
                            showTutorialTip8
                        "
                    >
                        <div
                            class="explain-tool-tip hovering-info-panel triangle-top-left"
                        >
                            <div class="tool-tip-text">
                                <p>
                                    The Socratic Tutor helps you learn through
                                    guided questioning. It encourages critical
                                    thinking by asking you questions that lead
                                    you to discover answers yourself, helping
                                    build deeper understanding of concepts.
                                </p>
                                <button
                                    class="btn primary-btn"
                                    @click="$emit('progressTutorial', 8)"
                                >
                                    next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Exam Agent: assesses student -->
                <div class="d-inline-block">
                    <button
                        class="btn suggested-interactions ms-1 assessing-btn"
                        :class="{ underline: tutorType === 'assessing' }"
                        @click="changeTutorType('assessing')"
                    >
                        Assessment Tutor
                    </button>

                    <!-- Assessment Tutor Tooltip  -->
                    <div
                        v-if="
                            userDetailsStore.role == 'student' &&
                            showTutorialTip9
                        "
                    >
                        <div
                            class="explain-tool-tip hovering-info-panel triangle-top-left"
                        >
                            <div class="tool-tip-text">
                                <p>
                                    The Assessment Tutor will judge whether or
                                    not you have mastered this skill.
                                </p>
                                <button
                                    class="btn primary-btn"
                                    @click="$emit('progressTutorial', 9)"
                                >
                                    next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </span>
            <span class="d-flex">
                <!-- For speech to text -->
                <SpeechRecorder
                    v-if="mode == 'big'"
                    :tutorType="tutorType"
                    :skill="skill"
                    :skillLevel="englishSkillLevel"
                    :learningObjectives="learningObjectives"
                    :isAITokenLimitReached="$parent.isAITokenLimitReached"
                />
                <!-- Toggle chat button -->
                <button class="btn plus-btn ms-1" @click="showChat = !showChat">
                    <svg
                        v-if="!showChat"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        width="18"
                        height="18"
                    >
                        <!-- SVG path for plus icon -->
                        <path
                            d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"
                        />
                    </svg>
                    <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        width="18"
                        height="18"
                    >
                        <!-- SVG path for minus icon -->
                        <path
                            d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                        />
                    </svg>
                </button>
            </span>
        </span>
        <!-- User input (big mode) -->
        <div class="d-flex mt-1" v-if="mode === 'big'">
            <textarea
                ref="messageInput"
                class="chat-text-area rounded border border-dark me-1"
                v-model="message"
                type="text"
                @keydown.enter="handleKeyDown"
            >
            </textarea>
            <!-- Send button -->
            <div
                b-tooltip.hover
                tile="send message"
                class="d-flex flex-row-reverse"
            >
                <button
                    class="btn send-btn"
                    :class="{
                        'socratic-btn': tutorType === 'socratic',
                        'assessing-btn': tutorType === 'assessing'
                    }"
                    @click="sendMessage()"
                    :disabled="$parent.isAITokenLimitReached"
                >
                    <!-- Speech bubble icon -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="18"
                        height="18"
                        fill="white"
                    >
                        <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                        <path
                            d="M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3c0 0 0 0 0 0c0 0 0 0 0 0s0 0 0 0s0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM128 208a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm96 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                        />
                    </svg>
                </button>
            </div>
        </div>
        <!-- Tutor loading animation -->
        <div class="ai-tutor-processing mt-1" v-if="waitForAIresponse">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 512"
                width="18"
                height="18"
                fill="black"
            >
                <path
                    d="M320 0c17.7 0 32 14.3 32 32l0 64 120 0c39.8 0 72 32.2 72 72l0 272c0 39.8-32.2 72-72 72l-304 0c-39.8 0-72-32.2-72-72l0-272c0-39.8 32.2-72 72-72l120 0 0-64c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224l16 0 0 192-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0-192 16 0z"
                />
            </svg>
            Thinking
            <TutorLoadingSymbol />
        </div>
        <!-- Suggested Interactions -->
        <span
            class="d-flex flex-row suggested-interactions-wrapper mt-1 mb-1"
            v-if="tutorType === 'socratic'"
        >
            <button
                class="btn suggested-interactions ms-1 socratic-btn-dark"
                @click="
                    this.message =
                        'Tell me something interesting about this subject!';
                    this.isSuggestedInteraction = true;
                    sendMessage();
                "
                :disabled="$parent.isAITokenLimitReached"
            >
                Tell me something interesting about this subject!
            </button>
            <button
                class="btn suggested-interactions ms-1 socratic-btn-dark"
                @click="
                    this.message = 'Why does this subject matter?';
                    this.isSuggestedInteraction = true;
                    sendMessage();
                "
                :disabled="$parent.isAITokenLimitReached"
            >
                Why does this subject matter?
            </button>
            <button
                class="btn suggested-interactions ms-1 socratic-btn-dark"
                @click="
                    this.message =
                        'How might I use knowledge of this topic in everyday life?';
                    this.isSuggestedInteraction = true;
                    sendMessage();
                "
                :disabled="$parent.isAITokenLimitReached"
            >
                How might I use knowledge of this topic in everyday life?
            </button>
            <button
                class="btn suggested-interactions ms-1 socratic-btn-dark"
                @click="
                    this.message =
                        'What is the most important thing for me to understand about this subject?';
                    this.isSuggestedInteraction = true;
                    sendMessage();
                "
                :disabled="$parent.isAITokenLimitReached"
            >
                What is the most important thing for me to understand about this
                subject?
            </button>
        </span>

        <!-- <span
            v-if="tutorType === 'assessing'"
            class="d-flex flex-row suggested-interactions-wrapper mt-1 mb-1"
        >
            <button
                class="btn suggested-interactions ms-1 assessing-btn-dark"
                @click="askQuestion('test me')"
            >
                test me
            </button>
        </span> -->
        <!-- Message thread -->
        <div
            v-if="showChat"
            class="d-flex flex-column mx-auto chat-history"
            :class="{
                'chat-history': mode === 'big',
                'mini-chat-history': mode === 'mini',
                'socratic-chat': tutorType === 'socratic',
                'assessing-chat': tutorType === 'assessing'
            }"
            ref="messageInputDiv"
        >
            <!-- Currently streaming message -->
            <div
                v-if="
                    stateOfSocket.isStreaming &&
                    stateOfSocket.streamType === 'aiTutor'
                "
                class="d-flex my-3 tutor-conversation streamed-message"
                v-html="applyMarkDownFormatting(stateOfSocket.streamingMessage)"
            ></div>
            <div
                class="d-flex my-3"
                :class="{ 'justify-content-end': message.role === 'user' }"
                v-for="message in chatHistory"
            >
                <!-- Student messages -->
                <div v-if="message.role === 'user'" class="user-conversation">
                    <em>{{ message.content[0].text.value }}</em>
                </div>
                <!-- AI tutor messages -->
                <span
                    v-else-if="
                        message.role === 'assistant' &&
                        message.content[0].type == 'text'
                    "
                    class="d-flex justify-content-between w-100"
                >
                    <div
                        class="tutor-conversation"
                        v-html="
                            applyMarkDownFormatting(
                                message.content[0].text.value
                            )
                        "
                    ></div>
                    <!-- Generate / Play audio -->
                    <!-- Loading animation -->
                    <div
                        v-if="
                            message.isAudioGenerating &&
                            message.role === 'assistant'
                        "
                        class="d-flex"
                    >
                        <span class="speech-loader"></span>
                    </div>
                    <button
                        v-else-if="
                            !message.hasAudio &&
                            !message.isAudioGenerating &&
                            message.role === 'assistant'
                        "
                        @click="
                            generateAudio(
                                message.index,
                                message.content[0].text.value
                            )
                        "
                        class="btn speechButton"
                    >
                        generate speech
                    </button>
                    <button
                        v-else-if="
                            !message.isAudioGenerating &&
                            message.role === 'assistant'
                        "
                        @click="playAudio(message.index)"
                        class="btn speechButton"
                    >
                        <svg
                            v-if="isAudioPlaying == false"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            fill="yellow"
                            height="18"
                            width="18"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                            <path
                                d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c7.6-4.2 16.8-4.1 24.3 .5l144 88c7.1 4.4 11.5 12.1 11.5 20.5s-4.4 16.1-11.5 20.5l-144 88c-7.4 4.5-16.7 4.7-24.3 .5s-12.3-12.2-12.3-20.9l0-176c0-8.7 4.7-16.7 12.3-20.9z"
                            />
                        </svg>
                        <svg
                            v-else
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            fill="yellow"
                            height="18"
                            width="18"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                            <path
                                d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm192-96l128 0c17.7 0 32 14.3 32 32l0 128c0 17.7-14.3 32-32 32l-128 0c-17.7 0-32-14.3-32-32l0-128c0-17.7 14.3-32 32-32z"
                            />
                        </svg>
                    </button>
                </span>
            </div>
        </div>
        <!-- User input (mini mode) -->
        <div :class="'mini-user-chat-div'" v-if="mode === 'mini'">
            <textarea
                ref="messageInput"
                class="chat-text-area"
                v-model="message"
                type="text"
                @keydown.enter="handleKeyDown"
            >
            </textarea>
            <!-- Send button -->
            <div
                b-tooltip.hover
                tile="send message"
                class="d-flex flex-row-reverse"
            >
                <button class="btn primary-btn send-btn" @click="sendMessage()">
                    <!-- Speech bubble icon -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="18"
                        height="18"
                        fill="white"
                    >
                        <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                        <path
                            d="M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3c0 0 0 0 0 0c0 0 0 0 0 0s0 0 0 0s0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM128 208a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm96 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </div>
    <!-- Maximise button -->
    <div class="hidden-chat-symbol" v-else @click="mode = 'mini'">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            fill="white"
            width="26"
            height="26"
        >
            <path
                d="M256 448c141.4 0 256-93.1 256-208S397.4 32 256 32S0 125.1 0 240c0 45.1 17.7 86.8 47.7 120.9c-1.9 24.5-11.4 46.3-21.4 62.9c-5.5 9.2-11.1 16.6-15.2 21.6c-2.1 2.5-3.7 4.4-4.9 5.7c-.6 .6-1 1.1-1.3 1.4l-.3 .3c0 0 0 0 0 0c0 0 0 0 0 0s0 0 0 0s0 0 0 0c-4.6 4.6-5.9 11.4-3.4 17.4c2.5 6 8.3 9.9 14.8 9.9c28.7 0 57.6-8.9 81.6-19.3c22.9-10 42.4-21.9 54.3-30.6c31.8 11.5 67 17.9 104.1 17.9zM128 208a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm128 0a32 32 0 1 1 0 64 32 32 0 1 1 0-64zm96 32a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
            />
        </svg>
    </div>
</template>

<style scoped>
.hovering-info-panel {
    position: absolute;
    z-index: 1000; /* Higher than before to ensure it's above other elements */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    width: fit-content;
    max-width: 300px; /* Limit tooltip width */
    margin-bottom: 0 !important;
    background-color: white; /* Ensure the background is solid */
    border-radius: 4px;
    padding: 10px;
    pointer-events: auto; /* Ensure buttons in tooltip are clickable */
}

/* Loading animation for generating speech audio*/
.speech-loader {
    width: 24px;
    height: 24px;
    border: 5px solid yellow;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
/* End of loading animation */

.speechButton {
    max-height: fit-content;
    color: yellow;
}

.lineThrough {
    text-decoration: line-through;
}

.underline {
    text-decoration: underline;
}

.suggested-interactions-wrapper {
    overflow-x: auto;
}

.suggested-interactions {
    color: white;
    border: 1px solid black;
    white-space: nowrap;
}

.socratic-btn-dark {
    background-color: #031e27;
}

.assessing-btn-dark {
    background-color: #290707;
}

.tutor-conversation {
    font-family: 'Poppins', sans-serif;
}

.ai-tutor-processing {
    display: flex;
    width: fit-content;
    flex-direction: row;
    align-items: center;
    gap: 5px;
    border-radius: 25px;
    border: 1px solid #acacac;
    padding: 5px 10px;
    margin-bottom: 15px;
}

.chat-text-area {
    width: 100%;
}

.user-conversation {
    padding: 10px 15px;
    border-radius: 50px;
    color: white;
    text-align: end;
}

.socratic-chat {
    background-color: #031e27;
    color: white;
}

.assessing-chat {
    background-color: #290707;
    color: white;
}

.chat-history {
    overflow-x: hidden;
    padding: 5px 10px;
    border-radius: 15px;
    min-height: 50px;
}

.mini-chat-history {
    width: 103%;
    height: 80%;
    overflow-y: auto;
}

.mini-user-chat-div {
    position: fixed;
    width: 360px;
    bottom: 15px;
    display: flex;
    flex-direction: row;
    background-color: white;
    margin-top: 20px;
    padding: 10px 15px;
    border-top: #c8cccc 1px solid;
}

.send-message-button {
    height: fit-content;
    width: fit-content;
}

.socratic-btn {
    background-color: #31315f;
    color: white;
}

.assessing-btn {
    background-color: #7f1e1e;
    color: white;
}

.minimize-chat-container {
    position: fixed;
    z-index: 10000;
    bottom: 10px;
    right: 40px;
    width: 380px;
    height: 600px;
    background-color: white !important;
    border-radius: 15px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
        rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
    padding-top: 15px;
}

.symbol-btn {
    cursor: pointer;
}

.hidden-chat-symbol {
    position: fixed;
    z-index: 10000;
    bottom: 12px;
    right: 30px;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    gap: 5px;
    background-color: var(--primary-color);
    width: fit-content;
    padding: 16px;
    border-radius: 50px;
}

.streamed-message {
    display: flex;
    flex-direction: column;
}
/* ************************* */
/* Tablet Styling */
@media (min-width: 577px) and (max-width: 1023px) {
    .chat-history {
        width: 100%;
    }
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    .chat-history {
        width: 100%;
    }
}
</style>
