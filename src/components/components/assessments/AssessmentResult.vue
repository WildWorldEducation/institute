<script>
// Import
import StudentAddMCQuestion from './StudentAddMCQuestion.vue';
import NextSkillSuggestion from './NextSkillSuggestion.vue';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import FlagModals from './../FlagModals.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    components: {
        StudentAddMCQuestion,
        NextSkillSuggestion,
        FlagModals
    },
    data() {
        return {
            assessmentResult: '',
            finishDate: '',
            finishTime: '',
            parent: '',
            score: 0,
            // number of mc question is total score, default value to 1 to avoid divine with 0
            totalScore: 1,
            scorePercent: 0,
            questions: [],
            essayQuestionsLength: 0,
            correctIndex: [],
            // modal show state data
            passModal: false,
            failsModal: false,
            waitForMarkModal: false,
            questionToFlagId: 0,
            questionToFlagType: '',
            showFlaggingModal: false
        };
    },
    props: ['skill', 'isManualEssayMarking'],
    mounted() {
        this.assessmentResult = this.$parent.assessmentStatus;

        // Check if modal has already been shown for this assessment
        const modalShownKey = `modalShown_${this.$route.params.id}`;
        const modalAlreadyShown = sessionStorage.getItem(modalShownKey);

        // Only show modal if it hasn't been shown before
        if (!modalAlreadyShown) {
            // Show modal based on assessment status
            switch (this.assessmentResult) {
                case 'You passed':
                    this.passModal = true;
                    break;
                case 'You failed':
                    this.failsModal = true;
                    break;
                case 'wait for essay answers to be mark':
                    this.waitForMarkModal = true;
                    break;
                default:
                    break;
            }

            // Mark that modal has been shown
            sessionStorage.setItem(modalShownKey, 'true');
        }

        // Rest of your existing mounted() code stays the same...
        this.finishDate = this.$parent.finishTime.toLocaleString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        this.finishTime = this.$parent.finishTime.toLocaleTimeString();

        this.score = this.$parent.score;
        if (this.isManualEssayMarking == 1)
            this.totalScore = this.$parent.numMCQuestions;
        else this.totalScore = this.$parent.questions.length;

        if (this.totalScore !== 0) {
            this.scorePercent = Math.floor(
                (this.score / this.totalScore) * 100
            );
        }

        if (this.isManualEssayMarking == 1) {
            this.questions = this.$parent.questions.filter(
                (question) => question.questionType === 'mc'
            );
            this.essayQuestionsLength =
                this.$parent.questions.length - this.questions.length;
        } else {
            this.questions = this.$parent.questions;
        }

        this.correctIndex = [1];
    },
    methods: {
        setQuestionForFlagging(questionToFlagId, questionToFlagType) {
            this.questionToFlagId = questionToFlagId;
            this.questionToFlagType = questionToFlagType;
            this.showFlaggingModal = true;
        }
    }
};
</script>

