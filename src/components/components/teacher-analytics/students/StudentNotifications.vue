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
    props: ['studentId'],
    data() {
        return {};
    },
    async created() {
        if (this.teacherAnalyticsStore.studentMultipleFails.length == 0)
            await this.teacherAnalyticsStore.getStudentMultipleFails(
                this.studentId
            );
    },
    mounted() {}
};
</script>

<template>
    <h2 class="secondary-heading h4 mt-4">Notifications</h2>
    <div
        v-if="teacherAnalyticsStore.studentMultipleFails.length > 0"
        class="alert alert-warning"
        role="alert"
    >
        This student is struggling with an assessment.
    </div>
    <p><em>have a square for icons next to the student name</em></p>
    <ul>
        <li>Struggling with a particular skill</li>
        <li>Low activity</li>
        <li>Behind the curve (compared to cohort)</li>
        <li>Ahead of the curve (compared to cohort)</li>
    </ul>
</template>

<style scoped></style>
