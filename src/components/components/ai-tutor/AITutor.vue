<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import { useUserSkillsStore } from '../../../stores/UserSkillsStore.js';
import { useSkillTreeStore } from '../../../stores/SkillTreeStore.js';
import { useSettingsStore } from '../../../stores/SettingsStore.js';
import TutorLoadingSymbol from './tutorLoadingSymbol.vue';
import TooltipBtn from './../share-components/TooltipBtn.vue';
import SpeechRecorder from './SpeechRecorder.vue';
import { socket, socketState } from '../../../socket.js';
import PlayingAudioAnimation from './playingAudioAnimation.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const userSkillsStore = useUserSkillsStore();
        const skillTreeStore = useSkillTreeStore();
        const settingStore = useSettingsStore();
        const stateOfSocket = socketState;
        return {
            stateOfSocket,
            userDetailsStore,
            userSkillsStore,
            skillTreeStore,
            settingStore
        };
    },
    props: [
        'skill',
        'showTutorialTip7',
        'showTutorialTip8',
        'showTutorialTip9',
        'areAllSubskillsMastered'
    ],
    emits: ['progressTutorial', 'skipTutorial', 'skillMastered'],
    components: {
        TutorLoadingSymbol,
        TooltipBtn,
        SpeechRecorder,
        PlayingAudioAnimation
    },
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
            audio: null,
            isAudioPlaying: false,
            assistantData: {
                assistantId: null,
                threadId: null
            },
            // Used for conditional class for streaming chat (margin top)
            isNewSocraticChat: true,
            isNewAssessingChat: true,
            waitForGenerateAudio: false,
            currentIndexAudioPlaying: null,
            isMobileCheck: window.innerWidth,
            hasTutorButtonBeenClicked: false,
            modalTextAreaHeight: '',
            isLoading: false,
            loadingMessage: '',
            isRecording: false,
            localNumOfConversationalQuestion: 0
        };
    },
    async created() {
        this.connectToSocketSever();
    },
    async mounted() {
        /*
         * External scripts needed for AI chat bots
         * moved away from index.html for SEO/performance reasons
         */
        // Katex for equation formatting
        let katexScript = document.createElement('script');
        katexScript.setAttribute(
            'src',
            'https://cdn.jsdelivr.net/npm/katex/dist/katex.min.js'
        );
        document.head.appendChild(katexScript);

        // Markdown formatting for math content
        let texMathScript = document.createElement('script');
        texMathScript.setAttribute(
            'src',
            'https://cdn.jsdelivr.net/npm/markdown-it-texmath/texmath.min.js'
        );
        document.head.appendChild(texMathScript);

        // Markdown IT for chat text formatting
        let markdownITScript = document.createElement('script');
        markdownITScript.setAttribute(
            'src',
            'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js'
        );
        document.head.appendChild(markdownITScript);

        // -------

        this.learningObjectives = this.skill.learningObjectives.map(
            (a) => a.objective
        );
        this.englishSkillLevel = this.skill.level.replace('_', ' ');

        this.audio = new Audio();
        this.audio.addEventListener('ended', () => {
            this.isAudioPlaying = false;
            this.currentIndexAudioPlaying = null;
        });

        // ========================================================================================
        // Get number of conversational test questions before we record user is attempt on take the assignment
        if (this.settingStore.conversationalTestQuestionsBeforeRecord === 0) {
            await this.settingStore.getSettings();
        }
        // Get local storage current number of question
        this.localNumOfConversationalQuestion = parseInt(
            localStorage.getItem('numOfConversationalQuestion')
        );
        if (!this.localNumOfConversationalQuestion) {
            this.localNumOfConversationalQuestion = 0;
        }
    },
    methods: {
        // Setting this method to allow the user to be able to create a new line with shift+enter
        handleKeyDown(e) {
            if (e.shiftKey || this.$parent.isAITokenLimitReached) {
                return;
            }
            e.preventDefault();
            this.sendMessage();
        },
        // Open tutor modal and load messages
        async showTutorModal(type) {
            try {
                // Existing implementation
                this.tutorType = type;
                await this.getChatHistory();

                if (type == 'socratic')
                    this.chatHistory = this.socraticTutorChatHistory;
                else if (type == 'assessing') {
                    this.chatHistory = this.assessingTutorChatHistory;
                }

                if (!this.$parent.isAITokenLimitReached) {
                    this.mode = 'modal';
                    this.hasTutorButtonBeenClicked = false;
                    // Remove loading spinner
                    this.isLoading = false;
                    await this.askQuestion();
                } else {
                    this.mode = 'docked';
                }
            } catch (error) {
                console.error('Error in showTutorModal:', error);
            }
        },
        async hideTutorModal(type) {
            this.tutorType = type;
            await this.getChatHistory();
            if (type == 'socratic')
                this.chatHistory = this.socraticTutorChatHistory;
            else if (type == 'assessing') {
                this.chatHistory = this.assessingTutorChatHistory;
            }
            // reset chat input height
            this.modalTextAreaHeight = '60px';
            this.mode = 'docked';
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
                    this.assistantData.threadId = this.chatHistory[0].thread_id;
                    if (this.tutorType == 'socratic')
                        this.isNewSocraticChat = false;
                    else if (this.tutorType == 'assessing')
                        this.isNewAssessingChat = false;
                }

                // if (this.mode == 'modal') {
                //     this.chatHistory = this.chatHistory.reverse();
                // }

                this.$parent.checkTokenUsage();
            } catch (error) {
                console.error(error);
            }
        },
        convertLatexToPlainText(message) {
            let string = message;
            // handle exponent square case
            string = string.replaceAll('^2', 'squared');
            // handle exponent cube case
            string = string.replaceAll('^3', 'cubed');
            // handle other exponent case
            string = string.replaceAll('^', 'to the power of');
            // transform inequalities symbol to text
            string = string.replaceAll('<', 'is smaller than');
            string = string.replaceAll('>', 'is greater than');
            string = string.replaceAll('leq', 'is smaller than or equal to');
            string = string.replaceAll('geq', 'is greater than or equal to');
            // handle square root in latex
            string = string.replaceAll('sqrt', 'square root of');
            // At last we remove all $ sign
            string = string.replaceAll('$', '');

            return string;
        },
        /*
         * Audio methods
         */
        // Generate audio immediately
        async generateAudio(index, message) {
            // Start loading animation
            for (let i = 0; i < this.chatHistory.length; i++) {
                if (this.chatHistory[i].index == index) {
                    this.chatHistory[i].isAudioGenerating = true;
                }
            }

            // Play button not enabled
            this.waitForGenerateAudio = true;

            // Convert latex symbols that will give the TTS AI trouble to speak
            let messageForTTS = this.convertLatexToPlainText(message);

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: messageForTTS,
                    messageNumber: index,
                    threadID: this.assistantData.threadId
                })
            };

            let url = '';
            if (this.tutorType == 'socratic')
                url = `/ai-tutor/socratic/generate-tts`;
            else url = `/ai-tutor/assessing/generate-tts`;

            const response = await fetch(url, requestOptions);
            const responseData = await response.json();
            this.waitForGenerateAudio = false;
            // Stop loading animation
            for (let i = 0; i < this.chatHistory.length; i++) {
                if (this.chatHistory[i].index == index) {
                    this.chatHistory[i].isAudioGenerating = false;
                }
            }

            // Update chat history after generating audio
            await this.getChatHistory();

            // Auto-play the audio if the user has this setting enabled
            if (this.userDetailsStore.isAudioAutoPlay) {
                this.playNewMessageAudio(index, responseData.speechUrl);
            }
        },
        // Press play button
        playAudio(index) {
            // If playing, pause
            if (this.isAudioPlaying == true) {
                this.isAudioPlaying = false;
                this.audio.pause();
                this.currentIndexAudioPlaying = null;
            }
            // Else, play
            else {
                let url = '';
                for (let i = 0; i < this.chatHistory.length; i++) {
                    if (this.chatHistory[i].index == index) {
                        url = this.chatHistory[i].audio;
                    }
                }
                this.audio.pause(); // Stop previous audio
                this.audio.src = url;
                this.audio.load(); // Important when changing src dynamically
                this.audio.play();

                this.isAudioPlaying = true;
                this.currentIndexAudioPlaying = index;
            }
        },
        onVoiceMessageError() {
            this.isRecording = false;
            const activeTextarea =
                this.$refs.messageInput || this.$refs.modalMessageInput;
            if (activeTextarea) {
                activeTextarea.placeholder =
                    'Type your message or use voice input...';
            }
        },
        // Auto play audio after streaming from Open AI
        playNewMessageAudio(index, url) {
            // If playing, pause
            if (this.isAudioPlaying == true) {
                this.isAudioPlaying = false;
                this.audio.pause();
                this.currentIndexAudioPlaying = null;
            }
            this.audio.pause(); // Stop previous audio
            this.audio.src = url;
            this.audio.load(); // Important when changing src dynamically
            this.audio.play();

            this.isAudioPlaying = true;
            this.currentIndexAudioPlaying = index;
            this.getChatHistory();
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

            // Set thinking state ONLY when actually sending to AI
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
                } else if (this.mode == 'docked') {
                    this.chatHistory.unshift(userMessage);
                } else if (this.mode == 'modal') {
                    this.chatHistory.push(userMessage);
                }

                const messageData = {
                    threadId: this.assistantData.threadId,
                    assistantId: this.assistantData.assistantId,
                    tutorType: this.tutorType,
                    skillName: this.skill.name,
                    skillId: this.skill.id,
                    skillLevel: this.englishSkillLevel,
                    learningObjectives: this.learningObjectives,
                    // The message from the student
                    message: this.message,
                    userId: this.userDetailsStore.userId
                };

                this.message = '';
                socket.emit(socketChannel, messageData);
            } catch (error) {
                console.error(error);
                this.waitForAIresponse = false; // Reset on error
            }
            this.$nextTick(() => {
                this.scrollToMessageInput();
            });
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
                    skillName: this.skill.name,
                    threadId: this.assistantData.threadId,
                    assistantId: this.assistantData.assistantId,
                    message: '',
                    userId: this.userDetailsStore.userId,
                    skillId: this.skill.id
                };

                socket.emit(socketChannel, messageData);
                this.message = '';
            } catch (error) {
                console.error(error);
                this.waitForAIresponse = false;
            }
            this.$nextTick(() => {
                this.scrollToMessageInput();
            });
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
                        skillId: this.skill.id,
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
            const formattedString = this.formatTextForDisplay(string);
            let formattedMessage = md.render(formattedString);
            return formattedMessage;
        },
        scrollToMessageInput() {
            const inputDiv = this.$refs.messageInputDiv;
            if (inputDiv) {
                // Smooth scroll to bottom
                inputDiv.scrollTo({
                    top: inputDiv.scrollHeight,
                    behavior: 'smooth'
                });
            }
        },
        // smoothScrollToMessageInput() {
        //     let inputMessage = this.$refs.messageInputDiv;
        //     inputMessage.scrollIntoView({ behavior: 'smooth' });
        // },
        async makeMastered() {
            // Don't use alert, instead emit an event to the parent component
            await this.userSkillsStore.MakeMastered(
                this.userDetailsStore.userId,
                this.skill
            );

            // Emit an event to notify the parent that mastery was achieved
            this.$emit('skillMastered');

            // Close the tutor modal if it's open
            if (this.mode === 'modal') {
                this.mode = 'docked';
            }
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
                // Show guest tooltip instead of redirecting
                this.$parent.showGuestTooltip();
            } else {
                // If this is the first time the user starts the assessment,
                // record that the user has started the assessment.
                if (type == 'assessing') {
                    if (this.$parent.isAssessmentStarted == false) {
                        this.userSkillsStore.recordAssessmentAttempt(
                            this.userDetailsStore.userId,
                            this.skill.id
                        );
                    }
                }

                this.isLoading = true;
                this.loadingMessage = `Loading ${
                    type === 'socratic'
                        ? 'Socratic Tutor'
                        : 'Conversational Test'
                }...`;

                this.hasTutorButtonBeenClicked = true;
                this.showTutorModal(type);
            }
        },
        navigateToAssessment() {
            // Prevent navigation if conditions aren't met
            if (this.skill.type === 'super' && !this.areAllSubskillsMastered) {
                return;
            }
            // If user not logged in, show tooltip instead of redirecting
            if (!this.userDetailsStore.userId) {
                this.$parent.showGuestTooltip();
                return;
            }
            this.loadingMessage = 'Loading assessment...';

            // If this is the first time the user starts the assessment,
            // record that the user has started the assessment.

            // if (this.$parent.isAssessmentStarted == false) {
            //     this.userSkillsStore.recordAssessmentAttempt(
            //         this.userDetailsStore.userId,
            //         this.skill.id
            //     );
            // }
            this.$router.push(`${this.skill.id}/assessment`);
        },
        // Get all latex string in a message
        getLatexStrings(message) {
            const results = [];
            let isStartDollarSign = false;
            let isGettingLatexString = false;
            let latexString = '';
            let startIndex = 0;
            let endIndex = 0;
            // get string between dollar sign
            for (let index = 0; index < message.length; index++) {
                const character = message[index];
                if (character === '$') {
                    if (message[index + 1] === '$') {
                        continue;
                    }
                    isStartDollarSign = !isStartDollarSign;
                    // handle double dollar sign case

                    if (isStartDollarSign) {
                        startIndex = index;
                    } else {
                        endIndex = index;
                    }
                }
                if (isStartDollarSign) {
                    isGettingLatexString = true;
                    latexString = latexString + character;
                }
                if (isGettingLatexString && !isStartDollarSign) {
                    latexString = latexString + character;
                    results.push({
                        string: latexString,
                        startIndex: startIndex,
                        endIndex: endIndex
                    });
                    latexString = '';
                    isGettingLatexString = false;
                }
            }

            return results;
        },
        getLatexStringsBetweenSquareBracket(message) {
            let results = [];
            // get string between square bracket
            // for example: \[a,b,c\]
            let isStartSquareBracketSign = false;
            let isGettingSquareBracketString = false;
            let squareBracketString = '';
            let startSquareBracketIndex = 0;
            let endSquareBracketIndex = 0;
            // get string between square bracket
            for (let index = 0; index < message.length; index++) {
                const character = message[index];
                if (character === '\\') {
                    if (message[index + 1] === '[') {
                        isStartSquareBracketSign = true;
                        startSquareBracketIndex = index;
                    } else if (message[index + 1] === ']') {
                        isStartSquareBracketSign = false;
                        endSquareBracketIndex = index;
                    }
                }
                if (isStartSquareBracketSign) {
                    isGettingSquareBracketString = true;
                    squareBracketString = squareBracketString + character;
                }
                if (isGettingSquareBracketString && !isStartSquareBracketSign) {
                    squareBracketString = squareBracketString + character;
                    // also get the next character which is ']'
                    squareBracketString =
                        squareBracketString + message[index + 1];
                    results.push({
                        string: squareBracketString,
                        startIndex: startSquareBracketIndex,
                        endIndex: endSquareBracketIndex
                    });
                    squareBracketString = '';
                    isGettingSquareBracketString = false;
                }
            }
            return results;
        },
        // Formatting the message to render correctly with KaTeX
        formatTextForDisplay(message) {
            const latexStringList = this.getLatexStrings(message);
            let localMessage = message;
            // handle dollar sign case
            latexStringList.forEach((element) => {
                // remove any white space and newline inside the string
                let newString = element.string.replaceAll('$ ', '$');
                newString = newString.replaceAll(' $', '$');
                localMessage = localMessage.replaceAll(
                    element.string,
                    newString
                );
            });

            // handle square bracket case
            const squareBracketStringList =
                this.getLatexStringsBetweenSquareBracket(message);
            squareBracketStringList.forEach((element) => {
                // remove any white space and newline inside the string
                let newString = '\n' + element.string;
                localMessage = localMessage.replaceAll(
                    element.string,
                    newString
                );
            });
            return localMessage;
        },
        onRecordingStarted() {
            this.message = '';
            this.isRecording = true;
            // Update placeholder for the active textarea
            const activeTextarea =
                this.$refs.messageInput || this.$refs.modalMessageInput;
            if (activeTextarea) {
                activeTextarea.placeholder = 'Recording in progress...';
            }
        },
        onRecordingStopped() {
            // Update placeholder for the active textarea
            const activeTextarea =
                this.$refs.messageInput || this.$refs.modalMessageInput;
            if (activeTextarea) {
                activeTextarea.placeholder = 'Converting speech to text...';
            }
        },
        onVoiceMessageSent() {
            this.isRecording = false;
            // Reset placeholder for the active textarea
            const activeTextarea =
                this.$refs.messageInput || this.$refs.modalMessageInput;
            if (activeTextarea) {
                activeTextarea.placeholder =
                    'Type your message or use voice input...';
            }
            this.$nextTick(() => {
                this.scrollToMessageInput();
            });
        },
        autoResizeTextarea() {
            const textarea = this.$refs.messageInput;
            if (textarea) {
                // Reset height to auto to get the natural scrollHeight
                textarea.style.height = 'auto';

                // Calculate new height based on content, with proper min/max bounds
                const scrollHeight = textarea.scrollHeight;
                const minHeight = 18;
                const maxHeight = 120;
                const newHeight = Math.min(
                    Math.max(scrollHeight, minHeight),
                    maxHeight
                );

                textarea.style.height = newHeight + 'px';
            }
        },
        autoResizeModalTextarea() {
            const textarea = this.$refs.modalMessageInput;
            if (textarea) {
                // Reset height to auto to get the natural scrollHeight
                textarea.style.height = 'auto';

                // Calculate new height based on content, with proper min/max bounds
                const scrollHeight = textarea.scrollHeight;
                const minHeight = 18;
                const maxHeight = 120;
                const newHeight = Math.min(
                    Math.max(scrollHeight, minHeight),
                    maxHeight
                );

                textarea.style.height = newHeight + 'px';
            }
        }
    },
    computed: {
        sortedChatHistory() {
            // Always return an array, even if chatHistory is not available
            if (!this.chatHistory || !Array.isArray(this.chatHistory)) {
                return [];
            }

            if (this.mode == 'modal') {
                return [...this.chatHistory].sort((a, b) => a.index - b.index);
            }
            // Sort by index
            else if (this.mode == 'docked') {
                return [...this.chatHistory].sort((a, b) => b.index - a.index); // Sort by index
            }

            // Fallback: return the original array if mode doesn't match
            return [...this.chatHistory];
        }
    },
    watch: {
        stateOfSocket: {
            async handler(newItem, oldItem) {
                if (newItem.streamType !== 'aiTutor') {
                    return;
                }

                if (newItem.isStreaming) {
                    // AI has started responding, stop thinking animation
                    this.waitForAIresponse = false;
                    this.$nextTick(() => {
                        this.scrollToMessageInput();
                    });
                }

                if (!newItem.isStreaming && newItem.isRunJustEnded) {
                    // AI has completely finished responding
                    this.waitForAIresponse = false;
                    // "index" is for generating and playing audio, and order in chat
                    let index = 0;
                    if (
                        this.chatHistory != undefined &&
                        this.chatHistory.length > 0
                    ) {
                        index = this.chatHistory.length;
                    }
                    const assistantMessage = {
                        role: 'assistant',
                        content: [
                            {
                                text: {
                                    value: this.stateOfSocket.streamingMessage
                                },
                                type: 'text'
                            }
                        ],
                        index: index
                    };

                    this.removeStreamMessage();

                    if (typeof this.chatHistory.length == 'undefined') {
                        this.chatHistory = [];
                        this.chatHistory.push(assistantMessage);
                    } else if (this.mode == 'docked') {
                        this.chatHistory.unshift(assistantMessage);
                    } else if (this.mode == 'modal') {
                        this.chatHistory.push(assistantMessage);
                    }

                    this.generateAudio(
                        assistantMessage.index,
                        assistantMessage.content[0].text.value
                    );
                    // Record user assignment attempt

                    if (this.tutorType == 'assessing') {
                        if (
                            this.localNumOfConversationalQuestion ===
                            this.settingStore
                                .conversationalTestQuestionsBeforeRecord
                        ) {
                            await this.userSkillsStore.recordAssessmentAttempt(
                                this.userDetailsStore.userId,
                                this.skill.id
                            );
                            localStorage.setItem(
                                'numOfConversationalQuestion',
                                '0'
                            );
                        } else {
                            this.localNumOfConversationalQuestion =
                                this.localNumOfConversationalQuestion + 1;
                            localStorage.setItem(
                                'numOfConversationalQuestion',
                                this.localNumOfConversationalQuestion
                            );
                        }
                    }

                    this.$nextTick(() => {
                        this.scrollToMessageInput();
                    });
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
                        <span v-if="isMobileCheck > 576">Thinking</span>
                        <TutorLoadingSymbol />
                    </div>
                    <TooltipBtn
                        v-else-if="mode === 'modal' && tutorType == 'assessing'"
                        class="d-none d-md-block"
                        toolTipText="Your dialog with the Conversational Test will continue indefinitely until 70% of your
                                    answers are deemed to be correct."
                        bubbleWidth="350px"
                        trianglePosition="left"
                        absoluteTop="37px"
                    />
                </div>

                <div class="d-flex">
                    <!-- Dock button -->
                    <div title="Dock AI tutor" b-tooltip.hover>
                        <button
                            v-if="mode === 'modal'"
                            class="primary-btn btn close-btn ms-2"
                            @click="hideTutorModal(tutorType)"
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
                    <div class="d-flex justify-content-between">
                        <button
                            class="btn primary-btn"
                            @click="$emit('progressTutorial', 7)"
                        >
                            next
                        </button>
                        <button
                            class="btn red-btn"
                            @click="$emit('skipTutorial')"
                        >
                            exit tutorial
                        </button>
                    </div>
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
            tokens to use more.
        </div>
        <!--Tutor types and STT-->
        <div
            v-if="mode === 'docked' || mode === 'hide'"
            class="d-flex flex-column justify-content-between"
        >
            <!--Tutor types -->
            <div class="container-fluid p-0">
                <div class="row mb-2 mb-md-3 g-2">
                    <!-- Socratic Tutor -->
                    <div class="col-12 col-md-6">
                        <button
                            class="btn socratic-btn ms-1 fs-2 w-100 py-2 fw-bold h-100 text-nowrap"
                            :class="{
                                'text-decoration-underline':
                                    mode !== 'hide' && tutorType === 'socratic',
                                disabled:
                                    hasTutorButtonBeenClicked ||
                                    $parent.isAITokenLimitReached
                            }"
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
                                        The Socratic Tutor helps you learn
                                        through guided questioning. It
                                        encourages critical thinking by asking
                                        you questions that lead you to discover
                                        answers yourself, helping build deeper
                                        understanding of concepts.
                                    </p>
                                    <div class="d-flex justify-content-between">
                                        <button
                                            class="btn primary-btn"
                                            @click="
                                                $emit('progressTutorial', 8)
                                            "
                                        >
                                            next
                                        </button>
                                        <button
                                            class="btn red-btn"
                                            @click="$emit('skipTutorial')"
                                        >
                                            exit tutorial
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- Conversational Test -->
                    <div class="col-12 col-md-6" v-if="!$parent.isMastered">
                        <button
                            class="btn assessing-btn ms-1 fs-2 w-100 py-2 fw-bold h-100 text-nowrap"
                            :class="{
                                'text-decoration-underline':
                                    tutorType === 'assessing',
                                disabled:
                                    (skill.type === 'super' &&
                                        !areAllSubskillsMastered) ||
                                    hasTutorButtonBeenClicked ||
                                    $parent.isAITokenLimitReached
                            }"
                            @click="
                                skill.type === 'super' &&
                                !areAllSubskillsMastered
                                    ? null
                                    : handleTutorClick('assessing')
                            "
                            :title="
                                skill.type === 'super' &&
                                !areAllSubskillsMastered
                                    ? 'Master all subskills first to unlock this assessment'
                                    : ''
                            "
                        >
                            Conversational Test
                        </button>
                        <!-- Conversational Test Tooltip -->
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
                                        will continue indefinitely until 70% of
                                        your answers are deemed to be correct.
                                    </p>
                                    <div class="d-flex justify-content-between">
                                        <button
                                            class="btn primary-btn"
                                            @click="
                                                $emit('progressTutorial', 9)
                                            "
                                        >
                                            next
                                        </button>
                                        <button
                                            class="btn red-btn"
                                            @click="$emit('skipTutorial')"
                                        >
                                            exit tutorial
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Link to test page -->
                <div class="row g-2">
                    <div
                        class="col-12 col-md-6 offset-md-6"
                        v-if="
                            !$parent.isMastered &&
                            skill.type != 'domain' &&
                            skill.id
                        "
                    >
                        <!-- MC Test -->
                        <button
                            class="btn assessing-btn ms-1 fs-2 w-100 py-2 fw-bold h-100 d-block text-nowrap"
                            :class="{
                                disabled:
                                    skill.type === 'super' &&
                                    !areAllSubskillsMastered
                            }"
                            @click="navigateToAssessment"
                            :disabled="
                                skill.type === 'super' &&
                                !areAllSubskillsMastered
                            "
                        >
                            Multiple-Choice Test
                        </button>
                    </div>
                    <!-- Explanation message for disabled button -->
                    <div
                        v-if="
                            skill.type === 'super' && !areAllSubskillsMastered
                        "
                        class="text-end small"
                        :class="{ 'text-center': isMobileCheck < 576 }"
                    >
                        <em
                            >To unlock the tests, first master all the cluster
                            skills</em
                        >
                    </div>
                </div>
            </div>
            <!-- Unified loading overlay for all loading states -->
            <div v-if="isLoading" class="loading-overlay">
                <div class="loading-container">
                    <span class="assessment-loader"></span>
                    <div class="loading-text mt-3">{{ loadingMessage }}</div>
                </div>
            </div>

            <!-- Chat toggle button (Hide Mode) -->
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
        <div
            class="input-container"
            v-if="mode === 'docked' && !$parent.isAITokenLimitReached"
        >
            <div class="input-wrapper">
                <textarea
                    ref="messageInput"
                    class="chat-text-area"
                    v-model="message"
                    placeholder="Type your message or use voice input..."
                    @keydown.enter="handleKeyDown"
                    @input="autoResizeTextarea"
                    :disabled="isRecording"
                ></textarea>

                <!-- Integrated Speech Recorder -->
                <SpeechRecorder
                    class="voice-input-button"
                    :tutorType="tutorType"
                    :skill="skill"
                    :skillLevel="englishSkillLevel"
                    :learningObjectives="learningObjectives"
                    :isAITokenLimitReached="$parent.isAITokenLimitReached"
                    @recording-started="onRecordingStarted"
                    @recording-stopped="onRecordingStopped"
                    @message-sent="onVoiceMessageSent"
                    @message-error="onVoiceMessageError"
                />

                <!-- Send button -->
                <button
                    class="btn send-btn"
                    :class="{
                        'socratic-btn': tutorType === 'socratic',
                        'assessing-btn': tutorType === 'assessing'
                    }"
                    @click="sendMessage()"
                    :disabled="isRecording"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        fill="white"
                    >
                        <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
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
        <div
            v-if="
                showChat &&
                mode !== 'hide' &&
                (chatHistory.length > 0 ||
                    waitForAIresponse ||
                    stateOfSocket.isStreaming)
            "
            class="d-flex flex-column align-items-start tutor-chatting-section"
            :class="{
                'tutor-chatting-waiting-response-section':
                    mode === 'modal' && waitForAIresponse
            }"
        >
            <!-- Message thread -->
            <div
                v-if="showChat && mode != 'hide'"
                class="d-flex flex-column mx-auto"
                :class="{
                    'docked-chat-history': mode === 'docked',
                    'modal-chat-history': mode === 'modal',
                    'socratic-chat': tutorType === 'socratic',
                    'assessing-chat': tutorType === 'assessing'
                }"
                ref="messageInputDiv"
            >
                <!-- Currently streaming message (docked mode) -->
                <div
                    v-if="
                        stateOfSocket.isStreaming &&
                        stateOfSocket.streamType === 'aiTutor' &&
                        mode == 'docked'
                    "
                    class="d-flex my-3 tutor-conversation streamed-message"
                    v-html="
                        applyMarkDownFormatting(stateOfSocket.streamingMessage)
                    "
                ></div>
                <!-- Chat history -->
                <template v-for="(message, index) in sortedChatHistory">
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

                        <!-- Play/pause button, playing animation -->
                        <button
                            v-else-if="
                                !waitForGenerateAudio &&
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
                            <div
                                v-else-if="
                                    isAudioPlaying == true &&
                                    message.index === currentIndexAudioPlaying
                                "
                                class="d-flex gap-1 align-items-center"
                            >
                                <svg
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
                                <PlayingAudioAnimation />
                            </div>
                        </button>
                        <!-- Generate speech button -->
                    </div>
                </template>

                <!-- Currently streaming message (modal mode) -->
                <div
                    v-if="
                        stateOfSocket.isStreaming &&
                        stateOfSocket.streamType === 'aiTutor' &&
                        mode == 'modal'
                    "
                    class="d-flex my-3 tutor-conversation streamed-message"
                    :class="{
                        'mt-auto':
                            (isNewSocraticChat && tutorType == 'socratic') ||
                            (isNewAssessingChat && tutorType == 'assessing')
                    }"
                    v-html="
                        applyMarkDownFormatting(stateOfSocket.streamingMessage)
                    "
                ></div>
            </div>
            <!-- User input (modal mode) -->
            <div
                class="modal-input"
                v-if="mode === 'modal' && !$parent.isAITokenLimitReached"
            >
                <div class="input-row">
                    <textarea
                        ref="modalMessageInput"
                        class="modal-textarea"
                        v-model="message"
                        placeholder="Type your message or use voice input..."
                        @keydown.enter="handleKeyDown"
                        @input="autoResizeModalTextarea"
                        :disabled="isRecording"
                    ></textarea>

                    <SpeechRecorder
                        :tutorType="tutorType"
                        :skill="skill"
                        :skillLevel="englishSkillLevel"
                        :learningObjectives="learningObjectives"
                        :isAITokenLimitReached="$parent.isAITokenLimitReached"
                        @recording-started="onRecordingStarted"
                        @recording-stopped="onRecordingStopped"
                        @message-sent="onVoiceMessageSent"
                        @message-error="onVoiceMessageError"
                    />

                    <button
                        class="send-btn"
                        @click="sendMessage()"
                        :disabled="isRecording"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="white"
                        >
                            <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.message-divider {
    border-top: 1px solid #e0e0e0;
    padding-top: 25px;
    padding-bottom: 20px;
}
.first-message {
    padding: 20px 0;
    margin-top: auto;
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
    padding-top: 10px;
    padding-bottom: 10px;
}

