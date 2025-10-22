<script>
import { useAnalyticsStore } from '../../../../../stores/AnalyticsStore';
import { useUserDetailsStore } from '../../../../../stores/UserDetailsStore';
import FailedAssessmentsHorizontalBarChart from '../../../../components/analytics/full-size/students/FailedAssessmentsHorizontalBarChart.vue';
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
        FailedAssessmentsHorizontalBarChart,
        DownloadCSVBtn
    },
    data() {
        return {
            failedAssessmentQuantities: [],
            failedAssessmentQuantitiesDownloadData: []
        };
    },
    async created() {
        this.getAllStudentsFailedAssessments();
    },
    methods: {
        async getAllStudentsFailedAssessments() {
            try {
                const response = await fetch(
                    `/student-analytics/failed-assessments/all-students/${this.userDetailsStore.userId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.failedAssessmentQuantities = Array.isArray(data)
                    ? data
                    : [];


            } catch (error) {
                console.error(
                    'Error fetching all students failed assessments:',
                    error
                );
                this.failedAssessmentQuantities = [];
            }
        },
    }
};
</script>

<template>
    <div class="container-fluid chart-page">
        <div class="row h-100">
            <div class="col-md position-relative">
                <h3 class="heading h4">Assessments failed</h3>
                <div id="fails-by-skill-chart-container" class="chart-card">
                    <button class="position-absolute download-btn btn" @click="
                        downloadData(
                            analyticsStore.rootSubjectsFailedAssessments,
                            'Subjects-failed'
                        )
                        ">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="18" height="18">
                            <!-- !Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                            <path
                                d="M0 64C0 28.7 28.7 0 64 0L213.5 0c17 0 33.3 6.7 45.3 18.7L365.3 125.3c12 12 18.7 28.3 18.7 45.3L384 448c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm208-5.5l0 93.5c0 13.3 10.7 24 24 24L325.5 176 208 58.5zM175 441c9.4 9.4 24.6 9.4 33.9 0l64-64c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-23 23 0-86.1c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 86.1-23-23c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64z" />
                        </svg>
                    </button>

                    <FailedAssessmentsHorizontalBarChart v-if="
                        failedAssessmentQuantities.length > 0
                    " :data="failedAssessmentQuantities" />
                    <p v-else>Students have not failed any assessments more than once yet</p>
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

.chart-card {
    border-radius: 5px;
    padding: 10px 10px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
        0 3px 1px -2px rgba(0, 0, 0, 0.2);
    background-color: white;
}

@media (max-width: 600px) {
    .chart-page {
        height: calc(100vh - 50px);
        overflow: hidden;
    }
}

.chart-row {}

#fails-by-skill-chart-container {}

.download-btn {
    right: 10px;
    top: 10px;
}
</style>
