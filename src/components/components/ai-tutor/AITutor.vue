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
            mode: 'hide',
            englishSkillLevel: '',
            learningObjectives: [],
            tutorType: 'socratic',
            // hide / show chat
            showChat: true,
            isTextToSpeech: true,
            threadID: '',
            audio: null,
            isAudioPlaying: false,
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
        async showTutorModal(type) {
            this.tutorType = type;

            await this.getChatHistory();

            if (type == 'socratic')
                this.chatHistory = this.socraticTutorChatHistory;
            else if (type == 'assessing') {
                this.chatHistory = this.assessingTutorChatHistory;
            }

            if (!this.$parent.isAITokenLimitReached) {
                this.mode = 'modal';
                this.askQuestion();
            } else {
                this.mode = 'docked';
            }
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
                    // Assessment (every 10 answers)
                    let numAnswers = 0;
                    for (let i = 0; i < this.chatHistory.length; i++) {
                        if (this.chatHistory[i].role == 'user') {
                            numAnswers++;
                        }
                    }
                    if (numAnswers > 9 && numAnswers % 10 == 0) {
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
            console.log('assess');
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
        },
        handleTutorClick(type) {
            if (!this.userDetailsStore.userId) {
                this.$router.push('/login');
            } else {
                this.showTutorModal(type);
            }
        },
        handleMultipleChoiceClick() {
            if (!this.userDetailsStore.userId) {
                this.$router.push('/login');
            }
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
    <!-- Modal for 'modal mode'-->
    <div v-if="mode === 'modal'" class="modal"></div>
    <!-- Tutor UI -->
    <div
        :class="{
            'container mt-3': mode === 'docked',
            'modal-mode-container': mode === 'modal'
        }"
    >
        <!-- Heading, tooltip and minimise/maximise buttons -->
        <div
            class="d-flex flex-column flex-md-row gap-2 align-items-baseline mb-1"
        >
            <div class="d-flex flex-row w-100 justify-content-between">
                <div class="d-flex gap-2">
                    <!-- Info button -->
                    <span class="d-flex gap-2">
                        <TooltipBtn
                            v-if="mode === 'docked' && tutorType == 'socratic'"
                            class="d-none d-md-block"
                            toolTipText="Press the 'generate speech' button to hear the tutor speak with AI generated speech."
                            bubbleWidth="350px"
                            trianglePosition="left"
                            absoluteTop="37px"
                        />
                        <TooltipBtn
                            v-else-if="
                                mode === 'docked' && tutorType == 'assessing'
                            "
                            class="d-none d-md-block"
                            toolTipText="Your dialog with the Conversational Test will continue indefinitely until 70% of your
                                    answers are deemed to be correct."
                            bubbleWidth="350px"
                            trianglePosition="left"
                            absoluteTop="37px"
                        />
                        <!-- Mobile tooltip has smaller width -->
                        <TooltipBtn
                            v-if="mode === 'docked' && tutorType == 'socratic'"
                            class="d-md-none"
                            toolTipText="Press the 'generate speech' button to hear the tutor speak with AI generated speech."
                            bubbleWidth="100px"
                            trianglePosition="left"
                            absoluteTop="37px"
                        />
                        <TooltipBtn
                            v-else-if="
                                mode === 'docked' && tutorType == 'assessing'
                            "
                            class="d-md-none"
                            toolTipText="Your dialog with the Conversational Test will continue indefinitely until 70% of your
                                    answers are deemed to be correct."
                            bubbleWidth="100px"
                            trianglePosition="left"
                            absoluteTop="37px"
                        />
                    </span>
                    <!-- Tutor loading animation (modal mode) -->
                    <div
                        v-if="mode === 'modal' && waitForAIresponse"
                        class="ai-tutor-processing mt-1"
                    >
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
                </div>

                <div class="d-flex">
                    <!-- For speech to text -->
                    <SpeechRecorder
                        :tutorType="tutorType"
                        :skill="skill"
                        :skillLevel="englishSkillLevel"
                        :learningObjectives="learningObjectives"
                        :isAITokenLimitReached="$parent.isAITokenLimitReached"
                    />
                    <!-- Dock button -->
                    <div title="Dock AI tutor" b-tooltip.hover>
                        <button
                            v-if="mode === 'modal'"
                            class="primary-btn btn close-btn ms-2"
                            @click="mode = 'docked'"
                            aria-label="Close"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 384 512"
                                fill="white"
                                width="16"
                            >
                                <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                                <path
                                    d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
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
        <!-- notification -->
        <div
            class="alert alert-warning mt-1"
            role="alert"
            v-if="$parent.isAITokenLimitReached"
        >
            You have reached your monthly AI token limit. Please recharge your
            subscription to use more.
        </div>
        <!--Tutor types and STT-->
        <div
            v-if="mode === 'docked' || mode === 'hide'"
            class="d-flex flex-lg-row flex-column justify-content-between"
        >
            <!--Tutor types -->
            <div class="d-md-inline-block d-flex flex-wrap flex-md-nowrap">
                <!-- Socratic Tutor agent -->
                <div class="d-inline-block">
                    <button
                        class="btn ms-1 socratic-btn fs-2 fw-bold py-1"
                        :class="{ underline: tutorType === 'socratic' }"
                        @click="handleTutorClick('socratic')"
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
                <div class="d-inline-block mt-1">
                    <button
                        class="btn ms-1 assessing-btn fs-2 fw-bold py-1"
                        :class="{ underline: tutorType === 'assessing' }"
                        @click="handleTutorClick('assessing')"
                    >
                        Conversational Test
                    </button>

                    <!-- Conversational Test Tooltip  -->
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
                                    Your dialog with the Conversational Test
                                    will continue indefinitely until 70% of your
                                    answers are deemed to be correct.
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
                <!-- Multiple Choice Assessment -->
                <div class="d-inline-block pt-md-0 mt-1">
                    <router-link
                        v-if="
                            !$parent.isMastered &&
                            skill.type != 'domain' &&
                            skill.id
                        "
                        class="btn ms-1 assessing-btn fw-bold py-1 fs-2"
                        :to="
                            userDetailsStore.userId
                                ? skill.id + '/assessment'
                                : '/login'
                        "
                    >
                        Multiple-Choice Test
                    </router-link>
                </div>
            </div>
            <div v-if="mode != 'hide'" class="d-flex justify-content-between">
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
            </div>
        </div>
        <!-- User input (docked mode) -->
        <div class="d-flex mt-1" v-if="mode === 'docked'">
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
        <!-- Tutor loading animation (docked mode) -->
        <div
            v-if="mode === 'docked' && waitForAIresponse"
            class="ai-tutor-processing mt-1"
        >
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
        <!-- Message thread -->
        <div
            v-if="showChat && mode != 'hide'"
            class="d-flex flex-column mx-auto chat-history"
            :class="{
                'chat-history': mode === 'docked',
                'modal-chat-history': mode === 'modal',
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

            <!-- Process messages with appropriate border styling -->
            <template v-for="(message, index) in chatHistory">
                <!-- Student messages -->
                <div
                    v-if="message.role === 'user'"
                    class="d-flex justify-content-end message-divider"
                >
                    <div class="user-conversation">
                        <em>{{ message.content[0].text.value }}</em>
                    </div>
                </div>

                <!-- AI tutor messages with conditional border styling -->
                <div
                    v-else-if="
                        message.role === 'assistant' &&
                        message.content[0].type == 'text'
                    "
                    class="d-flex justify-content-between w-100"
                    :class="{
                        'message-divider': index !== 0,
                        'first-message': index === 0
                        // 'last-message': index === chatHistory.length - 1
                    }"
                >
                    <div class="tutor-conversation">
                        <div
                            v-html="
                                applyMarkDownFormatting(
                                    message.content[0].text.value
                                )
                            "
                        ></div>
                    </div>
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
                    <!-- Generate speech button -->
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
                    <!-- Play/pause button -->
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
                            <path
                                d="M464 256A208 208 0 1 0 48 256a208 208 0 1 0 416 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm192-96l128 0c17.7 0 32 14.3 32 32l0 128c0 17.7-14.3 32-32 32l-128 0c-17.7 0-32-14.3-32-32l0-128c0-17.7 14.3-32 32-32z"
                            />
                        </svg>
                    </button>
                </div>
            </template>
        </div>

        <!-- User input (modal mode) -->
        <div :class="'modal-user-chat-div'" v-if="mode === 'modal'">
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
                :disabled="$parent.isAITokenLimitReached"
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
</template>

