<script>
import { useUsersStore } from '../../../../../stores/UsersStore';
import TimePerSkillHorizontalBarChart from '../../../../components/teacher-analytics/students/TimePerSkillHorizontalBarChart.vue';
import StudentDurationPerDayLineChart from '../../../../components/teacher-analytics/students/StudentDurationPerDayLineChart.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        return {
            usersStore
        };
    },
    components: {
        TimePerSkillHorizontalBarChart,
        StudentDurationPerDayLineChart
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            skillDurations: [],
            durationsPerDay: [],
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
        await this.getStudentDurationPerDay();
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
        async getStudentDurationPerDay() {
            fetch(
                `/student-analytics/student-duration-per-day/${this.studentId}`
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
            <h2 class="secondary-heading h3">{{ studentName }}</h2>
        </span>
        <p>
            <em>
                Please note that time spent on external sources (e.g. websites)
                related to skills is not measured.</em
            >
        </p>

        <div v-if="isDataLoaded">
            <h4 class="secondary-heading">Total time on platform</h4>
            <StudentDurationPerDayLineChart
                v-if="durationsPerDay.length > 0"
                :data="durationsPerDay"
            />
            <p v-else>There is no data to show yet.</p>
            <h4 class="secondary-heading">All skills</h4>
            <p>{{ millisToMinutesAndSeconds(this.allSkillsDuration) }}</p>
            <h4 class="secondary-heading">Minutes per skill</h4>
            <TimePerSkillHorizontalBarChart
                v-if="skillDurations.length > 0"
                :data="skillDurations"
                colour="darkgreen"
            />
            <div v-else>
                <p>No skills visited by this student.</p>
            </div>
        </div>
    </div>
    <p>&nbsp;</p>
</template>

<style></style>
