<script>
import { useUsersStore } from '../../../stores/UsersStore';
import { useUserSkillsStore } from '../../../stores/UserSkillsStore';
import FailedAssessmentsHorizontalBarChart from '../../components/student-analytics/FailedAssessmentsHorizontalBarChart.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userSkillsStore = useUserSkillsStore();
        return {
            usersStore,
            userSkillsStore
        };
    },
    components: {
        FailedAssessmentsHorizontalBarChart
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            assessmentAttempts: [],
            multipleFails: []
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

        await this.userSkillsStore.getMasteredSkills(this.studentId);
        await this.getAssessmentAttempts();
        await this.getMultipleFails();
    },
    methods: {
        async getAssessmentAttempts() {
            fetch(
                `/student-analytics/started-unmastered-assessments/${this.studentId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    this.assessmentAttempts = data;
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        },
        assessmentDate(date) {
            let jsDate = new Date(date);
            return jsDate.toLocaleString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
        },
        async getMultipleFails() {
            fetch(`/student-analytics/multiple-fails/${this.studentId}`)
                .then((response) => response.json())
                .then((data) => {
                    this.multipleFails = data;
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        }
    }
};
</script>

<template>
    <div class="container">
        <h1 class="heading">Assessment Status Report: {{ studentName }}</h1>
        <!-- <h2 class="secondary-heading">Combined</h2> -->
        <!-- <p>
            <em
                >line chart, over time period. Skill names on hover or
                permanently</em
            >
        </p>
        <p>
            <em>different colour line for passed, attempted, and failed</em>
        </p> -->
        <h2 class="secondary-heading">Passed</h2>
        <div v-if="this.userSkillsStore.masteredSkills.length > 0" class="mb-4">
            <table class="table">
                <tr>
                    <th>Skill</th>
                    <th>Date</th>
                </tr>
                <tr
                    v-for="skill in userSkillsStore.masteredSkills"
                    :key="skill.id"
                    class="table-rows"
                >
                    <td>
                        <router-link
                            target="_blank"
                            :to="'/skills/' + skill.url"
                            >{{ skill.name }}</router-link
                        >
                    </td>
                    <td>
                        {{ assessmentDate(skill.date) }}
                    </td>
                </tr>
            </table>
        </div>
        <p v-else>This student has not completed any assessments yet.</p>
        <h2 class="secondary-heading">Attempted</h2>
        <!-- <p>
            <em
                >line chart, over time period. Skill names on hover or
                permanently. Show number of attempts</em
            >
        </p> -->
        <div v-if="this.assessmentAttempts.length > 0" class="mb-4">
            <table class="table">
                <tr>
                    <th>Skill</th>
                    <th>Date</th>
                </tr>
                <tr
                    v-for="assessmentAttempt in assessmentAttempts"
                    :key="assessmentAttempt.id"
                    class="table-rows"
                >
                    <td>
                        <router-link
                            target="_blank"
                            :to="'/skills/' + assessmentAttempt.url"
                            >{{ assessmentAttempt.name }}</router-link
                        >
                    </td>
                    <td>
                        {{ assessmentDate(assessmentAttempt.date) }}
                    </td>
                </tr>
            </table>
        </div>
        <p v-else>This student has attempted any assessments yet.</p>
        <p></p>
        <h2 class="secondary-heading">Failed multiple times</h2>
        <FailedAssessmentsHorizontalBarChart
            v-if="multipleFails.length > 0"
            :data="multipleFails"
            colour="darkred"
        />
        <div v-if="this.multipleFails.length > 0" class="mb-4">
            <table class="table">
                <tr>
                    <th>Skill</th>
                    <th>Times</th>
                </tr>
                <tr
                    v-for="failedAssessment in multipleFails"
                    :key="failedAssessment.id"
                    class="table-rows"
                >
                    <td>
                        <router-link
                            target="_blank"
                            :to="'/skills/' + failedAssessment.url"
                            >{{ failedAssessment.name }}</router-link
                        >
                    </td>
                    <td>
                        {{ failedAssessment.quantity }}
                    </td>
                </tr>
            </table>
        </div>
        <p v-else>
            This student has not failed any assessments more than once yet.
        </p>
    </div>
</template>

<style></style>
