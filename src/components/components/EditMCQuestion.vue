<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();

        return {
            userDetailsStore
        };
    },
    data() {
        return {
            questionId: this.$route.params.id,
            question: {},
            answers: [],
            // validate object
            validate: {
                validated: false,
                name: false,
                question: false,
                answer: false,
                explanation: false
            },
            originalQuestion: {},
            originalAnswers: [],
            comment: '',
            isLoaded: false
        };
    },
    async created() {
        await this.getQuestion();
        // Get data before loading template.
        this.isLoaded = true;
    },
    methods: {
        async getQuestion() {
            await fetch('/questions/mc/show/' + this.questionId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.question = data.question;
                    this.answers = data.answers;
                    // Temporary variables, for variable answer option length.
                    this.answers[0].show = 1;
                    this.answers[1].show = 1;
                    this.originalQuestion = { ...data.question };
                    this.originalAnswers = JSON.parse(
                        JSON.stringify(data.answers)
                    );
                });
        },
        // If edit is from an admin or editor.
        Submit() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: this.question,
                    answers: this.answers
                })
            };

            var url = '/questions/mc/' + this.questionId + '/edit';
            fetch(url, requestOptions).then(() => {
                // Delete flag if exist
                let dismissFlagId = this.$route.query.dismissFlagId;
                if (dismissFlagId) {
                    fetch('/content-flags/' + dismissFlagId, {
                        method: 'DELETE'
                    }).finally(() => {
                        alert('Question edited successfully.');
                        this.$router.back();
                    });
                } else {
                    alert('Question edited successfully.');
                    this.$router.back();
                }
            });
        },
        // If edit is from a student or instructor.
        SubmitForReview() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userDetailsStore.userId,
                    question: this.question,
                    answers: this.answers,
                    comment: this.comment
                })
            };
            var url = '/questions/mc/' + this.questionId + '/edit-for-review';
            fetch(url, requestOptions).then(() => {
                alert(
                    `This edit is being submitted for review.\nWe do this to prevent misinformation and sloppy wording from being added. If you would like to become an editor and help with this, please reach out.`
                );
                this.$router.back();
            });
        },
        ValidateForm(submissionType) {
            // Reset the validate flag before re-checking
            this.validate.validated = false;
            // Check data before fetching
            if (this.question.name === '' || this.question.name === null) {
                this.validate.name = true;
                this.validate.validated = true;
            }

            if (this.question.text === '' || this.question.text === null) {
                this.validate.question = true;
                this.validate.validated = true;
            }

            this.answers.forEach((element) => {
                if (element.text == '') {
                    this.validate.validated = true;
                }
            });

            if (
                this.question.explanation === '' ||
                this.question.explanation === null
            ) {
                this.validate.explanation = true;
                this.validate.validated = true;
            }

            if (this.validate.validated) {
                return; // stop the submit operation if there something violated validate condition
            }

            if (submissionType == 'submission') {
                this.Submit();
            } else if (submissionType == 'submissionForReview') {
                this.SubmitForReview();
            }
        },
        setFormUpdated() {
            this.formUpdated = true;
        },
        closeTab() {
            window.close();
        },
        addAnswer() {
            if (
                this.userDetailsStore.role == 'admin' ||
                this.userDetailsStore.role == 'editor'
            ) {
                if (this.answers[2].show == 0) {
                    this.answers[2].show = 1;
                } else if (this.answers[3].show == 0) {
                    this.answers[3].show = 1;
                } else if (this.answers[4].show == 0) {
                    this.answers[4].show = 1;
                }
            }
        },
        removeAnswer() {
            if (
                this.userDetailsStore.role == 'admin' ||
                this.userDetailsStore.role == 'editor'
            ) {
                if (this.answers[4].show == 1) {
                    this.answers[4].show = 0;
                    if (this.question.correct_answer == 5)
                        this.question.correct_answer = 4;
                } else if (this.answers[3].show == 1) {
                    this.answers[3].show = 0;
                    if (this.question.correct_answer == 4)
                        this.question.correct_answer = 3;
                } else if (this.answers[2].show == 1) {
                    this.answers[2].show = 0;
                    if (this.question.correct_answer == 3)
                        this.question.correct_answer = 2;
                }
            }
        }
    },
    computed: {
        isFormChanged() {
            return (
                JSON.stringify(this.originalQuestion) !=
                    JSON.stringify(this.question) ||
                JSON.stringify(this.originalAnswers) !=
                    JSON.stringify(this.answers)
            );
        }
    }
};
</script>

<template>
    <div class="container mt-3 pb-3">
        <div class="row">
            <div class="col-10 d-flex align-items-end">
                <h2 id="header-tile">Edit Question</h2>
            </div>
        </div>
        <p class="mt-2">
            <em>Note: blank questions will not display in the quiz.</em>
        </p>
        <div class="main-content-container container-fluid mt-4">
            <div class="row p-0">
                <div id="form-container" class="col-lg-7 p-4">
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
                            rows="2"
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
                            please enter a question !
                        </div>
                    </div>

                    <!-- Answers -->
                    <div
                        v-for="(answer, index) in answers"
                        v-show="answer.show"
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

                    <div
                        v-if="
                            isLoaded &&
                            (this.userDetailsStore.role == 'admin' ||
                                this.userDetailsStore.role == 'editor')
                        "
                        class="mb-3"
                    >
                        <!-- Remove Answer Button (visible only if more than 2 answers) -->
                        <button
                            v-if="answers[2].show == true"
                            @click="removeAnswer()"
                            data-v-ea3cd1bf=""
                            type="button"
                            class="btn red-btn p-2 mb-2"
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
                                ></path></svg
                            >&nbsp;Remove Answer
                        </button>

                        <!-- Add Answer Button (max 5 answers) -->

                        <button
                            v-if="answers[4].show == false"
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
                            please enter an explanation !
                        </div>
                    </div>
                    <!--Optional comment if this is a student/instructor submitting an edit for review --->
                    <div
                        v-if="
                            userDetailsStore.role == 'instructor' ||
                            userDetailsStore.role == 'student'
                        "
                        class="mb-3"
                    >
                        <label class="form-label"
                            >Optional: explain this edit</label
                        >
                        <textarea
                            v-model="comment"
                            class="form-control"
                            rows="3"
                        ></textarea>
                    </div>

                    <div class="d-flex justify-content-end gap-4">
                        <button class="btn red-btn" @click="closeTab()">
                            Cancel
                        </button>
                        <button
                            v-if="
                                userDetailsStore.role == 'admin' ||
                                userDetailsStore.role == 'editor'
                            "
                            class="btn purple-btn"
                            @click="ValidateForm('submission')"
                            :disabled="!isFormChanged"
                        >
                            Submit
                        </button>
                        <button
                            v-else-if="
                                userDetailsStore.role == 'instructor' ||
                                userDetailsStore.role == 'student'
                            "
                            class="btn purple-btn"
                            @click="ValidateForm('submissionForReview')"
                            :disabled="!isFormChanged"
                        >
                            <div class="d-none d-md-block">
                                Submit for review
                            </div>
                            <!-- Pencil Into Square Icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                fill="white"
                                height="20"
                                width="20"
                                class="d-md-none"
                            >
                                <path
                                    d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.answer-option {
    gap: 3px;
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
    background-color: #7f56d9;
    color: white;
}

.purple-btn:focus {
    background-color: #7f56d9;
    color: white;
}

#header-tile {
    color: #667085;
    font-family: 'Poppins' sans-serif;
    font-size: 2.375rem;
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
    background-color: #e4ecf4;
    border-radius: 12px;
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
</style>
