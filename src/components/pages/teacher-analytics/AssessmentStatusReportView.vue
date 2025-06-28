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
            studentName: null
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
    },
    methods: {}
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
