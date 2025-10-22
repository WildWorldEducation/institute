<script>
import { useAnalyticsStore } from '../../../../../stores/AnalyticsStore';
import { useUserDetailsStore } from '../../../../../stores/UserDetailsStore';
import TenantFailedAssessmentsHorizontalBarChart from './TenantFailedAssessmentsHorizontalBarChart.vue';
import DownloadCSVBtn from '../../../downloadCSVBtn/downloadCSVBtn.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const analyticsStore = useAnalyticsStore();
        return {
            userDetailsStore,
            analyticsStore
        };
    },
    components: {
        TenantFailedAssessmentsHorizontalBarChart,
        DownloadCSVBtn
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
        };
    },
    async created() {
        if (this.analyticsStore.failedAssessments.length == 0)
            await this.getFailedAssessments();
    },
    methods: {
        async getFailedAssessments() {
            try {
                const response = await fetch(
                    `/student-analytics/failed-assessments/tenant/${this.userDetailsStore.tenantId}`
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.analyticsStore.failedAssessments = await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.analyticsStore.failedAssessments = [];
            }
        },
    }
};
</script>

<template>
    <div class="container-fluid chart-page">
        <div class="row h-100">
            <div class="col-md position-relative overflow-auto">
                <h3 class="heading h4">School-wide assessments failed</h3>
                <div id="failed-assessments-chart-container" class="chart-card">
                    <DownloadCSVBtn :data="analyticsStore.failedAssessments" fileName="Assessments-failed"
                        toolTip="Download CSV" class="download-btn position-absolute" />

                    <TenantFailedAssessmentsHorizontalBarChart v-if="
                        analyticsStore.failedAssessments
                            .length > 0
                    " :data="analyticsStore.failedAssessments
                        " />
                    <p v-else>No data yet</p>
                </div>
            </div>

        </div>
    </div>
</template>

<style scoped>
.chart-page {
    height: calc(100vh - 72px);
    overflow: hidden;
    background-color: hsl(from var(--primary-color) h s l / 0.15);
    border-top: 1px solid var(--primary-color);
}

@media (max-width: 599px) {
    .chart-page {
        height: calc(100vh - 50px);
        overflow: hidden;
    }
}

.chart-card {
    border-radius: 5px;
    padding: 10px 10px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
        0 3px 1px -2px rgba(0, 0, 0, 0.2);
    background-color: white;
}

.chart-row {
    height: 50%;
}

#failed-assessments-chart-container {}

.download-btn {
    right: 10px;
    top: 10px;
}
</style>
