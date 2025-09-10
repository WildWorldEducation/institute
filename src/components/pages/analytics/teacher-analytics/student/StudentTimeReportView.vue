<script>
import { useUsersStore } from '../../../../../stores/UsersStore';
import { useTeacherAnalyticsStore } from '../../../../../stores/TeacherAnalyticsStore';
import { useUserDetailsStore } from '../../../../../stores/UserDetailsStore';
import TimePerSkillHorizontalBarChart from '../../../../components/analytics/full-size/students/TimePerSkillHorizontalBarChart.vue';
import StudentSkillActivityChart from '../../../../components/analytics/full-size/students/StudentSkillActivityChart.vue';
import StudentDurationPerDayLineChart from '../../../../components/analytics/full-size/students/StudentDurationPerDayLineChart.vue';
import DownloadCSVBtn from '../../../../components/downloadCSVBtn/downloadCSVBtn.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            usersStore,
            teacherAnalyticsStore,
            userDetailsStore
        };
    },
    components: {
        TimePerSkillHorizontalBarChart,
        StudentDurationPerDayLineChart,
        StudentSkillActivityChart,
        DownloadCSVBtn
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            skillDurations: [],
            durationsPerDay: [],
            allSkillsDuration: 0,
            totalTimeOnPlatformDownloadData: [],
            minutesPerSkillDownloadData: [],
            averageDurationsPerDay: []
        };
    },
    async created() {
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
        const foundObject = this.usersStore.users.find(
            (student) => student.id === this.studentId
        );
        if (foundObject) {
            this.studentName = foundObject.username;
        }

        await this.getStudentDurationPerDay();
        await this.getStudentActivity();
    },
    methods: {
        // async getSkillDuration() {
        //     fetch(`/student-analytics/skill-durations/${this.studentId}`)
        //         .then((response) => response.json())
        //         .then((data) => {
        //             this.skillDurations = data;
        //             for (let i = 0; i < this.skillDurations.length; i++) {
        //                 this.skillDurations[i].formattedQuantity =
        //                     this.millisToMinutesAndSeconds(
        //                         this.skillDurations[i].quantity
        //                     );
        //             }
        //             console.log(this.skillDurations);
        //             this.minutesPerSkillDownloadData = this.skillDurations.map(
        //                 (e) => {
        //                     return {
        //                         skill: e.name,
        //                         quantity: e.formattedQuantity
        //                     };
        //                 }
        //             );
        //         })
        //         .catch((error) => {
        //             console.error('Error fetching last visited skills:', error);
        //         });
        // },
        // async getAllSkillsDuration() {
        //     fetch(`/student-analytics/all-skills-duration/${this.studentId}`)
        //         .then((response) => response.json())
        //         .then((data) => {
        //             this.allSkillsDuration = data.duration;
        //         })
        //         .catch((error) => {
        //             console.error('Error fetching last visited skills:', error);
        //         });
        // },
        async getStudentDurationPerDay() {
            let url = `/student-analytics/student-duration-per-day-class/${this.studentId}/${this.userDetailsStore.userId}`;

            if (this.userDetailsStore.role === 'school_admin') {
                url = `/student-analytics/student-duration-per-day/${this.studentId}/${this.userDetailsStore.userId}`;
            }
            fetch(
                `/student-analytics/student-duration-per-day-class/${this.studentId}/${this.userDetailsStore.userId}`
            )
                .then((response) => response.json())
                .then((resData) => {
                    const data = resData.studentTime;
                    for (let i = 0; i < data.length; i++) {
                        data[i].formattedQuantity =
                            data[i].quantity / (1000 * 60);
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    console.log('response data: ');
                    console.log(data);
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
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading h4">Time spent</h1>
            <h2 class="tertiary-heading h4">{{ studentName }}</h2>
        </span>

        <div class="row h-100">
            <div class="col-lg chart-col position-relative">
                <div id="time-chart-container">
                    <DownloadCSVBtn
                        :data="totalTimeOnPlatformDownloadData"
                        :fileName="`Total time on platform - ${studentName}`"
                        toolTip="Download total time on platform data as CSV"
                        class="position-absolute download-btn"
                    />

                    <StudentDurationPerDayLineChart
                        v-if="durationsPerDay.length > 0"
                        :data="durationsPerDay"
                        :averageDuration="averageDurationsPerDay"
                        colour="black"
                    />
                    <p v-else>There is no data to show yet.</p>
                </div>
            </div>
            <div class="col-lg chart-col position-relative">
                <div id="activity-chart-container">
                    <DownloadCSVBtn
                        :data="minutesPerSkillDownloadData"
                        :fileName="`Minutes per skill - ${studentName}`"
                        toolTip="Download minutes per skill data as CSV"
                        class="position-absolute download-btn"
                    />
                    <StudentSkillActivityChart ref="activityChart" />
                    <!-- <p v-else>No skills visited by this student.</p> -->
                </div>
            </div>
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

#activity-chart-container,
#time-chart-container {
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
