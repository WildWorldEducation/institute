<script>
import { useUsersStore } from '../../../../../stores/UsersStore';
import { useUserDetailsStore } from '../../../../../stores/UserDetailsStore';
import { useAnalyticsStore } from '../../../../../stores/AnalyticsStore';
import StudentProgressChart from '../../../../components/analytics/full-size/students/dashboard/StudentProgressChart.vue';
import DownloadCSVBtn from '../../../../components/downloadCSVBtn/downloadCSVBtn.vue';
export default {
    setup() {
        const usersStore = useUsersStore();
        const analyticsStore = useAnalyticsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            usersStore,
            userDetailsStore,
            analyticsStore
        };
    },
    components: {
        StudentProgressChart,
        DownloadCSVBtn
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            progressData: {
                student: [],
                average: []
            }
        };
    },
    async created() {
        // Get student name
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
        const foundObject = this.usersStore.users.find(
            (student) => student.id === this.studentId
        );
        if (foundObject) {
            this.studentName = foundObject.username;
        }

        // Get total progress data
        await this.analyticsStore.getStudentProgress(
            this.studentId,
            this.userDetailsStore.tenantId
        );
        await this.HandleProgressData();
    },
    methods: {
        async HandleProgressData() {
            // If "You" checked

            this.progressData.student = [];
            for (
                let i = 0;
                i < this.analyticsStore.progress.student.length;
                i++
            ) {
                this.progressData.student.push(
                    this.analyticsStore.progress.student[i]
                );
            }

            this.progressData.average = [];
            for (
                let i = 0;
                i < this.analyticsStore.progress.tenant.length;
                i++
            ) {
                this.progressData.average.push(
                    this.analyticsStore.progress.tenant[i]
                );
            }

            this.$nextTick(() => {
                if (this.$refs.progressChart) {
                    // Access the ref here
                    this.$refs.progressChart.createChart(this.progressData);
                }
            });
        }
    }
};
</script>

<template>
    <div class="container-fluid chart-page">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading h4">Progress</h1>
            <h2
                class="tertiary-heading h4 d-flex justify-content-end align-items-center"
            >
                <DownloadCSVBtn
                    :data="progressData"
                    :fileName="`Progress Report - ${studentName}`"
                    toolTip="Download progress data as CSV"
                />
                {{ studentName }}
            </h2>
        </span>
        <div class="row h-100">
            <div class="col-lg chart-col position-relative">
                <div id="progress-chart-container">
                    <StudentProgressChart
                        ref="progressChart"
                        v-if="
                            progressData.student.length > 0 ||
                            progressData.average.length > 0
                        "
                        :data="progressData"
                    />
                    <p v-else>There is no data to show yet.</p>
                </div>
            </div>
            <div class="col-lg chart-col position-relative"></div>
        </div>
    </div>
</template>

<style scoped>
.chart-col {
    height: 100%;
}

.chart-page {
    height: calc(100vh - 88px);
    overflow: hidden;
}

#progress-chart-container {
    height: calc(100% - 35px);
    width: 100%;
}

.download-btn {
    right: 10px;
    top: 10px;
}

/* Styles for screens smaller than 600px (e.g., most mobile phones) */
@media (max-width: 992px) {
    .chart-col {
        height: 50%;
    }
}
</style>
