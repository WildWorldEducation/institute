<script>
import router from '../../router';
// Import the store.
import { useStudentMCQuestionsStore } from '../../stores/StudentMCQuestionsStore.js';
import { useUsersStore } from '../../stores/UsersStore';
import { useSkillsStore } from '../../stores/SkillsStore';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';

export default {
    setup() {
        const studentMCQuestionsStore = useStudentMCQuestionsStore();
        const usersStore = useUsersStore();
        const skillsStore = useSkillsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            studentMCQuestionsStore,
            usersStore,
            skillsStore,
            userDetailsStore
        };
    },
    data() {
        return {
            studentQuestionId: this.$route.params.id,
            question: {},
            answers: [
                { text: '', show: true },
                { text: '', show: true },
                { text: '', show: true },
                { text: '', show: true },
                { text: '', show: true }
            ],
            // validate object
            validate: {
                validated: false,
                name: false,
                question: false,
                answer: false,
                explanation: false
            },
            isEditMode: false,
            studentName: null,
            skillName: null,
            skillId: null
        };
    },
    async created() {
        if (this.usersStore.users.length == 0) await this.usersStore.getUsers();

        if (this.skillsStore.skillsList.length == 0)
            await this.skillsStore.getSkillsList();

        // Get the student question.
        await this.getStudentQuestion();
    },
    methods: {
        async getStudentQuestion() {
            fetch('/questions/student-mc-questions/' + this.studentQuestionId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.question = data.question;
                    this.answers = data.answers;

                    // Get the student's name.
                    for (let i = 0; i < this.usersStore.users.length; i++) {
                        if (
                            this.question.student_id ==
                            this.usersStore.users[i].id
                        ) {
                            this.studentName =
                                this.usersStore.users[i].username;
                        }
                    }
                    // Get the skill's name.
                    for (
                        let i = 0;
                        i < this.skillsStore.skillsList.length;
                        i++
                    ) {
                        if (
                            this.question.skill_id ==
                            this.skillsStore.skillsList[i].id
                        ) {
                            this.skillName =
                                this.skillsStore.skillsList[i].name;
                        }
                    }
                });
        },
        deleteStudentQuestion() {
            if (confirm('Delete this question?')) {
                this.studentMCQuestionsStore.deleteStudentMCQuestion(
                    this.studentQuestionId
                );
                // Return to hub page.
                router.go(-1);
            }
        },
        saveToQuestionBank() {
            this.question.name = 'User: ' + this.question.student_id;

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: this.question,
                    answers: this.answers,
                    skill_id: this.question.skill_id
                })
            };
            var url = '/questions/mc-questions/add';
            fetch(url, requestOptions).then(() => {
                this.studentMCQuestionsStore.deleteStudentMCQuestion(
                    this.studentQuestionId
                );
                // Return to hub page.
                router.go(-1);
            });
        },
        editMode() {
            this.isEditMode = true;
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
    <div class="container p-3 bg-light rounded">
        <h1 class="heading">Review Suggested Question</h1>
        <p>
            {{ studentName }} suggested the following question, for the skill
            {{ skillName }}
        </p>

        <div class="main-content-container container-fluid">
            <div class="row p-0">
                <div id="form-container" class="col p-4">
                    <!-- Question -->
                    <div class="mb-3">
                        <h2 class="secondary-heading h4">Question</h2>
                        <textarea
                            :disabled="!isEditMode"
                            rows="1"
                            v-model="question.text"
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

                    <div
                        v-for="(answer, index) in answers"
                        v-show="answer.show"
                        :key="index"
                        class="mb-3"
                    >
                        <h2 class="secondary-heading h4">
                            Answer {{ index + 1 }}
                        </h2>
                        <div class="d-flex answer-option">
                            <input
                                :disabled="!isEditMode"
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
                                :disabled="!isEditMode"
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

                    <div class="d-flex align-items-center">
                        <!-- Remove Answer Button (visible only if more than 2 answers) -->
                        <button
                            v-if="answers[2].show == true"
                            @click="removeAnswer()"
                            data-v-ea3cd1bf=""
                            type="button"
                            class="btn btn red-btn p-2 me-2"
                            title="Delete answer"
                            :disabled="!isEditMode"
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
                            &nbsp;Remove Answer
                        </button>

                        <!-- Add Answer Button (max 5 answers) -->
                        <button
                            v-if="answers[4].show == false"
                            @click="addAnswer"
                            class="btn btn add-answer-btn primary-btn p-2"
                            :disabled="!isEditMode"
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
                            :disabled="!isEditMode"
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
                        <h2 class="secondary-heading h4">Explanation</h2>
                        <textarea
                            :disabled="!isEditMode"
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

                    <div
                        v-if="
                            userDetailsStore.role == 'admin' ||
                            userDetailsStore.role == 'editor'
                        "
                        class="d-flex justify-content-end gap-4"
                    >
                        <a class="btn red-btn" @click="editMode()">Edit</a>
                        <a class="btn red-btn" @click="deleteStudentQuestion()"
                            >Delete</a
                        >
                        <button
                            class="btn primary-btn"
                            @click="saveToQuestionBank()"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#question-bg {
    background: var(--primary-color);
    border-radius: 12px;
    padding: 10px;
    margin-left: 34px;
}

#question-bg span:hover {
    cursor: pointer;
}

#question {
    font-family: 'Poppins';
    font-size: 17px;
    font-weight: 500;
    line-height: 28px;
    text-align: left;
    color: #667085;
}

#date {
    font-family: 'Poppins';
    font-size: 14px;
    font-weight: 400;
    line-height: 28px;
    text-align: left;
    color: #667085;
}

#answer {
    font-family: 'Poppins';
    font-size: 16px;
    font-weight: 100;
    line-height: 28px;
    text-align: left;
    color: #667085;
    padding-left: 17px;
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: white;
    border-radius: 15px;
}

#assessment-info {
    font-family: 'Poppins';
    font-size: 28px;
    font-weight: 900;
    line-height: 28px;
    text-align: left;
    color: var(--primary-color);
    margin-left: 17px;
    padding-top: 23px;
    padding-bottom: 23px;
}

#score-text {
    font-family: 'Poppins';
    color: var(--primary-color);
    font-weight: 800;
}

#current-score {
    font-family: 'Poppins';
    color: var(--primary-color);
    font-weight: 700;
}

#total-score {
    font-family: 'Poppins';
    color: var(--primary-color);
    font-weight: 800;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    height: 44px;
    border-radius: 8px;
    box-shadow: 0px 1px 2px 0px #1018280d;
}

.green-btn:hover {
    background-color: #46f7df;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    height: 44px;
}

.red-btn:hover {
    background-color: #fc7d7d;
}

.add-answer-btn{
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    max-height: 44px;
}

/* The Warning Modal */
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
    width: 300px;
    /* Could be more or less, depending on screen size */
}

.modal-message {
    font-size: 20px;
    font-weight: 500;
    color: #667085;
}

/* Styling for phone */
@media (max-width: 575px) {
    #question-bg {
        margin-left: 0px;
    }

    #assessment-info {
        font-size: 18px;
        padding-top: 5px;
    }

    #question {
        font-size: 17px;
    }

    .red-btn {
        font-size: 12px;
    }

    .green-btn {
        font-size: 12px;
    }
}

/* Styling for tablet */
@media (min-width: 576px) and (max-width: 992px) {
    #question-bg {
        margin-left: 0px;
    }
}
</style>
