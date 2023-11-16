<script>
import { useAssessmentsStore } from '../../stores/AssessmentsStore.js'
import { useUsersStore } from '../../stores/UsersStore'
import { useSkillsStore } from '../../stores/SkillsStore'

export default {
    setup() {
        const assessmentsStore = useAssessmentsStore();
        const usersStore = useUsersStore();
        const skillsStore = useSkillsStore();

        return {
            usersStore, skillsStore, assessmentsStore
        }
    },
    data() {
        return {
            assessments: []
        }
    },
    async created() {
        // Create the assessments array ---------------------------------
        // Get unmarked assessments.
        if (this.assessmentsStore.assessments.length == 0) {
            await this.assessmentsStore.getAssessments()
        }
        this.assessments = this.assessmentsStore.assessments

        // Date.
        for (let i = 0; i < this.assessments.length; i++) {
            let date = new Date(this.assessments[i].date).toDateString()
            this.assessments[i].date = date
        }

        // Get users.
        if (this.usersStore.users.length == 0) {
            await this.usersStore.getUsers()
        }
        // Add the student name.
        for (let i = 0; i < this.assessments.length; i++) {
            for (let j = 0; j < this.usersStore.users.length; j++) {
                if (this.assessments[i].student_id == this.usersStore.users[j].id) {
                    this.assessments[i].studentUsername = this.usersStore.users[j].username
                }
            }
        }

        // Get skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList()
        }
        // Add the skill name.
        for (let i = 0; i < this.assessments.length; i++) {
            for (let j = 0; j < this.skillsStore.skillsList.length; j++) {
                if (this.assessments[i].skill_id == this.skillsStore.skillsList[j].id) {
                    this.assessments[i].skillName = this.skillsStore.skillsList[j].name
                }
            }
        }
        console.log(this.assessments)

    },
    computed: {
    },
    methods: {

    }
}
</script>


<template>
    <div class="container mt-3">
        <h1>Unmarked Assessments</h1>
        <ul v-for="assessment in this.assessments">
            <li>
                <RouterLink :to="'/mark-assessment/' + assessment.id">
                    {{ assessment.studentUsername }},
                    {{ assessment.skillName }},
                    {{ assessment.date }}
                </RouterLink>
            </li>
        </ul>
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
