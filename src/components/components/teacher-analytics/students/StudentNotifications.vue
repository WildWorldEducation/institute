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
    <div
        v-if="teacherAnalyticsStore.isLowActivity"
        class="alert alert-danger"
        role="alert"
    >
        This student has not visited any skills for 3 days of more.
    </div>
</template>

<style scoped></style>
