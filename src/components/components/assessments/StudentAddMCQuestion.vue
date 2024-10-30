<script>
import router from '../../../router/index.js';
import { RouterLink } from 'vue-router';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import { useUserSkillsStore } from '../../../stores/UserSkillsStore.js';
import { useSkillTreeStore } from '../../../stores/SkillTreeStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const userSkillsStore = useUserSkillsStore();
        const skillTreeStore = useSkillTreeStore();

        return {
            userDetailsStore,
            userSkillsStore,
            skillTreeStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.id,
            // bind object
            question: {
                name: '',
                text: '',
                explanation: '',
                correct_answer: 1, // The default correct answer is the first one
                is_random: false
            },
            answers: [
                { text: '' }, // Answer 1
                { text: '' } // Answer 2
            ],
            // validate object
            validate: {
                validated: false,
                name: false,
                question: false,
                answer: false,
                explanation: false
            },
            studentId: null,
            // Flag for re-animate shake animation
            reshake: false,
            questionAddedModal: false,
            questionSubmitted: false,
            submittedMess: false
        };
    },
    async mounted() {},
    methods: {
        Submit() {
            this.studentId = this.userDetailsStore.userId;
            // Reset the validate flag before re-checking
            this.validate.validated = false;
            // Check data before fetching
            if (
                this.question.question === '' ||
                this.question.question === null
            ) {
                this.validate.question = true;
                this.validate.validated = true;
            }
            if (
                this.question.correctAnswer === '' ||
                this.question.correctAnswer === null
            ) {
                this.validate.correctAnswer = true;
                this.validate.validated = true;
            }
            if (
                this.question.incorrectAnswer1 === '' ||
                this.question.incorrectAnswer1 === null
            ) {
                this.validate.incorrectAnswer1 = true;
                this.validate.validated = true;
            }
            if (
                this.question.incorrectAnswer2 === '' ||
                this.question.incorrectAnswer2 === null
            ) {
                this.validate.incorrectAnswer2 = true;
                this.validate.validated = true;
            }

            if (
                this.question.incorrectAnswer3 === '' ||
                this.question.incorrectAnswer3 === null
            ) {
                this.validate.incorrectAnswer3 = true;
                this.validate.validated = true;
            }

            if (
                this.question.incorrectAnswer4 === '' ||
                this.question.incorrectAnswer4 === null
            ) {
                this.validate.incorrectAnswer4 = true;
                this.validate.validated = true;
            }

            if (
                this.question.explanation === '' ||
                this.question.explanation === null
            ) {
                this.validate.explanation = true;
                this.validate.validated = true;
            }

            if (this.validate.validated) {
                // reshake the warning line
                this.reshake = true;
                return; // stop the submit operation if there something violated validate condition
            }

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: this.question.question,
                    correct_answer: this.question.correctAnswer,
                    incorrect_answer_1: this.question.incorrectAnswer1,
                    incorrect_answer_2: this.question.incorrectAnswer2,
                    incorrect_answer_3: this.question.incorrectAnswer3,
                    incorrect_answer_4: this.question.incorrectAnswer4,
                    explanation: this.question.explanation,
                    skill_id: this.skillId,
                    student_id: this.studentId
                })
            };
            var url = '/questions/student-mc-questions/add';
            fetch(url, requestOptions).then(() => {
                // This fires the method on the parent (AssessmentResult), which is chained to fire the method on its parent.
                this.questionAddedModal = true;
                this.questionSubmitted = true;
                window.scrollTo(0, 0);
            });
        },
        // show the already submit message for a short period of time
        showSubmittedMess() {
            this.submittedMess = true;
            setTimeout(() => {
                this.submittedMess = false;
            }, 2000);
        },
        skipAddingQuestion() {
            this.questionSubmitted = true;
            window.scrollTo(0, 0);
        }
    }
};
</script>

