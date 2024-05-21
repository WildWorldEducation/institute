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
            studentId: null
        };
    },
    methods: {
        Submit() {
            this.studentId = this.$parent.userDetailsStore.userId;
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
            fetch(url, requestOptions)
                .then(() => {
                    alert('Question added');
                })
                .then(() => {
                    // Make skill mastered for this student.
                    this.$parent.MakeMastered(this.$parent.skill);
                    this.$parent.passModal = true;
                });
        }
    }
};
</script>

<template>
    <div class="container mt-3 pb-3">
        <div class="row">
            <div class="col-10">
                <h4 id="header-tile">Well done, you have passed!</h4>
                <p>
                    Please create your own question on this subject before you
                    master it.
                </p>
            </div>
        </div>
        <div class="main-content-container container-fluid mt-4">
            <div class="row p-0">
                <div id="form-container" class="col p-4">
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
                            class="form-validate"
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
                            class="form-validate"
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
                            class="form-validate"
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
                            class="form-validate"
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

<style>
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