<style scoped>
.message-divider {
    border-top: 1px solid #e0e0e0;
    padding-top: 25px;
    padding-bottom: 20px;
    /* border-bottom: 1px solid #e0e0e0;    
     margin: 20px 0; */
}
.first-message {
    padding: 20px 0;
    /* border-bottom: 1px solid #e0e0e0;
    padding-bottom: 20px;
     margin-bottom: 20px; */
}

/* Increase text size for the popup modal mode */
.modal-mode-container .tutor-conversation {
    font-size: 1.1rem; /* Increase from default */
    line-height: 1.5;
}

.modal-mode-container .user-conversation {
    font-size: 1.1rem; /* Increase from default */
}

/* Increase the headings for better hierarchy */
.modal-mode-container .secondary-heading {
    font-size: 1.75rem;
}

/* Make sure the chat text area has larger text too for consistency */
.modal-mode-container .chat-text-area {
    font-size: 1.1rem;
}
.last-message {
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 20px;
    /* margin-bottom: 20px; */
}
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
    margin-bottom: 10px;
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
    background-color: #571515;
    color: white;
}

.chat-history {
    overflow-x: hidden;
    padding: 5px 10px;
    border-radius: 15px;
    min-height: 50px;
}

.modal-chat-history {
    height: 80%;
    overflow-y: auto;
}

.modal-user-chat-div {
    width: 100%;
    display: flex;
    background-color: white;
    margin-top: 10px;
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

.modal-mode-container {
    position: fixed;
    z-index: 10000;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    height: 90%;
    background-color: white !important;
    border-radius: 15px;
    box-shadow: rgba(50, 50, 93, 0.25) 0px 6px 12px -2px,
        rgba(0, 0, 0, 0.3) 0px 3px 7px -3px;
    padding-top: 15px;
    padding-bottom: 10px;
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