<template>
    <div class="student-add-result pb-3 w-100">
        <div class="main-content-container container-fluid">
            <div class="row p-0">
                <RouterLink
                    v-if="questionSubmitted"
                    class="btn btn-light purple-btn"
                    style="width: 136px"
                    to="/skills"
                >
                    Back to skills
                </RouterLink>
                <div
                    v-if="!questionSubmitted"
                    id="form-container"
                    class="col p-4"
                >
                    <!-- Congratulation text when user is pass but not submit a question yet -->
                    <div v-if="!questionSubmitted" class="d-flex flex-column">
                        <div id="congrats-tile">
                            Well done, you have passed!
                        </div>
                        <p>
                            Would you like to add your own question on this
                            subject?
                        </p>
                    </div>
                    <div
                        v-if="questionSubmitted"
                        class="d-flex flex-column shake"
                    >
                        <div id="congrats-tile">
                            Thank you for submitting your question.
                        </div>
                    </div>
                    <!-- Form for question -->
                    <div class="mb-3">
                        <label for="question_name" class="form-label"
                            >Question Name</label
                        >
                        <input
                            v-model="question.name"
                            type="text"
                            class="form-control"
                            id="question_name"
                        />
                        <div
                            v-if="
                                validate.name &&
                                (question.name === '' || question.name === null)
                            "
                            class="form-validate"
                        >
                            please enter a question name !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="last_name" class="form-label"
                            >Question</label
                        >
                        <textarea
                            v-model="question.text"
                            rows="1"
                            class="form-control"
                        >
                        </textarea>
                        <div
                            v-if="
                                validate.question &&
                                (question.text === '' || question.text === null)
                            "
                            class="form-validate"
                        >
                            please enter a question content !
                        </div>
                    </div>
                    <div
                        v-for="(answer, index) in answers"
                        :key="index"
                        class="mb-3"
                    >
                        <label class="form-label"
                            >Answer {{ index + 1 }}:</label
                        >
                        <div class="d-flex answer-option">
                            <input
                                v-model="answer.text"
                                :id="'answer' + (index + 1)"
                                placeholder="Enter answer option"
                                type="text"
                                class="form-control"
                            />
                            <!-- Remove Answer Button (visible only if more than 2 answers) -->
                            <button
                                v-if="answers.length > 2"
                                @click="removeAnswer(index)"
                                data-v-ea3cd1bf=""
                                type="button"
                                class="btn btn red-btn p-2"
                                title="Delete answer"
                            >
                                <svg
                                    data-v-ea3cd1bf=""
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="15"
                                    height="15"
                                    fill="white"
                                >
                                    <path
                                        data-v-ea3cd1bf=""
                                        d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                                    ></path>
                                </svg>
                            </button>
                        </div>
                        <div
                            v-if="validate.validated && answer.text === ''"
                            class="form-validate"
                        >
                            please enter a correct answer !
                        </div>
                        <!-- Correct Answer Radio Button -->
                        <div class="form-check">
                            <input
                                class="form-check-input"
                                type="radio"
                                :id="'correct' + (index + 1)"
                                name="correctAnswer"
                                :value="index + 1"
                                v-model="question.correct_answer"
                            />
                            <label :for="'correct' + (index + 1)" class=""
                                >Set as correct</label
                            >
                        </div>
                    </div>

                    <!-- Add Answer Button (max 5 answers) -->
                    <div class="mb-3">
                        <button
                            v-if="answers.length < 5"
                            @click="addAnswer"
                            class="btn purple-btn"
                        >
                            <svg
                                width="20"
                                height="20"
                                fill="#ffffff"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                            >
                                <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                                <path
                                    d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"
                                />
                            </svg>
                            Add Answer
                        </button>
                    </div>

                    <!-- Random Order Toggle -->
                    <div class="mb-3 form-check">
                        <input
                            type="checkbox"
                            id="randomOrder"
                            v-model="question.is_random"
                            class="form-check-input"
                        />
                        <label for="randomOrder" class="form-check-label"
                            >Show answers in random order</label
                        >
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Explanation</label>
                        <textarea
                            v-model="question.explanation"
                            class="form-control"
                            rows="3"
                        ></textarea>
                        <div
                            v-if="
                                validate.explanation &&
                                (question.explanation === '' ||
                                    question.explanation === null)
                            "
                            class="form-validate"
                        >
                            please enter a explanation !
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-4">
                        <!-- Show a warning if user already submitted else submit as normal -->
                        <button
                            class="btn btn-light"
                            @click="skipAddingQuestion"
                        >
                            Skip
                        </button>
                        <button
                            class="btn purple-btn"
                            @click="
                                !questionSubmitted
                                    ? Submit()
                                    : showSubmittedMess()
                            "
                        >
                            Submit
                        </button>
                    </div>
                    <div v-if="submittedMess" class="form-validate shake">
                        You already submitted a question !!
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Show modal when user successfully add a question -->
    <div v-if="questionAddedModal">
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
                        Your question have been submitted
                    </div>
                </div>
                <div class="d-flex flex-row-reverse">
                    <button
                        type="button"
                        class="btn green-btn"
                        @click="questionAddedModal = false"
                    >
                        ok
                    </button>
                    <RouterLink
                        v-if="questionSubmitted"
                        class="btn btn-light purple-btn mx-2"
                        to="/skills"
                    >
                        Back to skills
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.student-add-result {
    margin-top: 10px;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.red-btn:hover {
    background-color: #cc3535;
    color: white;
}

.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.purple-btn:hover {
    background-color: #a48be6;
    color: white;
}

.purple-btn:focus {
    background-color: #a48be6;
    color: white;
}

#header-tile {
    color: #667085;
    font-family: 'Poppins' sans-serif;
    /* font-size: 2.375rem; */
    font-weight: 900;
    line-height: 41px;
    letter-spacing: 0em;
    text-align: left;
    margin-top: auto;
    margin-bottom: 0px;
}

#header-icon {
    margin-left: 10px;
    width: 108px;
    height: 61px;
}

#form-container {
    background-color: #f0f1f3;

    border-radius: 5px;
    border: #8f7bd6 1px solid;
}

.form-label {
    color: #344054;
    font-family: 'Poppins' sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0em;
    text-align: left;
}

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}

.form-control:focus {
    border-color: white;
    box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 12px #a48be6;
}

#congrats-tile {
    font-size: 15px;
    color: rgb(4, 192, 4);
    font-weight: 500;
}

/* Shake animation for waring line */
.shake {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

@keyframes shake {
    10%,
    90% {
        transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
        transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
        transform: translate3d(4px, 0, 0);
    }
}
</style>
