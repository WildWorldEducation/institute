<script>
// Import the store.
import { useUnmarkedAnswersStore } from '../../stores/UnmarkedAnswersStore.js'
import { useAssessmentsStore } from '../../stores/AssessmentsStore.js'
import { useUsersStore } from '../../stores/UsersStore'
import { useSkillsStore } from '../../stores/SkillsStore'

export default {
    setup() {
        const unmarkedAnswersStore = useUnmarkedAnswersStore();
        const assessmentsStore = useAssessmentsStore();
        const usersStore = useUsersStore();
        const skillsStore = useSkillsStore();

        return {
            unmarkedAnswersStore, usersStore, skillsStore, assessmentsStore
        }
    },
    data() {
        return {
            assessmentId: this.$route.params.id,
            questionNumber: 0,
            answers: [],
            assessment: {}
        }
    },
    async created() {
        // Preparing the questions and answers array. -------------------
        // Get saved unmarked essay answers.
        if (this.unmarkedAnswersStore.unmarkedAnswers.length == 0) {
            await this.unmarkedAnswersStore.getUnmarkedAnswers()
        }

        // Get unmarked assessments.
        if (this.assessmentsStore.assessments.length == 0) {
            await this.assessmentsStore.getAssessments()
        }

        // Add only the questions for this assessment to the array.
        for (let i = 0; i < this.unmarkedAnswersStore.unmarkedAnswers.length; i++) {
            if (this.unmarkedAnswersStore.unmarkedAnswers[i].assessment_id == this.assessmentId) {
                this.answers.push(this.unmarkedAnswersStore.unmarkedAnswers[i])
            }
        }

        // Get users.
        if (this.usersStore.users.length == 0) {
            await this.usersStore.getUsers()
        }
        // Add the student name.
        for (let i = 0; i < this.answers.length; i++) {
            for (let j = 0; j < this.usersStore.users.length; j++) {
                if (this.answers[i].studentId == this.usersStore.users[j].id) {
                    this.answers[i].studentUsername = this.usersStore.users[j].username
                }
            }
        }

        // Get list of all skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList()
        }
        // Add the skill name.
        for (let i = 0; i < this.answers.length; i++) {
            for (let j = 0; j < this.skillsStore.skillsList.length; j++) {
                if (this.answers[i].skillId == this.skillsStore.skillsList[j].id) {
                    this.answers[i].skillName = this.skillsStore.skillsList[j].name
                }
            }
        }
    },
    computed: {
    },
    methods: {
        Next() {
            this.questionNumber++;
        },
        Previous() {
            this.questionNumber--;
        },
        async MarkCorrect(answer) {
            var url = '/assessments/' + answer.assessment_id + '/increase-grade'
            // go to the assessment, add 1 to score, delete 1 from questions left                 
            await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'content/type'
                },
                body: {}
            })

            // Check if the student passed.
            await this.assessmentsStore.getAssessments();
            for (let i = 0; i < this.assessmentsStore.assessments.length; i++) {
                if (this.assessmentsStore.assessments[i].id == answer.assessment_id) {
                    if (this.assessmentsStore.assessments[i].num_unmarked_questions_remaining == 0) {
                        if ((this.assessmentsStore.assessments[i].current_score / this.assessmentsStore.assessments[i].total_score) * 100 >= 90) {
                            // Make skill mastered for this student.
                            this.MakeMastered(this.assessmentsStore.assessments[i].student_id, this.assessmentsStore.assessments[i].skill_id)
                            alert("Student passed")
                        }
                    }
                }
            }

            // Delete from store and DB.
            this.unmarkedAnswersStore.deleteUnmarkedAnswer(answer)
            //  Now remove this element from the array.
            this.answers.splice(this.questionNumber, 1);
        },
        async MarkIncorrect(answer) {
            var url = '/assessments/' + answer.assessment_id + '/decrease-grade'
            // go to the assessment, subtract 1 to score, delete 1 from questions left      
            fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'content/type'
                },
                body: {}
            })

            // Check if the student passed.
            await this.assessmentsStore.getAssessments();
            for (let i = 0; i < this.assessmentsStore.assessments.length; i++) {
                if (this.assessmentsStore.assessments[i].id == answer.assessment_id) {

                    if (this.assessmentsStore.assessments[i].num_unmarked_questions_remaining == 0) {

                        if ((this.assessmentsStore.assessments[i].current_score / this.assessmentsStore.assessments[i].total_score) * 100 < 90) {
                            // Notify admin that they failed.
                            alert("Student failed")
                        }
                    }
                }
            } 

            // Delete from store and DB.
            this.unmarkedAnswersStore.deleteUnmarkedAnswer(answer)
            // Now remove this element from the array.
            this.answers.splice(this.questionNumber, 1);
        },
        MakeMastered(studentId, skillId) {
            var url = "/user-skills/mastered/" + studentId + "/" + skillId;
            fetch(url)
                .then(() => {
                    // Get all the child skills, as have to make them unlocked.
                    const childSkills = []
                    for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                        if (this.skillsStore.skillsList[i].parent == skillId) {
                            childSkills.push(this.skillsStore.skillsList[i])
                        }
                    }
                    let subSkills = []
                    // Make them accessible/unlocked if regular type skills.
                    for (let i = 0; i < childSkills.length; i++) {
                        if (childSkills[i].type == 'regular') {
                            this.MakeAccessible(childSkills[i].id)
                        }
                        // If super type skills, make their subskills accessible.
                        else if (childSkills[i].type == 'super') {
                            for (let j = 0; j < this.skillsStore.skillsList.length; j++) {
                                if (this.skillsStore.skillsList[j].parent == childSkills[i].id
                                    && this.skillsStore.skillsList[j].type == 'sub') {
                                    subSkills.push(this.skillsStore.skillsList[j].id)
                                }
                            }
                        }
                    }
                    for (let i = 0; i < subSkills.length; i++) {
                        this.MakeAccessible(subSkills[i])
                    }
                });
        },
        MakeAccessible(studentId, skillId) {
            var url = "/user-skills/accessible/" + studentId + "/" + skillId;
            fetch(url)
        },
    }
}
</script>


