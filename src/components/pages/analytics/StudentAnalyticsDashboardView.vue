<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useTeacherAnalyticsStore } from '../../../stores/TeacherAnalyticsStore';
import { useAnalyticsStore } from '../../../stores/AnalyticsStore';
import { useUserSkillsStore } from '../../../stores/UserSkillsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        const userSkillsStore = useUserSkillsStore();
        const analyticsStore = useAnalyticsStore();
        return {
            userDetailsStore,
            teacherAnalyticsStore,
            userSkillsStore,
            analyticsStore
        };
    },
    components: {},
    data() {
        return {
            studentId: this.userDetailsStore.userId
        };
    },
    async created() {
        await this.analyticsStore.getStudentDurationPerDay(this.studentId);
        await this.analyticsStore.getStudentSkillDurations(this.studentId);
        await this.analyticsStore.getAvgTokensToMasterSkills(this.studentId);
        await this.analyticsStore.getStudentAssessmentPasses(this.studentId);
        await this.analyticsStore.getStudentAssessmentAttempts(this.studentId);
        await this.teacherAnalyticsStore.getStudentMultipleFails(
            this.studentId
        );
    },
    methods: {}
};
</script>

<template>
    <div class="container-fluid"></div>
</template>

<style scoped></style>
