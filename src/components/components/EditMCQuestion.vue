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
            // validate object
            validate: {
                validated: false,
                name: false,
                question: false,
                correct_answer: false,
                incorrect_answer1: false,
                incorrect_answer2: false,
                incorrect_answer3: false,
                incorrect_answer4: false,
                explanation: false
            },
            comment: ''
        };
    },
    created() {
        this.getQuestion();
    },
    methods: {
        getQuestion() {
            fetch('/questions/mc/show/' + this.questionId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => (this.question = data));
        },
        // If edit is from an admin or editor.
        Submit() {
            // Reset the validate flag before re-checking
            this.validate.validated = false;
            // Check data before fetching
            if (this.question.name === '' || this.question.name === null) {
                this.validate.name = true;
                this.validate.validated = true;
            }

            if (
                this.question.question === '' ||
                this.question.question === null
            ) {
                this.validate.question = true;
                this.validate.validated = true;
            }

            if (
                this.question.correct_answer === '' ||
                this.question.correct_answer === null
            ) {
                this.validate.correct_answer = true;
                this.validate.validated = true;
            }

            if (
                this.question.incorrect_answer_1 === '' ||
                this.question.incorrect_answer_1 === null
            ) {
                this.validate.incorrect_answer_1 = true;
                this.validate.validated = true;
            }

            if (
                this.question.incorrect_answer_2 === '' ||
                this.question.incorrect_answer_2 === null
            ) {
                this.validate.incorrect_answer_2 = true;
                this.validate.validated = true;
            }

            if (
                this.question.incorrect_answer_3 === '' ||
                this.question.incorrect_answer_3 === null
            ) {
                this.validate.incorrect_answer_3 = true;
                this.validate.validated = true;
            }

            if (
                this.question.incorrect_answer_4 === '' ||
                this.question.incorrect_answer_4 === null
            ) {
                this.validate.incorrect_answer_4 = true;
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
                return; // stop the submit operation if there something violated validate condition
            }
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.question.name,
                    question: this.question.question,
                    correct_answer: this.question.correct_answer,
                    incorrect_answer_1: this.question.incorrect_answer_1,
                    incorrect_answer_2: this.question.incorrect_answer_2,
                    incorrect_answer_3: this.question.incorrect_answer_3,
                    incorrect_answer_4: this.question.incorrect_answer_4,
                    correct_answer: this.question.correct_answer,
                    explanation: this.question.explanation
                })
            };

            var url = '/questions/mc/' + this.questionId + '/edit';
            fetch(url, requestOptions).then(() => {
                alert('Question edited successfully.');
                this.$router.back();
            });
        },
        // If edit is from a student or instructor.
        SubmitForReview() {}
    }
};
</script>

<template>
    <div id="banner">
        <img
            src="/images/banners/edit-mastery-skill-banner.png"
            class="image-fluid"
        />
    </div>
    <div class="container mt-3 pb-3">
        <div class="row">
            <div class="col-10 d-flex align-items-end">
                <h2 id="header-tile">Edit Question</h2>
                <img src="/images/recurso-69.png" id="header-icon" />
            </div>
        </div>
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
                            v-model="question.question"
                            rows="2"
                            class="form-control"
                        >
                        </textarea>
                        <div
                            v-if="
                                validate.question &&
                                (question.question === '' ||
                                    question.question === null)
                            "
                            class="form-validate"
                        >
                            please enter a question content !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Correct answer</label>
                        <input
                            v-model="question.correct_answer"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.correct_answer &&
                                (question.correct_answer === '' ||
                                    question.correct_answer === null)
                            "
                            class="form-validate"
                        >
                            please enter a correct answer !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Wrong answer 1</label>
                        <input
                            v-model="question.incorrect_answer_1"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.incorrect_answer_1 &&
                                (question.incorrect_answer_1 === '' ||
                                    question.incorrect_answer_1 === null)
                            "
                            class="form-validate"
                        >
                            please enter incorrect answer 1 !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Wrong answer 2</label>
                        <input
                            v-model="question.incorrect_answer_2"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.incorrect_answer_2 &&
                                (question.incorrect_answer_2 === '' ||
                                    question.incorrect_answer_2 === null)
                            "
                            class="form-validate"
                        >
                            please enter incorrect answer 2 !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Wrong answer 3</label>
                        <input
                            v-model="question.incorrect_answer_3"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.incorrect_answer_3 &&
                                (question.incorrect_answer_3 === '' ||
                                    question.incorrect_answer_3 === null)
                            "
                            class="form-validate"
                        >
                            please enter incorrect answer 3 !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Wrong answer 4</label>
                        <input
                            v-model="question.incorrect_answer_4"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.incorrect_answer_4 &&
                                (question.incorrect_answer_4 === '' ||
                                    question.incorrect_answer_4 === null)
                            "
                            class="form-validate"
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
                            class="form-validate"
                        >
                            please enter a explanation !
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
                        <a class="btn red-btn" @click="$router.go(-1)"
                            >Cancel</a
                        >
                        <button
                            v-if="
                                userDetailsStore.role == 'admin' ||
                                userDetailsStore.role == 'editor'
                            "
                            class="btn purple-btn"
                            @click="Submit()"
                        >
                            Submit
                        </button>
                        <button
                            v-else-if="
                                userDetailsStore.role == 'instructor' ||
                                userDetailsStore.role == 'student'
                            "
                            class="btn purple-btn"
                            @click="SubmitForReview()"
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