<template>
    <div class="container pb-3">
        <div class="d-flex flex-md-row flex-column gap-3">
            <div>
                <!-- Assessment Info -->
                <div class="assessment-info">
                    <div>
                        <span class="info-label">Result:</span>
                        <span
                            :class="
                                assessmentResult == 'You passed'
                                    ? 'student-pass'
                                    : 'student-fail'
                            "
                            >{{ assessmentResult }}
                            <!-- failed icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 64 512"
                                fill="red"
                                height="14"
                                width="14"
                                class="status-icon"
                                v-if="assessmentResult === 'You failed'"
                            >
                                <path
                                    d="M64 64c0-17.7-14.3-32-32-32S0 46.3 0 64V320c0 17.7 14.3 32 32 32s32-14.3 32-32V64zM32 480a40 40 0 1 0 0-80 40 40 0 1 0 0 80z"
                                />
                            </svg>
                            <!-- pass icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                fill="green"
                                height="14"
                                width="14"
                                class="mb-1"
                                v-if="assessmentResult === 'You passed'"
                            >
                                <path
                                    d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"
                                />
                            </svg>
                        </span>
                    </div>
                    <div>
                        <span class="info-label">Finish Date: </span>
                        <span class="info-value">
                            {{ finishDate }}
                            <span id="finish-time"> at {{ finishTime }}</span>
                        </span>
                    </div>
                    <div
                        class="hover-cursor"
                        b-on-hover
                        title="you need to score above 80% to pass the assessment"
                    >
                        <span class="info-label">Score: </span>
                        <span class="info-value"
                            >{{ score }} out {{ totalScore }}</span
                        >
                        ( {{ scorePercent }}%)
                        <span>*</span>
                    </div>
                    <div
                        class="essay-warning"
                        v-if="
                            isManualEssayMarking == 1 &&
                            essayQuestionsLength != 0
                        "
                    >
                        There are {{ essayQuestionsLength }} answers that needed
                        to be mark by your instructor
                    </div>
                </div>
                <!-- Next Skill Recommendation -->
                <NextSkillSuggestion v-if="assessmentResult === 'You passed'" />
            </div>
            <!-- Student can add a question if they pass -->
            <StudentAddMCQuestion v-if="assessmentResult === 'You passed'" />
        </div>
        <!-- Question list include right answer and explain -->
        <div class="mc-question-result" v-for="question of questions">
            <!-- Flag button -->
            <div
                v-if="question.questionType == 'mc'"
                b-tooltip.hover
                title="flag this question for review"
                @click="setQuestionForFlagging(question.id, 'mc_question')"
                class="flagging-icon"
                style="height: 50px"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    style="height: 22px; opacity: 0.5"
                >
                    <path
                        fill="#8f7bd6"
                        d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"
                    />
                </svg>
            </div>
            <!-- The label indicate user answer right or wrong -->
            <div
                :class="
                    question.userAnswer == question.correct_answer ||
                    question.isCorrect == true
                        ? 'correct-label'
                        : 'wrong-label'
                "
            >
                {{
                    question.userAnswer == question.correct_answer ||
                    question.isCorrect == true
                        ? 'Correct !!'
                        : 'Incorrect !!'
                }}
            </div>
            <div class="question">
                {{ question.question }}
            </div>
            <div class="d-flex flex-column">
                <!-- For MC Questions Only -->
                <!-- Question options -->
                <div
                    v-if="question.questionType == 'mc'"
                    v-for="(answerOption, index) in question.answerOptions"
                    class="form-check my-3"
                >
                    <label class="control control-checkbox">
                        <!-- We have three different style for each type of answer -->
                        <div
                            :class="[
                                'my-auto mx-2 me-4 answer-option ',
                                answerOption.index == question.correct_answer
                                    ? ' correct-answer'
                                    : question.userAnswer == answerOption.index
                                    ? 'user-answer'
                                    : ' incorrect-answer'
                            ]"
                        >
                            {{ answerOption.option }}
                            <!-- show this extra text if it the correct answer and user answer is wrong -->
                            <span
                                v-if="
                                    answerOption.index ==
                                        question.correct_answer &&
                                    question.userAnswer !==
                                        question.correct_answer
                                "
                                class="correct-indicate"
                            >
                                (correct answer)</span
                            >
                            <!-- show user answer text if it user answer -->
                            <span
                                v-if="
                                    answerOption.index !==
                                        question.correct_answer &&
                                    question.userAnswer == answerOption.index
                                "
                                class="user-answer-indicate"
                            >
                                (your answer)</span
                            >
                            <!-- congrats if student answer is correct -->
                            <span
                                v-if="
                                    answerOption.index ==
                                        question.correct_answer &&
                                    question.userAnswer ==
                                        question.correct_answer
                                "
                                class="correct-indicate"
                            >
                                (you are correct !)</span
                            >
                        </div>
                        <input
                            type="radio"
                            name="nodeType"
                            :value="answerOption.index"
                            :disabled="
                                answerOption.index != question.correct_answer
                            "
                        />
                        <div class="control_indicator">
                            <!-- Check if this is the correct answer -->
                            <div
                                v-if="
                                    answerOption.index ==
                                    question.correct_answer
                                "
                                class="checked"
                            ></div>
                        </div>
                    </label>
                </div>
                <!-- For Essay Questions Only -->
                <div v-else-if="question.questionType == 'essay'">
                    <span class="explain-label">Your answer:</span>
                    <div class="explain-text">
                        {{ question.userAnswer }}
                    </div>
                </div>
                <!-- For Image Questions Only -->
                <div v-else-if="question.questionType == 'image'">
                    <span class="explain-label">Your answer:</span>

                    <img
                        v-for="(answer, index) in question.userAnswer.length"
                        :src="question.userAnswer[index]"
                        width="80"
                    />
                </div>
                <!-- Question explanation -->
                <div
                    v-if="
                        question.questionType == 'mc' ||
                        question.isCorrect == false
                    "
                    class="explain-answer"
                >
                    <div class="explain-label">Explanation:</div>
                    <div class="explain-text">
                        {{ question.explanation }}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- ------------------------------------------------------ -->
    <!-- __________________ Modal Components __________________ -->
    <!-- Show modal to tell student if they passed or failed first -->
    <div v-if="passModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <div class="d-flex align-content-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="50"
                        height="50"
                        fill="green"
                    >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"
                        />
                    </svg>
                    <div class="my-auto ms-2">
                        Well done! You passed and have now mastered the skill!
                    </div>
                </div>
                <div class="d-flex flex-row-reverse">
                    <button
                        type="button"
                        class="btn green-btn"
                        @click="passModal = false"
                    >
                        Great!
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- Fail Modal-->
    <div v-if="failsModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <div class="d-flex align-content-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        fill="red"
                        width="50"
                        height="50"
                    >
                        <path
                            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24V264c0 13.3-10.7 24-24 24s-24-10.7-24-24V152c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                        />
                    </svg>
                    <div class="my-auto ms-2">
                        You failed this time, try again later!
                    </div>
                </div>
                <div class="d-flex flex-row-reverse">
                    <button
                        type="button"
                        class="btn red-btn"
                        @click="failsModal = false"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- Wait for mark modal -->
    <div v-if="waitForMarkModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <div>
                    There is at least one question that needs to be marked by
                    your instructor. Please check whether you passed later.
                </div>
                <div class="d-flex flex-row-reverse">
                    <button
                        type="button"
                        class="btn green-btn"
                        @click="waitForMarkModal = false"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- Flagging Component -->
    <FlagModals
        v-if="showFlaggingModal"
        :userId="userDetailsStore.userId"
        :contentType="questionToFlagType"
        :contentId="questionToFlagId"
    />
