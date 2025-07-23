<script>
import { useCohortsStore } from '../../../../stores/CohortsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import CohortDurationPerDayLineChart from '../../../components/teacher-analytics/cohorts/CohortDurationPerDayLineChart.vue';

export default {
    setup() {
        const cohortsStore = useCohortsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            cohortsStore,
            userDetailsStore
        };
    },
    components: { CohortDurationPerDayLineChart },
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohortName: '',
            durationsPerDay: []
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
        } else {
            await this.getAllStudentsDurationPerDay();
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
        async getCohortDurationPerDay() {
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
                    console.log(this.durationsPerDay);
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
            Total time on skills, comparing students
        </h2>
        <ul>
            <li><em>Time on platform, comparing students</em></li>
            <li><em>bar chart</em></li>
        </ul>
        maybe later:
        <ul>
            <li><em>allow change of order</em></li>
            <li><em>Choose by day, week etc</em></li>
        </ul>

        <h2 class="secondary-heading">
            Total time on platform, comparing students
        </h2>
        <ul>
            <li><em>Time on platform, comparing students</em></li>
            <li><em>bar chart</em></li>
            <li><em>allow change of order</em></li>
            <li><em>Choose by day, week etc</em></li>
        </ul>

        <div v-if="isDataLoaded">
            <h2 class="secondary-heading">All skills</h2>
            <!-- <p><em>line chart, over days / hours</em></p> -->
            <p>{{ millisToMinutesAndSeconds(this.allSkillsDuration) }}</p>
            <h2 class="secondary-heading">Minutes per skill</h2>
            <TimePerSkillHorizontalBarChart
                v-if="skillDurations.length > 0"
                :data="skillDurations"
                colour="darkgreen"
            />
            <div v-if="this.skillDurations.length > 0" class="mb-4">
                <table class="table">
                    <tr>
                        <th>Skill</th>
                        <th>Duration</th>
                    </tr>
                    <tr
                        v-for="skillDuration in skillDurations"
                        :key="skillDuration.id"
                        class="table-rows"
                    >
                        <td>
                            <router-link
                                target="_blank"
                                :to="'/skills/' + skillDuration.url"
                                >{{ skillDuration.name }}</router-link
                            >
                        </td>
                        <td>
                            {{
                                millisToMinutesAndSeconds(
                                    skillDuration.quantity
                                )
                            }}
                        </td>
                    </tr>
                </table>
            </div>
            <div v-else>
                <p>No skills visited by this student.</p>
            </div>
        </div>
    </div>
</template>

<style></style>
