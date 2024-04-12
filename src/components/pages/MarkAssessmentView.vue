<script>
// Import the store.
import { useUnmarkedAnswersStore } from '../../stores/UnmarkedAnswersStore.js';
import { useAssessmentsStore } from '../../stores/AssessmentsStore.js';
import { useUsersStore } from '../../stores/UsersStore';
import { useSkillsStore } from '../../stores/SkillsStore';
import { useUserSkillsStore } from '../../stores/UserSkillsStore.js';

export default {
    setup() {
        const unmarkedAnswersStore = useUnmarkedAnswersStore();
        const assessmentsStore = useAssessmentsStore();
        const usersStore = useUsersStore();
        const skillsStore = useSkillsStore();
        const userSkillsStore = useUserSkillsStore();

        return {
            unmarkedAnswersStore,
            usersStore,
            skillsStore,
            assessmentsStore,
            userSkillsStore
        };
    },
    data() {
        return {
            assessmentId: this.$route.params.id,
            questionNumber: 0,
            answers: [],
            assessment: {},
            skill: {},
            studentName: '',
            skillName: '',
            showModal: false,
            modalMessage: '',
            isFailed: false
        };
    },
    async created() {
        // Preparing the questions and answers array. -------------------
        // Get saved unmarked essay answers.
        if (this.unmarkedAnswersStore.unmarkedAnswers.length == 0) {
            await this.unmarkedAnswersStore.getUnmarkedAnswers();
        }

        // Get unmarked assessments.
        if (this.assessmentsStore.assessments.length == 0) {
            await this.assessmentsStore.getAssessments();
        }

        // Add only the questions for this assessment to the array.
        for (
            let i = 0;
            i < this.unmarkedAnswersStore.unmarkedAnswers.length;
            i++
        ) {
            if (
                this.unmarkedAnswersStore.unmarkedAnswers[i].assessment_id ==
                this.assessmentId
            ) {
                this.answers.push(this.unmarkedAnswersStore.unmarkedAnswers[i]);
            }
        }

        // Add assessment data
        for (let i = 0; i < this.assessmentsStore.assessments.length; i++) {
            if (this.assessmentsStore.assessments[i].id == this.assessmentId) {
                this.assessment = this.assessmentsStore.assessments[i];
            }
        }

        // Get users.
        if (this.usersStore.users.length == 0) {
            await this.usersStore.getUsers();
        }
        // Add the student name.
        for (let i = 0; i < this.answers.length; i++) {
            for (let j = 0; j < this.usersStore.users.length; j++) {
                if (this.answers[i].studentId == this.usersStore.users[j].id) {
                    this.answers[i].studentUsername =
                        this.usersStore.users[j].username;
                    this.studentName = this.usersStore.users[j].username;
                }
            }
        }

        // Get list of all skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }
        // Add the skill name.
        for (let i = 0; i < this.answers.length; i++) {
            for (let j = 0; j < this.skillsStore.skillsList.length; j++) {
                if (
                    this.answers[i].skillId == this.skillsStore.skillsList[j].id
                ) {
                    this.answers[i].skillName =
                        this.skillsStore.skillsList[j].name;
                    this.skill = this.skillsStore.skillsList[j];
                    this.skillName = this.skillsStore.skillsList[j].name;
                }
            }
        }
    },
    computed: {},
    methods: {
        Next() {
            this.questionNumber++;
        },
        Previous() {
            this.questionNumber--;
        },
        async MarkCorrect(answer) {
            var url =
                '/assessments/' + answer.assessment_id + '/increase-grade';
            // go to the assessment, add 1 to score, delete 1 from questions left
            await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'content/type'
                },
                body: {}
            });

            // Check if the student passed.
            await this.assessmentsStore.getAssessments();
            for (let i = 0; i < this.assessmentsStore.assessments.length; i++) {
                if (
                    this.assessmentsStore.assessments[i].id ==
                    answer.assessment_id
                ) {
                    // update the assessment data
                    this.assessment = this.assessmentsStore.assessments[i];
                    if (
                        this.assessmentsStore.assessments[i]
                            .num_unmarked_questions_remaining == 0
                    ) {
                        if (
                            (this.assessmentsStore.assessments[i]
                                .current_score /
                                this.assessmentsStore.assessments[i]
                                    .total_score) *
                                100 >=
                            90
                        ) {
                            // Make skill mastered for this student.
                            this.MakeMastered(
                                this.assessmentsStore.assessments[i].student_id,
                                this.skill
                            );
                            this.modalMessage = 'Student passed';
                            this.showModal = true;
                            this.isFailed = false;
                        }
                        // There are a chance that the last question is correct but the student still fails
                        else {
                            // Notify admin that they failed.
                            this.modalMessage = 'Student failed';
                            this.showModal = true;
                            this.isFailed = true;
                        }
                    }
                }
            }

            // Delete from store and DB.
            this.unmarkedAnswersStore.deleteUnmarkedAnswer(answer);

            // Update assessmentsStore

            //  Now remove this element from the array.
            this.answers.splice(this.questionNumber, 1);
        },
        async MarkIncorrect(answer) {
            var url =
                '/assessments/' + answer.assessment_id + '/decrease-grade';
            // go to the assessment, subtract 1 to score, delete 1 from questions left
            fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'content/type'
                },
                body: {}
            });

            // Check if the student passed.
            await this.assessmentsStore.getAssessments();
            for (let i = 0; i < this.assessmentsStore.assessments.length; i++) {
                if (
                    this.assessmentsStore.assessments[i].id ==
                    answer.assessment_id
                ) {
                    if (
                        this.assessmentsStore.assessments[i]
                            .num_unmarked_questions_remaining == 0
                    ) {
                        if (
                            (this.assessmentsStore.assessments[i]
                                .current_score /
                                this.assessmentsStore.assessments[i]
                                    .total_score) *
                                100 <
                            90
                        ) {
                            // Notify admin that they failed.
                            this.modalMessage = 'Student failed';
                            this.isFailed = true;
                            this.showModal = true;
                        }
                    }
                }
            }

            // Delete from store and DB.
            this.unmarkedAnswersStore.deleteUnmarkedAnswer(answer);
            // Now remove this element from the array.
            this.answers.splice(this.questionNumber, 1);
        },
        async MakeMastered(studentId, skill) {
            await this.userSkillsStore.MakeMastered(studentId, skill);
        }
    }
};
</script>

