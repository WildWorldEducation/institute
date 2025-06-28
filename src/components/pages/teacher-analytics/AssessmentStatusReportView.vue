<script>
import { useUsersStore } from '../../../stores/UsersStore';
export default {
    setup() {
        const usersStore = useUsersStore();
        return {
            usersStore
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
        <p></p>
        <h2 class="secondary-heading">Has failed multiple times</h2>
    </div>
</template>

<style></style>
