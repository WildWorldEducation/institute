<script lang="ts">
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import { useAssessmentsStore } from '../../stores/AssessmentsStore.js';
import { useUsersStore } from '../../stores/UsersStore.js';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useInstructorStudentsStore } from '../../stores/InstructorStudentsStore.js';
import MarkAssessment from '../components/MarkAssessment.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const assessmentsStore = useAssessmentsStore();
        const skillsStore = useSkillsStore();
        const usersStore = useUsersStore();
        const instructorStudentsStore = useInstructorStudentsStore();
        userDetailsStore.getUserDetails();
        return {
            userDetailsStore,
            assessmentsStore,
            usersStore,
            skillsStore,
            instructorStudentsStore
        };
    },
    data() {
        return {
            assessments: [],
            studentIds: []
        };
    },
    components: {
        MarkAssessment
    },
    async created() {
        if (
            this.userDetailsStore.role == 'instructor' ||
            this.userDetailsStore.role == 'partner'
        ) {
            await this.fetchAssessments();
        }
    },
    methods: {
        async fetchAssessments() {
            // Create the assessments array ---------------------------------
            // Get unmarked assessments if there no assessment store before
            await this.assessmentsStore.getAssessments();

            // Get the instructor student list, if not yet loaded.
            if (
                this.instructorStudentsStore.instructorStudentsList.length == 0
            ) {
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
                        this.assessments.push(
                            this.assessmentsStore.assessments[i]
                        );
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
        }
    }
};
</script>

<template>
    <div class="container">
        <MarkAssessment
            v-if="
                userDetailsStore.role == 'instructor' ||
                this.userDetailsStore.role == 'partner'
            "
            :assessments="assessments"
        />
    </div>
</template>

<style scoped></style>
