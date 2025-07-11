<script>
import { useTeacherAnalyticsStore } from '../../../../stores/TeacherAnalyticsStore';
export default {
    setup() {
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        return {
            teacherAnalyticsStore
        };
    },
    name: 'StudentNotifications',
    props: [],
    data() {
        return {};
    },
    async created() {},
    mounted() {}
};
</script>

<template>
    <h2 class="secondary-heading h4 mt-4">Notifications</h2>
    <div
        v-if="teacherAnalyticsStore.studentMultipleFails.length > 0"
        class="alert alert-danger"
        role="alert"
    >
        This student is struggling with one or more assessments.
    </div>
    <p><em>have a square for icons next to the student name</em></p>
    <ul>
        <li>Low activity</li>
        <li>Behind the curve (compared to cohort)</li>
        <li>Ahead of the curve (compared to cohort)</li>
    </ul>
</template>

<style scoped></style>
