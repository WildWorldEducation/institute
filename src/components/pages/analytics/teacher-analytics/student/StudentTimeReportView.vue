<script>
import { useUsersStore } from '../../../../../stores/UsersStore';
import { useTeacherAnalyticsStore } from '../../../../../stores/TeacherAnalyticsStore';
import { useUserDetailsStore } from '../../../../../stores/UserDetailsStore';
import { useAnalyticsStore } from '../../../../../stores/AnalyticsStore';

import StudentSkillActivityChart from '../../../../components/analytics/full-size/students/StudentSkillActivityChart.vue';
import StudentDurationPerDayLineChart from '../../../../components/analytics/full-size/students/StudentDurationPerDayLineChart.vue';
import TimePerSubjectHorizontalBarChart from '../../../../components/analytics/full-size/students/TimePerSubjectHorizontalBarChart.vue';
import DownloadCSVBtn from '../../../../components/downloadCSVBtn/downloadCSVBtn.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        const userDetailsStore = useUserDetailsStore();
        const analyticsStore = useAnalyticsStore();
        return {
            usersStore,
            teacherAnalyticsStore,
            userDetailsStore,
            analyticsStore
        };
    },
    components: {
        StudentDurationPerDayLineChart,
        StudentSkillActivityChart,
        TimePerSubjectHorizontalBarChart,
        DownloadCSVBtn
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            durationsPerDay: [],
            totalTimeOnPlatformDownloadData: [],
            minutesPerSkillDownloadData: [],
            averageDurationsPerDay: [],
            timeSpentOnSubjectDownloadData: []
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

        await this.getStudentDurationPerDay();
        await this.getStudentActivity();
        if (this.analyticsStore.subjectTimeSpent.length === 0) {
            await this.analyticsStore.getStudentSubjectTimeSpent(
                this.studentId
            );
        }
        this.getTimeSpentOnSkillDownloadData();
    },
    methods: {
        getTimeSpentOnSkillDownloadData() {
            this.timeSpentOnSubjectDownloadData =
                this.analyticsStore.subjectTimeSpent.map((item) => {
                    return {
                        subject: item.name,
                        timeSpent: item.formattedQuantity
                    };
                });
        },
        async getStudentDurationPerDay() {
            let url = `/student-analytics/student-duration-per-day-class/${this.studentId}/${this.userDetailsStore.userId}`;

            if (this.userDetailsStore.role === 'school_admin') {
                url = `/student-analytics/student-duration-per-day-tenant/${this.studentId}/${this.userDetailsStore.tenantId}`;
            }

            fetch(url)
                .then((response) => response.json())
                .then((resData) => {
                    const data = resData.studentTime;
                    for (let i = 0; i < data.length; i++) {
                        data[i].formattedQuantity =
                            data[i].quantity / (1000 * 60);
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.durationsPerDay = data;
                    this.totalTimeOnPlatformDownloadData =
                        this.durationsPerDay.map((e) => {
                            return {
                                date: e.date,
                                minutes: e.formattedQuantity
                            };
                        });
                    const averageData = resData.averageTime;
                    for (let i = 0; i < averageData.length; i++) {
                        averageData[i].formattedQuantity =
                            averageData[i].quantity / (1000 * 60);
                        averageData[i].date = new Date(averageData[i].date);
                    }
                    averageData.sort((a, b) => a.date - b.date);
                    this.averageDurationsPerDay = averageData;
                })
                .catch((error) => {
                    console.error(
                        'Error fetching student duration per day:',
                        error
                    );
                });
        },
        async getStudentActivity() {
            if (this.usersStore.users.length < 1)
                await this.usersStore.getUsers();
            const foundObject = this.usersStore.users.find(
                (student) => student.id === this.studentId
            );
            if (foundObject) {
                this.studentName = foundObject.username;
            }

            if (this.teacherAnalyticsStore.skillActivities.length == 0) {
                await this.teacherAnalyticsStore.getSkillActivityReport(
                    this.studentId
                );
            }

            // if empty
            if (this.teacherAnalyticsStore.skillActivities.error) {
                return;
            }
            this.teacherAnalyticsStore.skillActivities =
                this.teacherAnalyticsStore.skillActivities.map((skill) => {
                    return {
                        ...skill,
                        formattedQuantity: this.millisToMinutesAndSeconds(
                            skill.quantity
                        )
                    };
                });

            this.$nextTick(() => {
                if (this.$refs.activityChart) {
                    // Access the ref here
                    this.$refs.activityChart.createChart(
                        this.teacherAnalyticsStore.skillActivities
                    );
                }
            });
            this.downloadData = this.teacherAnalyticsStore.skillActivities.map(
                (skill) => {
                    return {
                        skill: skill.name,
                        minutes: skill.formattedQuantity
                    };
                }
            );
        },
        millisToMinutesAndSeconds(millis) {
            var minutes = Math.floor(millis / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        }
    }
};
</script>

<template>
    <div class="container-fluid chart-page">
        <span class="d-flex justify-content-between w-100 ps-3 pe-4 pt-2">
            <h1 class="heading h4">Engagement</h1>
            <h2 class="secondary-heading h4">{{ studentName }}</h2>
        </span>

        <div class="chart-row row">
            <div class="col-lg chart-col position-relative h-100 chart-card">
                <div id="time-chart-container">
                    <DownloadCSVBtn :data="totalTimeOnPlatformDownloadData"
                        :fileName="`Total time on platform - ${studentName}`"
                        toolTip="Download total time on platform data as CSV" class="position-absolute download-btn" />

                    <StudentDurationPerDayLineChart v-if="durationsPerDay.length > 0" :data="durationsPerDay"
                        :averageDuration="averageDurationsPerDay" :userRole="userDetailsStore.role"
                        :studentName="studentName" />
                    <p v-else>There is no data to show yet.</p>
                </div>
                <figcaption class="position-absolute">
                    <span style="color: purple">{{ studentName }}</span> vs
                    <span style="color: #ff7f0e">class average</span>
                </figcaption>
            </div>
        </div>
        <div class="chart-row row">
            <div class="col-lg chart-col position-relative chart-card">
                <div id="subject-activity-chart-container">
                    <DownloadCSVBtn :data="timeSpentOnSubjectDownloadData"
                        :fileName="`Time spent on subject - ${studentName}`"
                        toolTip="Download Time spent on subject data as CSV" class="position-absolute download-btn" />

                    <TimePerSubjectHorizontalBarChart v-if="analyticsStore.subjectTimeSpent.length > 0"
                        :data="analyticsStore.subjectTimeSpent" colour="purple" />
                </div>
            </div>
            <div class="col-lg chart-col position-relative overflow-auto chart-card">
                <div id="activity-chart-container">
                    <DownloadCSVBtn :data="minutesPerSkillDownloadData" :fileName="`Minutes per skill - ${studentName}`"
                        toolTip="Download minutes per skill data as CSV" class="position-absolute download-btn" />
                    <StudentSkillActivityChart ref="activityChart" />
                    <!-- <p v-else>No skills visited by this student.</p> -->
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.chart-card {
    border-radius: 5px;
    padding: 10px 10px;
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12),
        0 3px 1px -2px rgba(0, 0, 0, 0.2);
    background-color: white;
}

.chart-col {
    height: 100%;
}

.chart-page {
    height: calc(100vh - 72px);
    overflow: hidden;
    background-color: hsl(from var(--primary-color) h s l / 0.15);
    border-top: 1px solid var(--primary-color);
}

.chart-row {
    height: 46%;
    padding: 5px;
}

#subject-activity-chart-container,
#activity-chart-container,
#time-chart-container {
    height: calc(100% - 35px);
    width: 100%;
}

.download-btn {
    right: 10px;
    top: 10px;
}

/* Styles for screens larger than 992px */
@media (min-width: 992px) {
    .chart-col {
        margin: 5px;
    }
}

/* Styles for screens smaller than 600px (e.g., most mobile phones) */
@media (max-width: 992px) {
    .chart-col {
        height: 48%;
    }
}

@media (max-width: 576px) {
    .chart-page {
        overflow: auto;
        height: calc(100vh - 50px);
    }
}
</style>
