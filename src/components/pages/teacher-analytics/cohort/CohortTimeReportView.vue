<script>
import { useCohortsStore } from '../../../../stores/CohortsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
export default {
    setup() {
        const cohortsStore = useCohortsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            cohortsStore,
            userDetailsStore
        };
    },
    components: {},
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohortName: ''
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
    },
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
            <h1 class="heading">Time Report</h1>
            <h2 class="secondary-heading h3">{{ cohortName }}</h2>
        </span>
        <h2 class="secondary-heading">
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

        <h2 class="secondary-heading">
            Total time on platform, comparing time
        </h2>
        <ul>
            <li><em>Time on platform, comparing students</em></li>
            <li><em>line chart, over days</em></li>
            <li>
                <em>Would have to record the time each day</em>
            </li>
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
