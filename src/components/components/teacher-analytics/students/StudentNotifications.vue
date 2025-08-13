<script>
import { RouterLink } from 'vue-router';
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
    <RouterLink
        v-if="teacherAnalyticsStore.studentMultipleFails.length > 0"
        class="alert alert-danger notification"
        role="alert"
        target="_blank"
        :to="'/student/' + $parent.userId + '/assessment-status'"
    >
        This student is struggling with one or more assessments.
    </RouterLink>
    <RouterLink
        v-if="teacherAnalyticsStore.isLowActivity"
        class="alert alert-danger notification"
        role="alert"
        target="_blank"
        :to="'/student/' + $parent.userId + '/total-time'"
    >
        This student has not visited any skills for 3 days of more.
    </RouterLink>
</template>

<style scoped>
.notification {
    display: block;
    text-decoration: none;
    color: #842029;
}
</style>
