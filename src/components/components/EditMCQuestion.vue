<script>
import router from '../../router';

export default {
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
            }
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
        }
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

                    <div class="d-flex justify-content-end gap-4">
                        <a class="btn red-btn" @click="$router.go(-1)"
                            >Cancel</a
                        >
                        <button class="btn purple-btn" @click="Submit()">
                            Submit
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
