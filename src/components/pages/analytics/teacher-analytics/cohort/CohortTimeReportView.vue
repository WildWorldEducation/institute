<script>
import { useCohortsStore } from '../../../../../stores/CohortsStore';
import { useUserDetailsStore } from '../../../../../stores/UserDetailsStore';
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
        CohortDurationPerSkillHorizontalBarChart
    },
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohortName: '',
            durationsPerDay: [],
            studentTotalDurations: [],
            studentDurationsPerSkill: []
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
            await this.getCohortDurationsPerSkill();
        } else {
            await this.getAllStudentsDurationPerDay();
            await this.getAllStudentsStudentTotalDurations();
            await this.getAllStudentsDurationsPerSkill();
        }
    },
    methods: {
        async getCohortDurationPerDay() {
            fetch(`/student-analytics/cohort-duration-per-day/${this.cohortId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].formattedQuantity =
                            data[i].quantity / (1000 * 60);
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
                            data[i].quantity / (1000 * 60);
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
        async getCohortDurationsPerSkill() {
            fetch(
                `/student-analytics/cohort-student-durations-per-skill/${this.cohortId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].formattedQuantity =
                            this.millisToMinutesAndSeconds(data[i].quantity);
                    }
                    this.studentDurationsPerSkill = data;
                })
                .catch((error) => {
                    console.error(
                        'Error fetching student durations per skill:',
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
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">Time Report</h1>
            <h2 class="secondary-heading h3">{{ cohortName }}</h2>
        </span>

        <h4 class="secondary-heading">Total time on platform per day</h4>
        <CohortDurationPerDayLineChart
            :data="durationsPerDay"
            v-if="durationsPerDay.length > 0"
            class="mb-5"
        />
        <p v-else>No time recorded yet</p>

        <h4 class="secondary-heading mt-4">
            Total time on platform, comparing students
        </h4>
        <CohortCompareDurationHorizontalChart
            :data="studentTotalDurations"
            :colour="'#5f31dd'"
            v-if="studentTotalDurations.length > 0"
            class="mb-5"
        />
        <p v-else>No time recorded yet</p>

        <h4 class="secondary-heading mt-4">Minutes per skill</h4>
        <CohortDurationPerSkillHorizontalBarChart
            :data="studentDurationsPerSkill"
            class="mb-5"
            :colour="'#5f31dd'"
            v-if="studentDurationsPerSkill.length > 0"
        />
    </div>
</template>

<style></style>
