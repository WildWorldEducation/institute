<script>
import TenantDurationPerDayLineChart from '../../components/teacher-analytics/tenants/TenantDurationPerDayLineChart.vue';

export default {
    setup() {
        return {};
    },
    components: {},
    data() {
        return {
            studentId: this.$route.params.studentId
        };
    },
    async created() {},
    methods: {
        millisToMinutesAndSeconds(millis) {
            var minutes = Math.floor(millis / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">My Progress</h1>
            <!-- <h2 class="secondary-heading h3">{{ tenantName }}</h2>-->
        </span>
        <h2 class="secondary-heading">sub title</h2>
        <h4>chart title</h4>
        <TenantAvgInteractionTimePerSkillHorizontalBarChart
            v-if="avgTimeOnSkills.length > 0"
            :data="avgTimeOnSkills"
            colour="purple"
        />
        <p v-else>No data yet</p>
    </div>
</template>

<style></style>
