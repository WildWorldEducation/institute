<script>
// Import

export default {
    setup() {},
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
            mcQuestions: [],
            correctIndex: []
        };
    },
    mounted() {
        this.assessmentResult = this.$parent.assessmentStatus;

        // convert the date time string to readable format
        // pass undefined in first argument to make the function working with all language
        this.finishDate = this.$parent.finishTime.toLocaleString(undefined, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        this.finishTime = this.$parent.finishTime.toLocaleTimeString();

        this.score = this.$parent.score;
        this.totalScore = this.$parent.numMCQuestions;
        this.scorePercent = Math.floor((this.score / this.totalScore) * 100);

        // only get mc question
        this.mcQuestions = this.$parent.questions.filter(
            (question) => question.questionType === 'mc'
        );

        this.correctIndex = [1];
        console.log(this.mcQuestions);
    },
    methods: {}
};
</script>

<template>
    <div class="container mt-3">
        <div class="page-tile">Assessment Result</div>
        <!-- Assessment Info -->
        <div class="assessment-info">
            <div>
                <span class="info-label">Result:</span>
                <span
                    :class="
                        assessmentResult == 'pass'
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
                        v-if="assessmentResult === 'failed'"
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
                        v-if="assessmentResult === 'pass'"
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
                <span class="info-value">{{ score }} out {{ totalScore }}</span>
                ( {{ scorePercent }}%)
                <span>*</span>
            </div>
        </div>
        <!-- Question list include right answer and explain -->
        <div class="mc-question-result" v-for="question of mcQuestions">
            <!-- The label indicate user answer right or wrong -->
            <div
                :class="
                    question.userAnswer === 1 ? 'correct-label' : 'wrong-label'
                "
            >
                {{ question.userAnswer === 1 ? 'Correct !!' : 'Incorrect !!' }}
            </div>
            <div class="question">
                {{ question.question }}
            </div>
            <div class="d-flex flex-column">
                <!-- Question options -->
                <div
                    v-for="(answerOption, index) in question.answerOptions"
                    class="form-check my-3"
                >
                    <label class="control control-checkbox">
                        <!-- We have three different style for each type of answer -->
                        <div
                            :class="[
                                'my-auto mx-2 me-4 answer-option ',
                                answerOption.index == 1
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
                                    answerOption.index == 1 &&
                                    question.userAnswer !== 1
                                "
                                class="correct-indicate"
                            >
                                (correct answer)</span
                            >
                            <!-- show user answer text if it user answer -->
                            <span
                                v-if="
                                    answerOption.index !== 1 &&
                                    question.userAnswer == answerOption.index
                                "
                                class="user-answer-indicate"
                            >
                                (your answer)</span
                            >
                            <!-- congrats if student answer is correct -->
                            <span
                                v-if="
                                    answerOption.index == 1 &&
                                    question.userAnswer == 1
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
                            :disabled="answerOption.index != 1"
                        />
                        <div class="control_indicator">
                            <!-- Check if this is the correct answer -->
                            <div
                                v-if="answerOption.index == 1"
                                class="checked"
                            ></div>
                        </div>
                    </label>
                </div>
                <!-- Explain part -->
                <div>
                    {{ question.explanation }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.hover-cursor:hover {
    cursor: pointer;
}

.page-tile {
    color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
    font-size: 1.75rem;
}

.assessment-info {
    padding: 15px 20px;
    background-color: #f0f1f3;
    border-radius: 5px;
    border: #8f7bd6 1px solid;
    margin: 10px 0px;
    width: fit-content;
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
    left: 0px;
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
    left: 0px;
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
/**-------------------------------------  */
/* A lot of CSS to styling check box */
.control {
    font-family: 'Poppins' sans-serif;
    display: block;
    position: relative;
    padding-left: 30px;
    margin-bottom: 5px;
    padding-top: 3px;
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 5px;
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
/* End of check box styling */

.mc-question-result {
    padding: 15px 25px;
    margin: 10px 0px;
    background-color: #f0f1f3;
    border: #7b7b7b solid 1px;
    border-radius: 5px;
    position: relative;
    padding-top: 55px;
}
</style>