<template>
    <div id="banner">
        <img src="/images/banners/general-banner.png" class="img-fluid" />
    </div>
    <div class="container mt-3 pb-4">
        <div id="page-tile">Unmarked Essay Questions</div>
        <div id="assessment-info">
            {{ this.studentName }} :
            {{ this.skillName }}
            <span id="date"> {{ this.assessment.date }}</span>
        </div>
        <div v-if="this.answers.length > 0">
            <div id="question-bg">
                <div class="d-flex w-100 flex-row justify-content-end">
                    <span
                        v-b-tooltip.hover
                        title="student need to have at least 90% score per total score to pass"
                        id="score-text"
                        class="me-2"
                    >
                        score:
                    </span>
                    <span
                        v-b-tooltip.hover
                        title="current score"
                        id="current-score"
                    >
                        {{ this.assessment.current_score }} /
                    </span>
                    <span title="total score" id="total-score">
                        {{ this.assessment.total_score }}
                    </span>
                </div>
                <div id="question" class="mb-3">
                    {{ this.answers[this.questionNumber].question }}
                </div>

                <div
                    id="answer"
                    class="mb-3"
                    v-html="this.answers[this.questionNumber].answer"
                ></div>
            </div>
        </div>
        <div class="d-flex flex-column" v-else>
            <p>No unmarked questions currently</p>
            <p v-if="isFailed">Student has failed</p>
            <p v-else>Student has passed and mastered this skill</p>
        </div>
        <div v-if="this.answers.length > 0" class="d-flex mt-3 mb-2">
            <div class="d-flex w-100 justify-content-center gap-2">
                <button
                    @click="MarkCorrect(this.answers[this.questionNumber])"
                    class="btn green-btn"
                >
                    Mark Correct
                </button>
                <button
                    @click="MarkIncorrect(this.answers[this.questionNumber])"
                    class="btn red-btn"
                >
                    Mark Incorrect
                </button>
            </div>

            <div
                v-if="this.answers.length > 0"
                class="d-flex justify-content-end"
            >
                <button
                    v-if="this.questionNumber > 0"
                    @click="Previous()"
                    class="btn green-btn me-2"
                >
                    Previous
                </button>
                <button
                    v-if="this.questionNumber != this.answers.length - 1"
                    @click="Next()"
                    class="btn green-btn"
                >
                    Next
                </button>
            </div>
        </div>
    </div>
    <!-- Modal Section -->
    <div v-if="showModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <p class="modal-message">{{ modalMessage }}</p>
                <div style="display: flex; gap: 10px">
                    <router-link class="btn green-btn" to="/"
                        >To Hub</router-link
                    >
                    <button class="btn purple-btn" @click="showModal = false">
                        OK
                    </button>
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
</style>
