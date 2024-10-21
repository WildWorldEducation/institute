<script>
import router from '../../router';

export default {
    data() {
        return {
            skillId: this.$route.params.skillId,
            // bind object
            question: {
                name: '',
                question: '',
                explanation: '',
                question_text: "",
                correct_answer: 1, // The default correct answer is the first one
                is_random: false,
            },
            // validate object
            validate: {
                validated: false,
                name: false,
                question: false,
                answer: false,
                explanation: false
            },
            answers: [
                { text: "" }, // Answer 1
                { text: "" }, // Answer 2
            ],
            submitted: false,
            submittedQuestion: null,
            submittedAnswers: []
        };
    },
    methods: {
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

            this.answers.forEach(element => {
                if(element.text == ''){
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
            alert("Form validated!");
            return;
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.question.name,
                    question: this.question.question,
                    correct_answer: this.question.correctAnswer,
                    incorrect_answer_1: this.question.incorrectAnswer1,
                    incorrect_answer_2: this.question.incorrectAnswer2,
                    incorrect_answer_3: this.question.incorrectAnswer3,
                    incorrect_answer_4: this.question.incorrectAnswer4,
                    explanation: this.question.explanation,
                    skill_id: this.skillId
                })
            };
            var url = '/questions/mc-questions/add';
            fetch(url, requestOptions)
                .then(() => {
                    alert('Question added');
                })
                .then(() => {
                    this.$router.go(-1);
                });
        },
        addAnswer() {
            if (this.answers.length < 5) {
                this.answers.push({ text: "" });
            }
        },
        removeAnswer(index) {
            if (this.answers.length > 2) {
                this.answers.splice(index, 1);
                // Adjust correct answer selection if necessary
                if (this.question.correct_answer > this.answers.length) {
                this.question.correct_answer = this.answers.length;
                }
            }
        },
        submitQuestion() {
            // Create a copy of the question and answers
            this.submittedQuestion = { ...this.question };
            this.submittedAnswers = [...this.answers];

            // If random order is enabled, shuffle the answers
            if (this.question.is_random) {
                this.submittedAnswers = this.shuffleArray(this.submittedAnswers);
            }

            // Mark the question as submitted to show the preview
            this.submitted = true;
            },
            shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }
    }
};
</script>

<template>
    <div id="banner">
        <img src="/images/banners/general-banner.png" class="image-fluid" />
    </div>
    <div class="container mt-3 pb-3">
        <div class="row">
            <div class="col-10 d-flex align-items-end">
                <h2 id="header-tile">Add Question</h2>
                <img src="/images/recurso-69.png" id="header-icon" />
            </div>
        </div>
        <div class="main-content-container container-fluid mt-4">
            <div class="row p-0">
                <div id="form-container" class="col-lg-6 p-4">
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
                            class="form-validate"
                        >
                            please enter a question content !
                        </div>
                    </div>
                    <div v-for="(answer, index) in answers" :key="index" class="mb-3">
                        <label class="form-label">Answer {{ index + 1 }}:</label>
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
                                class="btn red-btn"
                            >
                                <svg width="20" height="20" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. --><path d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                            </button>
                        </div>
                        <div
                            v-if="
                                validate.validated && answer.text === ''
                            "
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
                            <label :for="'correct' + (index + 1)" class="">Set as correct</label>
                        </div>
                    </div>

                    <!-- Add Answer Button (max 5 answers) -->
                    <div class="mb-3">
                    <button
                        v-if="answers.length < 5"
                        @click="addAnswer"
                        class="btn purple-btn"
                    >
                        <svg width="20" height="20" fill="#ffffff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. --><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"/></svg>
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
                    <label for="randomOrder" class="form-check-label">Show answers in random order</label>
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

<style>
.answer-option{
    gap: 5px;
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
