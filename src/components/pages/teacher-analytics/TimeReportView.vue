<script>
import { useUsersStore } from '../../../stores/UsersStore';
import TimePerSkillHorizontalBarChart from '../../components/student-analytics/TimePerSkillHorizontalBarChart.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        return {
            usersStore
        };
    },
    components: {
        TimePerSkillHorizontalBarChart
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            skillDurations: [],
            allSkillsDuration: 0,
            isDataLoaded: false
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

        await this.getSkillDuration();
        await this.getAllSkillsDuration();
        this.isDataLoaded = true;
    },
    methods: {
        async getSkillDuration() {
            fetch(`/student-analytics/skill-durations/${this.studentId}`)
                .then((response) => response.json())
                .then((data) => {
                    this.skillDurations = data;
                    for (let i = 0; i < this.skillDurations.length; i++) {
                        this.skillDurations[i].formattedQuantity =
                            this.millisToMinutesAndSeconds(
                                this.skillDurations[i].quantity
                            );
                    }
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        },
        async getAllSkillsDuration() {
            fetch(`/student-analytics/all-skills-duration/${this.studentId}`)
                .then((response) => response.json())
                .then((data) => {
                    this.allSkillsDuration = data.duration;
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
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
        <h1 class="heading">Time Report: {{ studentName }}</h1>
        <!-- <p>
            <em>
                Please note that time spent on external sources (e.g. websites)
                related to skills is not measured.</em
            >
        </p>
        <p>
            <em
                >Ability to choose time period - which will change entire
                page</em
            >
        </p> -->
        <h2 class="secondary-heading">Total time on platform</h2>
        <p><em>line chart, over days / hours</em></p>
        <p><em>Would have to record the time each day</em></p>
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