</template>

<style scoped>
.hover-cursor:hover {
    cursor: pointer;
}

/* Button Styling */

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.green-btn:hover {
    background-color: #3eb3a3;
    color: white;
}

/* +++ --- +++ */

.assessment-info {
    padding: 15px 20px;
    background-color: #f0f1f3;
    border-radius: 5px;
    border: #8f7bd6 1px solid;
    margin: 10px 0px;
    width: fit-content;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.info-label {
    font-size: 16px;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    color: rgb(94, 93, 93);
    margin-right: 10px;
}

.info-value {
    font-size: 16px;
    font-family: 'Poppins', sans-serif;
}

#finish-time {
    font-size: 12px;
    color: rgb(65, 61, 61);
}

.essay-warning {
    color: rgb(197, 197, 24);
    font-size: 13px;
    font-family: 'Poppins', sans-serif;
    font-weight: 550;
}

.status-icon {
    margin-left: -4px;
    margin-bottom: 4px;
}

.student-pass {
    color: rgb(6, 219, 6);
    font-weight: 600;
    font-size: 16px;
}

.student-fail {
    color: red;
    font-weight: 600;
    font-size: 16px;
}

.correct-label {
    padding: 10px 15px;
    top: 0px;
    left: -10px;
    background-color: green;
    color: white;
    font-size: 16px;
    font-weight: 600;
    width: 145px;
    position: absolute;
    top: 5px;
    border-top-right-radius: 50px;
    border-bottom-right-radius: 50px;
}

.wrong-label {
    padding: 10px 15px;
    top: 5px;
    left: -10px;
    background-color: red;
    color: white;
    font-size: 16px;
    font-weight: 600;
    width: 145px;
    position: absolute;
    border-top-right-radius: 50px;
    border-bottom-right-radius: 50px;
}

.question {
    margin-top: 10px;
    font-size: 18px;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    padding-bottom: 10px;
    border-bottom: #6670857e 1px solid;
}

