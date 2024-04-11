<script>
import { useAssessmentsStore } from '../../stores/AssessmentsStore.js';
import { useUsersStore } from '../../stores/UsersStore';
import { useSkillsStore } from '../../stores/SkillsStore';
import { useUserDetailsStore } from '../../stores/UserDetailsStore';
import { useInstructorStudentsStore } from '../../stores/InstructorStudentsStore';

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
    async mounted() {
        // Create the assessments array ---------------------------------
        // Get unmarked assessments, if not yet loaded.

        await this.assessmentsStore.getAssessments();

        console.log('hub component mount: ');
        console.log(this.assessmentsStore.assessments);

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
    <div class="container-fluid">
        <div id="question-header">
            <div id="assessment-tile">Assessments</div>
        </div>
        <div id="list-body">
            <div class="assessment" v-for="assessment in this.assessments">
                <RouterLink
                    class="assessment-link"
                    :to="'/mark-assessment/' + assessment.id"
                >
                    {{ assessment.studentUsername }},
                    {{ assessment.skillName }},
                    {{ assessment.date }}
                </RouterLink>
            </div>
        </div>
    </div>
</template>

<style>
.assessment {
    border: 1px solid #dbd0f9;
    margin: 0px;
    padding: 10px 6px;
}

h2 {
    color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

#assessment-tile {
    font-family: 'Poppins';
    font-size: 20px;
    font-weight: 900;
    line-height: 28px;
    letter-spacing: 0em;
    text-align: left;
    color: #ad9af3;
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

#question-header {
    padding-top: 6px;
    padding-bottom: 6px;
    padding-left: 20px;
    background: #e8e2f9;
    border: 1px solid #dbd0f9;
}

#list-body {
    height: 340px;
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
