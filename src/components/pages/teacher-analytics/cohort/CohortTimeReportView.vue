<script>
import { useCohortsStore } from '../../../../stores/CohortsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import CohortDurationPerDayLineChart from '../../../components/teacher-analytics/cohorts/CohortDurationPerDayLineChart.vue';
import CohortCompareDurationHorizontalChart from '../../../components/teacher-analytics/cohorts/CohortCompareDurationHorizontalChart.vue';

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
        CohortCompareDurationHorizontalChart
    },
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohortName: '',
            durationsPerDay: [],
            studentTotalDurations: []
        };
    },
    async created() {
        if (this.cohortsStore.cohorts.length < 1) {
            await this.cohortsStore.getCohorts(this.userDetailsStore.userId);
        }
        const foundObject = this.cohortsStore.cohorts.find(
            (cohort) => cohort.id == this.cohortId
        );
        if (foundObject) {
            this.cohortName = foundObject.name;
        }

        if (this.cohortId != 'all-students') {
            await this.getCohortDurationPerDay();
            await this.getCohortStudentTotalDurations();
        } else {
            await this.getAllStudentsDurationPerDay();
            await this.getAllStudentsStudentTotalDurations();
        }
    },
    methods: {
        async getCohortDurationPerDay() {
            fetch(`/student-analytics/cohort-duration-per-day/${this.cohortId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].formattedQuantity =
                            this.millisToMinutesAndSeconds(data[i].quantity);

                        data[i].formattedQuantity =
                            this.convertMinutesSecondsToSeconds(
                                data[i].formattedQuantity
                            );

                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.durationsPerDay = data;
                })
                .catch((error) => {
                    console.error(
                        'Error fetching student duration per day:',
                        error
                    );
                });
        },
        async getAllStudentsDurationPerDay() {
            fetch(
                `/student-analytics/all-students-duration-per-day/${this.userDetailsStore.userId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].formattedQuantity =
                            this.millisToMinutesAndSeconds(data[i].quantity);

                        data[i].formattedQuantity =
                            this.convertMinutesSecondsToSeconds(
                                data[i].formattedQuantity
                            );

                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.durationsPerDay = data;
                })
                .catch((error) => {
                    console.error(
                        'Error fetching student duration per day:',
                        error
                    );
                });
        },
        async getCohortStudentTotalDurations() {
            fetch(`/student-analytics/cohort-total-durations/${this.cohortId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].formattedQuantity =
                            this.millisToMinutesAndSeconds(data[i].quantity);
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.studentTotalDurations = data;
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
                })
                .catch((error) => {
                    console.error(
                        'Error fetching student duration per day:',
                        error
                    );
                });
        },
        millisToMinutesAndSeconds(millis) {
            var minutes = Math.floor(millis / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        },
        convertMinutesSecondsToSeconds(durationString) {
            const parts = durationString.split(':');
            if (parts.length !== 2) {
                throw new Error("Invalid duration format. Expected 'MM:SS'.");
            }
            const minutes = parseInt(parts[0], 10);
            const seconds = parseInt(parts[1], 10);

            if (isNaN(minutes) || isNaN(seconds)) {
                throw new Error('Invalid numerical values in duration string.');
            }

            return minutes * 60 + seconds;
        }
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">Time Report</h1>
            <h2 class="secondary-heading h3">{{ cohortName }}</h2>
        </span>

        <h2 class="secondary-heading">Total time on platform per day</h2>
        <CohortDurationPerDayLineChart
            :data="durationsPerDay"
            v-if="durationsPerDay.length > 0"
        />
        <p v-else>No time recorded yet</p>

        <h2 class="secondary-heading mt-4">
            Total time on platform, comparing students
        </h2>
        <CohortCompareDurationHorizontalChart
            :data="studentTotalDurations"
            :colour="'#5f31dd'"
            v-if="studentTotalDurations.length > 0"
        />
        <p v-else>No time recorded yet</p>

        <h2 class="secondary-heading mt-4">Minutes per skill</h2>
    </div>
</template>

<style></style>