<template>
    <div class="container mt-3">
        <h1>Unmarked Essay Questions</h1>
        <div v-if="this.answers.length > 0">
            <h4>Assessment Total Grade (todo)</h4>
            <p>{{
                this.assessment.total_score }}</p>
            <h4>Student Current Grade (todo)</h4>
            <p>{{
                this.assessment.current_score }}</p>
            <h2>Student</h2>
            <p>{{
                this.answers[this.questionNumber].studentUsername }}</p>
            <h2>Skill</h2>
            <p>
            <p>{{
                this.answers[this.questionNumber].skillName }}</p>
            </p>
            <h2>Question</h2>
            <div class="mb-3">{{ this.answers[this.questionNumber].question }}</div>
            <h2>Answer</h2>
            <div class="mb-3">{{ this.answers[this.questionNumber].answer }}</div>
        </div>
        <p v-else>No unmarked questions currently</p>
        <div v-if="this.answers.length > 0" class="d-flex mt-3 mb-2 justify-content-between">
            <div class="d-flex">
                <button @click="MarkCorrect(this.answers[this.questionNumber])" class="btn green-btn">Mark Correct</button>
                <button @click="MarkIncorrect(this.answers[this.questionNumber])" class="btn red-btn">Mark
                    Incorrect</button>
            </div>

            <div v-if="this.answers.length > 0" class="d-flex justify-content-end">
                <button v-if="this.questionNumber > 0" @click="Previous()" class="btn green-btn me-2">Previous</button>
                <button v-if="this.questionNumber != this.answers.length - 1" @click="Next()"
                    class="btn green-btn">Next</button>
            </div>
        </div>
    </div>
</template>

<style>
h2 {
    color: #8F7BD6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

.green-btn {
    background-color: #36C1AF;
    color: white;
    border: 1px solid #2CA695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    height: 44px;
}

.red-btn {
    background-color: #DA7033;
    color: white;
    border: 1px solid #7F56D9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    height: 44px;

}
</style>   