.incorrect-answer {
    font-size: 10px;
    color: #7b7b7b;
}

.user-answer {
    font-size: 14px;
    color: #574444;
}

.correct-indicate {
    color: green;
    font-size: 14px;
    font-weight: 500;
}

.user-answer-indicate {
    color: red;
    font-size: 14px;
    font-weight: 500;
}

.explain-answer {
    display: flex;
    flex-direction: column;
    border-top: #667085 1px solid;
    padding-top: 10px;
    margin-top: 5px;
}

.explain-label {
    font-size: 16px;
    color: #4c4b50;
    font-weight: 600;
    font-family: 'Poppins', sans-serif;
}

.explain-text {
    background-color: white;
    padding: 10px 15px;
    border-radius: 10px;
    min-height: 100px;
}
/**-------------------------------------  */
/* A lot of CSS to styling check box */
.control {
    font-family: 'Poppins', sans-serif;
    display: block;
    position: relative;
    padding-left: 30px;
    margin-bottom: 5px;
    padding-top: 3px;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.control > span {
    font-weight: 500;
    font-size: 0.938rem;
    color: #667085;
    text-align: center;
}
.control input {
    position: absolute;
    z-index: -1;
    opacity: 0;
}
.control_indicator {
    position: absolute;
    left: 0;
    height: 29.09px;
    width: 29.09px;
    background: #f9f5ff;
    border: 2px solid #9c7eec;
    border-radius: 60px;
}
.control:hover input ~ .control_indicator,
.control input:focus ~ .control_indicator {
    background: #e7ddf6;
}

.plus-svg:hover {
    cursor: pointer;
}
.control input:checked ~ .control_indicator {
    background: #f9f5ff;
}
.control:hover input:not([disabled]):checked ~ .control_indicator,
.control input:checked:focus ~ .control_indicator {
    background: #f9f5ff;
}
.control input:disabled ~ .control_indicator {
    background: #e6e6e6;
    opacity: 0.6;
    pointer-events: none;
}
.control_indicator:after {
    box-sizing: unset;
    content: '';
    position: absolute;
    display: none;
}
.control input:checked ~ .control_indicator:after {
    display: block;
}
.control-checkbox .control_indicator:after {
    left: 4px;
    top: 5px;
    width: 13.58px;
    height: 9.33px;
    border: solid #9c7eec;
    border-width: 0px 0px 2.9px 2.9px;
    transform: rotate(-45deg);
}

.checked {
    left: 5px;
    top: 6px;
    width: 13.58px;
    height: 9.33px;
    border: solid #9c7eec;
    border-width: 0px 0px 2.9px 2.9px;
    transform: rotate(-45deg);
    position: absolute;
}

.control-checkbox input:disabled ~ .control_indicator:after {
    border-color: #7b7b7b;
}
.control-checkbox .control_indicator::before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 4.5rem;
    height: 4.5rem;
    margin-left: -1.3rem;
    margin-top: -1.3rem;
    background: #9c7eec;
    border-radius: 3rem;
    opacity: 0.6;
    z-index: 99999;
    transform: scale(0);
}

.control-checkbox input + .control_indicator::before {
    animation: s-ripple 250ms ease-out;
}
.control-checkbox input:checked + .control_indicator::before {
    animation-name: s-ripple-dup;
}
/* _______ End of check box styling _______ */

.mc-question-result {
    padding: 15px 25px;
    margin: 10px 0px;
    background-color: #f0f1f3;
    border: #7b7b7b solid 1px;
    border-radius: 5px;
    position: relative;
    padding-top: 55px;
}

/* _______ The Modal styling _______ */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 1;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 600px;
    /* Could be more or less, depending on screen size */
}

.modal-content-flag {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 300px;
    /* Could be more or less, depending on screen size */
}
/* End of Modal Styling */

/* Flaggin style */
.flagging-icon {
    position: absolute;
    right: 20px;
    top: 20px;
    cursor: pointer;
}
.flagging-icon:hover {
    scale: 1.2;
}

/* =============== ||| ================ */

/*Style for Mobile Devices */
@media (max-width: 480px) {
    .mc-question-result {
        padding: 5px 15px;
        padding-top: 55px;
    }
}
</style>
