<script>
import { useAssessmentsStore } from '../../../stores/AssessmentsStore.js';
import { useUsersStore } from '../../../stores/UsersStore.js';
import { useSkillsStore } from '../../../stores/SkillsStore.js';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import { useInstructorStudentsStore } from '../../../stores/InstructorStudentsStore.js';

export default {
    setup() {
        const assessmentsStore = useAssessmentsStore();
        const usersStore = useUsersStore();
        const skillsStore = useSkillsStore();
        const userDetailsStore = useUserDetailsStore();
        const instructorStudentsStore = useInstructorStudentsStore();

        return {
            usersStore,
            skillsStore,
            assessmentsStore,
            userDetailsStore,
            instructorStudentsStore
        };
    },
    data() {
        return {
            assessments: [],
            studentIds: []
        };
    },
    async created() {
        // Create the assessments array ---------------------------------
        // Get unmarked assessments if there no assessment store before
        await this.assessmentsStore.getAssessments();

        // Get the instructor student list, if not yet loaded.
        if (this.instructorStudentsStore.instructorStudentsList.length == 0) {
            await this.instructorStudentsStore.getInstructorStudentsList();
        }

        // Just get the students that this instructors teaches.
        for (
            let i = 0;
            i < this.instructorStudentsStore.instructorStudentsList.length;
            i++
        ) {
            if (
                this.userDetailsStore.userId ==
                this.instructorStudentsStore.instructorStudentsList[i]
                    .instructor_id
            ) {
                this.studentIds.push(
                    this.instructorStudentsStore.instructorStudentsList[i]
                        .student_id
                );
            }
        }
        // Get the assessments for those students.
        for (let i = 0; i < this.assessmentsStore.assessments.length; i++) {
            for (let j = 0; j < this.studentIds.length; j++) {
                if (
                    this.assessmentsStore.assessments[i].student_id ==
                    this.studentIds[j]
                ) {
                    this.assessments.push(this.assessmentsStore.assessments[i]);
                }
            }
        }

        // Date.
        for (let i = 0; i < this.assessments.length; i++) {
            let date = new Date(this.assessments[i].date).toDateString();
            this.assessments[i].date = date;
        }

        // Get users.
        if (this.usersStore.users.length == 0) {
            await this.usersStore.getUsers();
        }
        // Add the student name.
        for (let i = 0; i < this.assessments.length; i++) {
            for (let j = 0; j < this.usersStore.users.length; j++) {
                if (
                    this.assessments[i].student_id ==
                    this.usersStore.users[j].id
                ) {
                    this.assessments[i].studentUsername =
                        this.usersStore.users[j].username;
                }
            }
        }

        // Get skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }
        // Add the skill name.
        for (let i = 0; i < this.assessments.length; i++) {
            for (let j = 0; j < this.skillsStore.skillsList.length; j++) {
                if (
                    this.assessments[i].skill_id ==
                    this.skillsStore.skillsList[j].id
                ) {
                    this.assessments[i].skillName =
                        this.skillsStore.skillsList[j].name;
                }
            }
        }
    },
    computed: {},
    methods: {}
};
</script>

<template>
    <h2 class="secondary-heading h4">Mark Assessments</h2>
    <div v-if="this.assessments.length > 0" id="list-body">
        <div class="assessment" v-for="assessment in this.assessments">
            <RouterLink
                class="assessment-link"
                :to="'/mark-assessment/' + assessment.id"
            >
                <span id="student-name">
                    {{ assessment.studentUsername }},
                </span>
                <span id="skill-name"> {{ assessment.skillName }}, </span>
                <span id="date">
                    {{ assessment.date }}
                </span>
            </RouterLink>
        </div>
    </div>
</template>

<style scoped>
.assessment {
    border: 1px solid #dbd0f9;
    margin: 0px;
    padding: 10px 6px;
}

.assessment-link {
    font-family: 'Poppins';
    font-size: 16px;
    font-weight: 500;
    line-height: 28px;
    letter-spacing: 0em;
    text-align: left;
    text-decoration: none;
    color: #667085;
}

#student-name {
    color: #8f7bd6;
}

#date {
    color: #dbd0f9;
}

.assessment-link:hover #date {
    color: #7f56d9;
    cursor: pointer;
}

.assessment-link:hover {
    color: #7f56d9;
    cursor: pointer;
}

.assessment-link:hover #student-name {
    color: #7f56d9;
    cursor: pointer;
}

#list-body {
    overflow: auto;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
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
    background-color: #da7033;
    color: white;
    border: 1px solid #7f56d9;
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
