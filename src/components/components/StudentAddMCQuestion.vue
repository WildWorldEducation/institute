<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();

        return {
            userDetailsStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.id,
            // bind object
            question: {
                question: '',
                correctAnswer: '',
                incorrectAnswer1: '',
                incorrectAnswer2: '',
                incorrectAnswer3: '',
                incorrectAnswer4: '',
                question: '',
                explanation: ''
            },
            // validate object
            validate: {
                validated: false,
                question: false,
                correctAnswer: false,
                incorrectAnswer1: false,
                incorrectAnswer2: false,
                incorrectAnswer3: false,
                incorrectAnswer4: false,
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
                // Make skill mastered for this student.
                this.$parent.MakeMastered(this.$parent.skill);
                this.questionAddedModal = true;
                this.questionSubmitted = true;
            });
        },
        // show the already submit message for a short period of time
        showSubmittedMess() {
            this.submittedMess = true;
            setTimeout(() => {
                this.submittedMess = false;
            }, 2000);
        }
    }
};
</script>

<template>
    <div class="student-add-result pb-3 w-100">
        <div class="main-content-container container-fluid">
            <div class="row p-0">
                <div id="form-container" class="col p-4">
                    <!-- Congratulation text when user is pass but not submit a question yet -->
                    <div v-if="!questionSubmitted" class="d-flex flex-column">
                        <div id="congrats-tile">
                            Well done, you have passed!
                        </div>
                        <p>
                            Please create your own question on this subject
                            before you master it.
                        </p>
                    </div>
                    <div
                        v-if="questionSubmitted"
                        class="d-flex flex-column shake"
                    >
                        <div id="congrats-tile">
                            Congratulation you have mastered this skill
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="last_name" class="form-label"
                            >Question</label
                        >
                        <textarea
                            v-model="question.question"
                            rows="1"
                            class="form-control"
                        >
                        </textarea>
                        <div
                            v-if="
                                validate.question &&
                                (question.question === '' ||
                                    question.question === null)
                            "
                            :class="['form-validate', { shake: reshake }]"
                            @animationend="reshake = false"
                        >
                            please enter a question content !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Correct answer</label>
                        <input
                            v-model="question.correctAnswer"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.correctAnswer &&
                                (question.correctAnswer === '' ||
                                    question.correctAnswer === null)
                            "
                            :class="['form-validate', { shake: reshake }]"
                            @animationend="reshake = false"
                        >
                            please enter a correct answer !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Wrong answer 1</label>
                        <input
                            v-model="question.incorrectAnswer1"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.incorrectAnswer1 &&
                                (question.incorrectAnswer1 === '' ||
                                    question.incorrectAnswer1 === null)
                            "
                            :class="['form-validate', { shake: reshake }]"
                            @animationend="reshake = false"
                        >
                            please enter incorrect answer 1 !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Wrong answer 2</label>
                        <input
                            v-model="question.incorrectAnswer2"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.incorrectAnswer2 &&
                                (question.incorrectAnswer2 === '' ||
                                    question.incorrectAnswer2 === null)
                            "
                            :class="['form-validate', { shake: reshake }]"
                            @animationend="reshake = false"
                        >
                            please enter incorrect answer 2 !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Wrong answer 3</label>
                        <input
                            v-model="question.incorrectAnswer3"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.incorrectAnswer3 &&
                                (question.incorrectAnswer3 === '' ||
                                    question.incorrectAnswer3 === null)
                            "
                            :class="['form-validate', { shake: reshake }]"
                            @animationend="reshake = false"
                        >
                            please enter incorrect answer 3 !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Wrong answer 4</label>
                        <input
                            v-model="question.incorrectAnswer4"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.incorrectAnswer4 &&
                                (question.incorrectAnswer4 === '' ||
                                    question.incorrectAnswer4 === null)
                            "
                            :class="['form-validate  ', { shake: reshake }]"
                            @animationend="reshake = false"
                        >
                            please enter incorrect answer 4 !
                        </div>
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
                            :class="['form-validate ', { shake: reshake }]"
                            @animationend="reshake = false"
                        >
                            please enter a explanation !
                        </div>
                    </div>
                    <div class="d-flex justify-content-end gap-4">
                        <!-- Show a warning if user already submitted else submit as normal -->
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
