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
        <!-- Banner -->
        <div id="banner">
            <img src="/images/banners/general-banner.png" class="img-fluid" />
        </div>
        <!-- Page tile -->
        <h2 class="ps-3 mt-2 page-title">Approve Student Added Questions</h2>
        <div class="container-fluid">
            <StudentQuestionList
                :studentQuestion="questions"
                :loadingQuestion="loadingQuestion"
            />
        </div>
    </div>
</template>

<style>
.page-title {
    color: #9c7eec;
    font-size: 30px;
    font-weight: 600;
}

.assessment {
    border: 1px solid #dbd0f9;
    margin: 0px;
    padding: 10px 6px;
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
