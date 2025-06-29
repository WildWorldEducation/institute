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

        await this.getStartedUnmasteredAssessments();
        await this.userSkillsStore.getMasteredSkills(this.studentId);
        console.log('Mastered skills:', this.userSkillsStore.masteredSkills);
    },
    methods: {
        async getStartedUnmasteredAssessments() {
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
        <h2 class="secondary-heading">In Progress</h2>
        <div v-if="this.startedUnmasteredAssessments.length > 0" class="mb-4">
            <table>
                <tr>
                    <th>Skill</th>
                    <th>Attempts</th>
                </tr>
                <tr
                    v-for="skill in startedUnmasteredAssessments"
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
                    <td></td>
                </tr>
            </table>
        </div>
        <p></p>
        <h2 class="secondary-heading">Has failed multiple times</h2>
    </div>
</template>

<style></style>
