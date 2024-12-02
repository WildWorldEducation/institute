<script>
export default {
    data() {
        return {
            skillId: this.$route.params.skillId,
            // bind object
            question: {
                name: '',
                text: '',
                explanation: '',
                correct_answer: 1, // The default correct answer is the first one
                is_random: false
            },
            answers: [
                { text: '', show: true }, // Answer 1
                { text: '', show: true }, // Answer 2
                { text: '', show: true }, // Answer 3
                { text: '', show: true }, // Answer 4
                { text: '', show: true } // Answer 5
            ],
            // validate object
            validate: {
                validated: false,
                name: false,
                question: false,
                answer: false,
                explanation: false
            }
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

            if (this.question.text === '' || this.question.text === null) {
                this.validate.question = true;
                this.validate.validated = true;
            }

            this.answers.forEach((element) => {
                if (element.show == true && element.text == '') {
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

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: this.question,
                    answers: this.answers,
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
            if (this.answers[2].show == false) {
                this.answers[2].show = true;
            } else if (this.answers[3].show == false) {
                this.answers[3].show = true;
            } else if (this.answers[4].show == false) {
                this.answers[4].show = true;
            }
        },
        removeAnswer() {
            if (this.answers[4].show == true) {
                this.answers[4].show = false;
                if (this.question.correct_answer == 5)
                    this.question.correct_answer = 4;
            } else if (this.answers[3].show == true) {
                this.answers[3].show = false;
                if (this.question.correct_answer == 4)
                    this.question.correct_answer = 3;
            } else if (this.answers[2].show == true) {
                this.answers[2].show = false;
                if (this.question.correct_answer == 3)
                    this.question.correct_answer = 2;
            }
        }
    }
};
</script>

<template>
    <div class="container mt-3 pb-3">
        <h1 class="h1-stroke">Add Question</h1>

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
                            please name the question!
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
                            please enter a question!
                        </div>
                    </div>
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
                            please enter an answer!
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
                    <div class="mb-3">
                        <button
                            v-if="answers[4].show == false"
                            @click="addAnswer"
                            class="btn primary-btn"
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
                            please enter an explanation!
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-4">
                        <a class="btn red-btn" @click="$router.go(-1)"
                            >Cancel</a
                        >
                        <button class="btn primary-btn" @click="Submit()">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
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