/* Increase text size for the popup modal mode */
.modal-mode-container .tutor-conversation {
    font-size: 1.1rem;
    line-height: 1.5;
}

.modal-mode-container .user-conversation {
    font-size: 1.1rem;
}

/* Increase the headings for better hierarchy */
.modal-mode-container .secondary-heading {
    font-size: 1.75rem;
}

.last-message {
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 20px;
}
.hovering-info-panel {
    position: absolute;
    z-index: 1000;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    width: fit-content;
    max-width: 300px;
    margin-bottom: 0 !important;
    background-color: white;
    border-radius: 4px;
    padding: 10px;
    pointer-events: auto;
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

.docked-chat-history {
    overflow-x: hidden;
    padding: 5px 10px;
    border-radius: 15px;
    min-height: 50px;
    width: 100%;
}

.modal-chat-history {
    height: 95%;
    width: 100%;
    overflow-y: auto;
    padding: 5px 10px;
    margin-bottom: 2px;
}

.modal-mode-waiting-response-chat {
    height: 90% !important;
    padding-bottom: 0px !important;
    margin-bottom: 0px !important;
    overflow-y: auto !important;
}

.modal-user-chat-div {
    display: flex;
    flex-direction: row;
    padding: 2px 0;
    gap: 10px;
    background-color: transparent;
    width: 100%;
}

.modal-chat-text-area {
    height: v-bind(modalTextAreaHeight);
    min-height: 60px;
    overflow-y: auto;
    word-wrap: break-word;
    font-size: 1.1rem;
    resize: none;
    padding: 5px;
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

.warn-text {
    color: yellow;
}

.tutor-chatting-section {
    height: 94% !important;
}

.tutor-chatting-waiting-response-section {
    height: 94% !important;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.8);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
}

.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.loading-text {
    font-size: 1.2rem;
    color: var(--primary-color);
}

/* Loading animation */
.assessment-loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--primary-color);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

