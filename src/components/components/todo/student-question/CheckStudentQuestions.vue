<script>
import { useStudentMCQuestionsStore } from '../../../../stores/StudentMCQuestionsStore.js';
import { useInstructorStudentsStore } from '../../../../stores/InstructorStudentsStore';
import { useUsersStore } from '../../../../stores/UsersStore';
import { useSkillsStore } from '../../../../stores/SkillsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import StudentQuestionList from './studentQuestionList.vue';

export default {
    setup() {
        const studentMCQuestionsStore = useStudentMCQuestionsStore();
        const instructorStudentsStore = useInstructorStudentsStore();
        const usersStore = useUsersStore();
        const skillsStore = useSkillsStore();
        const userDetailsStore = useUserDetailsStore();

        return {
            studentMCQuestionsStore,
            instructorStudentsStore,
            usersStore,
            skillsStore,
            userDetailsStore
        };
    },
    data() {
        return {
            questions: [],
            loadingQuestion: true
        };
    },
    components: {
        StudentQuestionList
    },
    async created() {
        this.loadingQuestion = true;
        // Question list needs to be created for both admins (all questions), and instructors
        // (only their students' questions).

        // Create the questions array ---------------------------------
        // Get unchecked questions.
        await this.studentMCQuestionsStore.getStudentMCQuestions();

        // Get users.
        if (this.usersStore.users.length == 0) {
            await this.usersStore.getUsers();
        }
        // Add the student name.
        for (
            let i = 0;
            i < this.studentMCQuestionsStore.studentMCQuestions.length;
            i++
        ) {
            for (let j = 0; j < this.usersStore.users.length; j++) {
                if (
                    this.studentMCQuestionsStore.studentMCQuestions[i]
                        .student_id == this.usersStore.users[j].id
                ) {
                    this.studentMCQuestionsStore.studentMCQuestions[
                        i
                    ].studentName = this.usersStore.users[j].username;
                }
            }
        }
        // Dealing with students that have been deleted.
        for (
            let i = 0;
            i < this.studentMCQuestionsStore.studentMCQuestions.length;
            i++
        ) {
            if (
                typeof this.studentMCQuestionsStore.studentMCQuestions[i]
                    .studentName == 'undefined'
            ) {
                this.studentMCQuestionsStore.studentMCQuestions[i].studentName =
                    'Deleted student';
            }
        }

        // Get skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }
        // Add the skill name.
        for (
            let i = 0;
            i < this.studentMCQuestionsStore.studentMCQuestions.length;
            i++
        ) {
            for (let j = 0; j < this.skillsStore.skillsList.length; j++) {
                if (
                    this.studentMCQuestionsStore.studentMCQuestions[i]
                        .skill_id == this.skillsStore.skillsList[j].id
                ) {
                    this.studentMCQuestionsStore.studentMCQuestions[
                        i
                    ].skillName = this.skillsStore.skillsList[j].name;
                }
            }
        }

        this.questions = this.studentMCQuestionsStore.studentMCQuestions;
        this.$parent.studentQuestionCount = this.questions.length;
        this.loadingQuestion = false;
    },
    computed: {},
    methods: {}
};
</script>

<template>
    <div>
        <StudentQuestionList
            :studentQuestion="questions"
            :loadingQuestion="loadingQuestion"
        />
    </div>
</template>

<style></style>
