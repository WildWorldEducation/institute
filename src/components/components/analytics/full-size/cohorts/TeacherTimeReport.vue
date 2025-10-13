<script>
import { useCohortsStore } from '../../../../../stores/CohortsStore';
import { useUserDetailsStore } from '../../../../../stores/UserDetailsStore';
import DownloadCSVBtn from '../../../../components/downloadCSVBtn/downloadCSVBtn.vue';
import CohortDurationPerDayLineChart from '../../../../components/analytics/full-size/cohorts/CohortDurationPerDayLineChart.vue';
import CohortCompareDurationHorizontalChart from '../../../../components/analytics/full-size/cohorts/CohortCompareDurationHorizontalChart.vue';
import CohortDurationPerSkillHorizontalBarChart from '../../../../components/analytics/full-size/cohorts/CohortDurationPerSkillHorizontalBarChart.vue';

export default {
    setup() {
        const cohortsStore = useCohortsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            cohortsStore,
            userDetailsStore
        };
    },
    components: {
        CohortDurationPerDayLineChart,
        CohortCompareDurationHorizontalChart,
        CohortDurationPerSkillHorizontalBarChart,
        DownloadCSVBtn
    },
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohortName: '',
            durationsPerDay: [],
            studentTotalDurations: [],
            studentDurationsPerSkill: [],
            durationsPerDayDownloadData: [],
            studentTotalDurationsDownloadData: [],
            studentDurationsPerSkillDownloadData: []
        };
    },
    async created() {
        await this.getAllStudentsDurationPerDay();
        await this.getAllStudentsStudentTotalDurations();
        await this.getAllStudentsDurationsPerSkill();
    },
    methods: {
        async getAllStudentsDurationPerDay() {
            fetch(
                `/student-analytics/all-students-duration-per-day/${this.userDetailsStore.userId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].formattedQuantity =
                            data[i].quantity / (1000 * 60);
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.durationsPerDay = data;
                    this.durationsPerDayDownloadData = data.map((d) => {
                        return {
                            date: new Date(d.date).toLocaleDateString(),
                            minutesSpent: this.millisToMinutesAndSeconds(
                                d.quantity
                            )
                        };
                    });
                })
                .catch((error) => {
                    console.error(
                        'Error fetching student duration per day:',
                        error
                    );
                });
        },
        async getAllStudentsStudentTotalDurations() {
            fetch(
                `/student-analytics/all-students-total-durations/${this.userDetailsStore.userId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].formattedQuantity =
                            this.millisToMinutesAndSeconds(data[i].quantity);
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.studentTotalDurations = data;
                    this.studentTotalDurationsDownloadData = data.map((d) => {
                        return {
                            studentName: d.name,
                            minutesSpent: this.millisToMinutesAndSeconds(
                                d.quantity
                            )
                        };
                    });
                })
                .catch((error) => {
                    console.error(
                        'Error fetching student duration per day:',
                        error
                    );
                });
        },
        async getAllStudentsDurationsPerSkill() {
            fetch(
                `/student-analytics/all-students-student-durations-per-skill/${this.userDetailsStore.userId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].formattedQuantity =
                            this.millisToMinutesAndSeconds(data[i].quantity);
                    }
                    this.studentDurationsPerSkill = data;
                    this.studentDurationsPerSkillDownloadData = data.map(
                        (d) => {
                            return {
                                skill: d.name,
                                minutesSpent: this.millisToMinutesAndSeconds(
                                    d.quantity
                                )
                            };
                        }
                    );
                })
                .catch((error) => {
                    console.error(
                        'Error fetching student durations per skill:',
                        error
                    );
                });
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
        <h1 class="heading h4">Time Report</h1>
        <div class="row chart-row position-relative">
            <div id="time-chart-container">
                <DownloadCSVBtn
                    :data="durationsPerDayDownloadData"
                    fileName="Total time on platform per day"
                    class="download-btn position-absolute btn"
                />
                <CohortDurationPerDayLineChart
                    :data="durationsPerDay"
                    v-if="durationsPerDay.length > 0"
                />
                <p v-else>No time recorded yet</p>
            </div>
        </div>

        <div class="row chart-row">
            <div class="col-md chart-col position-relative overflow-auto">
                <div id="student-time-chart-container">
                    <DownloadCSVBtn
                        :data="studentTotalDurationsDownloadData"
                        fileName="Total time on platform, comparing students"
                        class="download-btn position-absolute btn"
                    />
                    <CohortCompareDurationHorizontalChart
                        :data="studentTotalDurations"
                        :colour="'#5f31dd'"
                        v-if="studentTotalDurations.length > 0"
                    />
                    <p v-else>No time recorded yet</p>
                </div>
           
            </div>

            <div class="col-md chart-col position-relative overflow-auto">
                <div id="skill-time-chart-container">
                    <DownloadCSVBtn
                        :data="studentDurationsPerSkillDownloadData"
                        fileName="Minutes per skill"
                        class="download-btn position-absolute btn"
                    />

                    <CohortDurationPerSkillHorizontalBarChart
                        :data="studentDurationsPerSkill"
                        :colour="'#5f31dd'"
                        v-if="studentDurationsPerSkill.length > 0"
                    />
                </div>
            
            </div>
        </div>
    </div>
</template>

<style scoped>
.download-btn {
    right: 10px;
    top: 10px;
}

.chart-row {
    height: calc(50% - 10px);
}

.chart-col {
    height: 100%;
}

/* Styles for screens smaller than 600px (e.g., most mobile phones) */
@media (min-width: 600px) {
    .chart-page {
        height: calc(100vh - 88px);
        overflow: hidden;
    }
}

#time-chart-container,
#skill-time-chart-container,
#student-time-chart-container {
    height: calc(100% - 35px);
    width: 100%;
}

@media (max-width: 600px) {
    #time-chart-container,
    #skill-time-chart-container,
    #student-time-chart-container {
        height: 200px;
    }
}
</style>