.input-container {
    margin-top: 16px;
}

.input-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 8px 12px;
    border: 2px solid #9ca3af;
    border-radius: 12px;
    background: white;
    transition: border-color 0.3s ease;
}

.input-wrapper:focus-within {
    border-color: var(--primary-color);
}

.chat-text-area,
.modal-textarea {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    font-size: 16px;
    line-height: 1.4;
    min-height: 18px;
    max-height: 120px;
    padding: 4px 0;
    font-family: inherit;
    background: transparent;
    vertical-align: top;
    box-sizing: border-box;
    overflow-y: auto;
}

/* Modal mode input */
.modal-input {
    padding-bottom: 8px;
    padding-top: 4px;
    width: 100%;
    border-top: 1px solid #9ca3af;
}

.input-row {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 8px 12px;
    border: 2px solid #9ca3af;
    border-radius: 12px;
    background: white;
    transition: border-color 0.3s ease;
    min-height: 44px;
}

.input-row:focus-within {
    border-color: var(--primary-color);
}

.chat-text-area:disabled,
.modal-textarea:disabled {
    opacity: 0.6; /* Slightly more transparent */
    cursor: not-allowed;
    background: rgba(156, 163, 175, 0.1); /* Subtle gray background */
    color: #6b7280; /* Gray text */
}

/* Send button - unified for both modes */
.send-btn {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: var(--primary-color);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.send-btn:hover:not(:disabled) {
    background: #5145e4;
    transform: scale(1.05);
}

.send-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
}

.send-btn:disabled:hover {
    transform: none;
    background: var(--primary-color);
}

.send-btn.socratic-btn {
    background: #31315f;
}

.send-btn.assessing-btn {
    background: #7f1e1e;
}

.send-btn.socratic-btn:disabled:hover {
    background: #31315f;
}

.send-btn.assessing-btn:disabled:hover {
    background: #7f1e1e;
}

/* Responsive adjustments */
@media (max-width: 767px) {
    .modal-input {
        padding: 6px 0;
    }

    .input-wrapper,
    .input-row {
        padding: 6px 10px;
        gap: 10px;
        min-height: 40px;
    }

    .modal-textarea,
    .chat-text-area {
        min-height: 16px;
        padding: 2px 0;
    }

    .send-btn {
        width: 36px;
        height: 36px;
    }
}

@media (min-width: 768px) {
    .send-btn {
        width: 44px;
        height: 44px;
    }
}
</style>
