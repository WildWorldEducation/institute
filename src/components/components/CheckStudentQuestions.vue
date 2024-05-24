<script>
import { useStudentMCQuestionsStore } from '../../stores/StudentMCQuestionsStore.js';
import { useInstructorStudentsStore } from '../../stores/InstructorStudentsStore';
import { useUsersStore } from '../../stores/UsersStore';
import { useSkillsStore } from '../../stores/SkillsStore';
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

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
            questions: []
        };
    },
    async created() {
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

        // For instructors only.
        if (this.userDetailsStore.role == 'instructor') {
            // Get the instructor student list, if not yet loaded.
            if (
                this.instructorStudentsStore.instructorStudentsList.length == 0
            ) {
                await this.instructorStudentsStore.getInstructorStudentsList();
            }

            let studentIds = [];
            // Just get the students that this instructors teaches.
            for (
                let i = 0;
                i < this.instructorStudentsStore.instructorStudentsList.length;
                i++
            ) {
                if (
                    this.$parent.userDetailsStore.userId ==
                    this.instructorStudentsStore.instructorStudentsList[i]
                        .instructor_id
                ) {
                    studentIds.push(
                        this.instructorStudentsStore.instructorStudentsList[i]
                            .student_id
                    );
                }
            }
            // Get the questions made by these students.
            for (
                let i = 0;
                i < this.studentMCQuestionsStore.studentMCQuestions.length;
                i++
            ) {
                for (let j = 0; j < studentIds.length; j++) {
                    if (
                        this.studentMCQuestionsStore.studentMCQuestions[i]
                            .student_id == studentIds[j]
                    ) {
                        this.questions.push(
                            this.studentMCQuestionsStore.studentMCQuestions[i]
                        );
                    }
                }
            }
        } else {
            this.questions = this.studentMCQuestionsStore.studentMCQuestions;
        }
    },
    computed: {},
    methods: {}
};
</script>

<template>
    <div class="container-fluid">
        <div id="question-header">
            <div id="assessment-tile">Student Questions</div>
        </div>
        <div id="list-body">
            <div class="assessment" v-for="question in this.questions">
                <RouterLink
                    :to="'/check-student-question/' + question.id"
                    class="assessment-link"
                    >{{ question.studentName }},
                    {{ question.skillName }}</RouterLink
                >
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
