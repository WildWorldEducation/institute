<script>
import router from '../../router';
// Import the store.
import { useStudentMCQuestionsStore } from '../../stores/StudentMCQuestionsStore.js';
import { useUsersStore } from '../../stores/UsersStore';
import { useSkillsStore } from '../../stores/SkillsStore';

export default {
    setup() {
        const studentMCQuestionsStore = useStudentMCQuestionsStore();
        const usersStore = useUsersStore();
        const skillsStore = useSkillsStore();

        return {
            studentMCQuestionsStore,
            usersStore,
            skillsStore
        };
    },
    data() {
        return {
            studentQuestionId: this.$route.params.id,
            question: {
                name: '',
                question: '',
                correct_answer: '',
                incorrect_answer_1: '',
                incorrect_answer_2: '',
                incorrect_answer_3: '',
                incorrect_answer_4: '',
                question: '',
                explanation: '',
                skill_id: ''
            },
            isEditMode: false,
            studentName: null,
            skillName: null
        };
    },
    async created() {
        // Get the student question.
        await this.studentMCQuestionsStore.getStudentMCQuestions();
        for (
            let i = 0;
            i < this.studentMCQuestionsStore.studentMCQuestions.length;
            i++
        ) {
            if (
                this.studentMCQuestionsStore.studentMCQuestions[i].id ==
                this.studentQuestionId
            ) {
                this.question =
                    this.studentMCQuestionsStore.studentMCQuestions[i];
            }
        }

        // Get the student's name.
        await this.usersStore.getUsers();
        for (let i = 0; i < this.usersStore.users.length; i++) {
            if (this.question.student_id == this.usersStore.users[i].id) {
                this.studentName = this.usersStore.users[i].username;
            }
        }

        // Get the skill's name.
        if (this.skillsStore.skillsList.length == 0)
            await this.skillsStore.getSkillsList();
        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.question.skill_id == this.skillsStore.skillsList[i].id) {
                this.skillName = this.skillsStore.skillsList[i].name;
            }
        }
    },
    methods: {
        deleteStudentQuestion() {
            if (confirm('Delete this question?')) {
                this.studentMCQuestionsStore.deleteStudentMCQuestion(
                    this.studentQuestionId
                );
                // Return to hub page.
                router.push({ name: 'hub' });
            }
        },
        saveToQuestionBank() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'User: ' + this.question.student_id,
                    question: this.question.question,
                    correct_answer: this.question.correct_answer,
                    incorrect_answer_1: this.question.incorrect_answer_1,
                    incorrect_answer_2: this.question.incorrect_answer_2,
                    incorrect_answer_3: this.question.incorrect_answer_3,
                    incorrect_answer_4: this.question.incorrect_answer_4,
                    explanation: this.question.explanation,
                    skill_id: this.question.skill_id
                })
            };
            var url = '/questions/mc-questions/add';
            fetch(url, requestOptions).then(() => {
                this.studentMCQuestionsStore.deleteStudentMCQuestion(
                    this.studentQuestionId
                );
                // Return to hub page.
                router.push({ name: 'hub' });
            });
        },
        editMode() {
            this.isEditMode = true;
        }
    }
};
</script>

<template>
    <div id="banner">
        <img src="/images/banners/general-banner.png" class="img-fluid" />
        <div class="container mt-3 pb-3">
            <div class="row">
                <div class="col-10">
                    <h2 id="header-tile">Student: {{ studentName }}</h2>
                    <h2 id="header-tile">Skill: {{ skillName }}</h2>
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
                                :disabled="!isEditMode"
                                v-model="question.question"
                                rows="1"
                                class="form-control"
                            >
                            </textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Correct answer</label>
                            <input
                                :disabled="!isEditMode"
                                v-model="question.correct_answer"
                                type="text"
                                class="form-control"
                            />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Wrong answer 1</label>
                            <input
                                :disabled="!isEditMode"
                                v-model="question.incorrect_answer_1"
                                type="text"
                                class="form-control"
                            />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Wrong answer 2</label>
                            <input
                                :disabled="!isEditMode"
                                v-model="question.incorrect_answer_2"
                                type="text"
                                class="form-control"
                            />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Wrong answer 3</label>
                            <input
                                :disabled="!isEditMode"
                                v-model="question.incorrect_answer_3"
                                type="text"
                                class="form-control"
                            />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Wrong answer 4</label>
                            <input
                                :disabled="!isEditMode"
                                v-model="question.incorrect_answer_4"
                                type="text"
                                class="form-control"
                            />
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Explanation</label>
                            <textarea
                                :disabled="!isEditMode"
                                v-model="question.explanation"
                                class="form-control"
                                rows="3"
                            ></textarea>
                        </div>

                        <div class="d-flex justify-content-end gap-4">
                            <a class="btn red-btn" @click="editMode()">Edit</a>
                            <a
                                class="btn red-btn"
                                @click="deleteStudentQuestion()"
                                >Delete</a
                            >
                            <button
                                class="btn purple-btn"
                                @click="saveToQuestionBank()"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
h2 {
    color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

#banner {
    width: 100%;
    height: fit-content;
}

.image-fluid {
    width: 100%;
    height: auto;
}

#question-bg {
    background: #f2edffcc;
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

#page-tile {
    font-family: 'Poppins';
    font-size: 40px;
    font-weight: 900;
    line-height: 28px;
    text-align: left;
    color: #8f7bd6;
    padding-top: 23px;
    margin-top: 23px;
    margin-bottom: 23px;
    margin-left: 17px;
}

#assessment-info {
    font-family: 'Poppins';
    font-size: 28px;
    font-weight: 900;
    line-height: 28px;
    text-align: left;
    color: #8f7bd6;
    margin-left: 17px;
    padding-top: 23px;
    padding-bottom: 23px;
}

#score-text {
    font-family: 'Poppins';
    color: #8f7bd6;
    font-weight: 800;
}

#current-score {
    font-family: 'Poppins';
    color: #8f7bd6;
    font-weight: 700;
}

#total-score {
    font-family: 'Poppins';
    color: #8f7bd6;
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

.purple-btn:hover {
    background-color: #a48ef3;
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

    #page-tile {
        font-size: 22px;
        margin-bottom: 10px;
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
