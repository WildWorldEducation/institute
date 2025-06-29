<script>
import { useUsersStore } from '../../../stores/UsersStore';
import { useUserSkillsStore } from '../../../stores/UserSkillsStore';
export default {
    setup() {
        const usersStore = useUsersStore();
        const userSkillsStore = useUserSkillsStore();
        return {
            usersStore,
            userSkillsStore
        };
    },
    components: {},
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            startedUnmasteredAssessments: []
        };
    },
    async created() {
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
        const foundObject = this.usersStore.users.find(
            (student) => student.id === this.studentId
        );
        if (foundObject) {
            this.studentName = foundObject.username;
        }

        await this.getAssessmentAttempts();
        await this.userSkillsStore.getMasteredSkills(this.studentId);
    },
    methods: {
        async getAssessmentAttempts() {
            fetch(
                `/student-analytics/started-unmastered-assessments/${this.studentId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    this.startedUnmasteredAssessments = data;
                    console.log(
                        'Started unmastered assessments:',
                        this.startedUnmasteredAssessments
                    );
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        },
        assessmentDate(date) {
            let jsDate = new Date(date);
            return jsDate.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        }
    }
};
</script>

<template>
    <div class="container">
        <h1 class="heading">Assessment Status Report: {{ studentName }}</h1>
        <p>
            Teachers can see which students have completed assessments, are in
            progress, or in need of additional support (which we can gauge by
            lower levels of activity or low levels of progress)
        </p>
        <h2 class="secondary-heading">Completed</h2>
        <p>All mastered skills, except categories</p>
        <div v-if="this.userSkillsStore.masteredSkills.length > 0" class="mb-4">
            <table class="table">
                <tr>
                    <th>Skill</th>
                </tr>
                <tr
                    v-for="skill in userSkillsStore.masteredSkills"
                    :key="skill.id"
                    class="table-rows"
                >
                    <td>
                        <router-link
                            target="_blank"
                            :to="'/skills/' + skill.url"
                            >{{ skill.name }}</router-link
                        >
                    </td>
                </tr>
            </table>
        </div>
        <h2 class="secondary-heading">Attempted</h2>
        <div v-if="this.startedUnmasteredAssessments.length > 0" class="mb-4">
            <table class="table">
                <tr>
                    <th>Skill</th>
                    <th>Date</th>
                </tr>
                <tr
                    v-for="assessmentAttempt in startedUnmasteredAssessments"
                    :key="assessmentAttempt.id"
                    class="table-rows"
                >
                    <td>
                        <router-link
                            target="_blank"
                            :to="'/skills/' + assessmentAttempt.url"
                            >{{ assessmentAttempt.name }}</router-link
                        >
                    </td>
                    <td>
                        {{ assessmentDate(assessmentAttempt.date) }}
                    </td>
                </tr>
            </table>
        </div>
        <p></p>
        <h2 class="secondary-heading">Has failed multiple times</h2>
    </div>
</template>

<style></style>
