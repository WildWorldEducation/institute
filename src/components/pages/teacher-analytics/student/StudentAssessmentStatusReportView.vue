<script>
import { useUsersStore } from '../../../../stores/UsersStore';
import { useUserSkillsStore } from '../../../../stores/UserSkillsStore';
import { useTeacherAnalyticsStore } from '../../../../stores/TeacherAnalyticsStore';
import PassedAssessmentsTimelineChart from '../../../components/teacher-analytics/students/PassedAssessmentsTimelineChart.vue';
import FailedAssessmentsHorizontalBarChart from '../../../components/teacher-analytics/students/FailedAssessmentsHorizontalBarChart.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userSkillsStore = useUserSkillsStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        return {
            usersStore,
            userSkillsStore,
            teacherAnalyticsStore
        };
    },
    components: {
        FailedAssessmentsHorizontalBarChart,
        PassedAssessmentsTimelineChart
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            assessmentPasses: [],
            assessmentAttempts: [],
            multipleFails: []
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

        await this.getUserSkillMasteredHistory(this.studentId);
        await this.getAssessmentAttempts();

        if (this.teacherAnalyticsStore.studentMultipleFails.length == 0) {
            await this.teacherAnalyticsStore.getStudentMultipleFails(
                this.studentId
            );
        }

        this.isLoaded = true;
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
        async getUserSkillMasteredHistory(studentId) {
            await this.userSkillsStore.getMasteredSkills(studentId);
            this.assessmentPasses = this.userSkillsStore.masteredSkills.map(
                (e) => {
                    return {
                        ...e,
                        url: `/skills/${e.url}`,
                        labelName: `${e.rootParent} - ${e.name}`
                    };
                }
            );
        }
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">Assessment Status Report</h1>
            <h2 class="secondary-heading h3">{{ studentName }}</h2>
        </span>
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
        <PassedAssessmentsTimelineChart
            v-if="assessmentPasses.length > 0"
            :data="assessmentPasses"
        />
        <div v-if="assessmentPasses.length > 0" class="mt-4 mb-4">
            <table class="table">
                <tr>
                    <th>Skill</th>
                    <th>Date</th>
                </tr>
                <tr
                    v-for="skill in assessmentPasses"
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
                        {{ assessmentDate(skill.mastered_date) }}
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
            v-if="teacherAnalyticsStore.studentMultipleFails.length > 0"
            :data="teacherAnalyticsStore.studentMultipleFails"
            colour="darkred"
        />
        <div
            v-if="this.teacherAnalyticsStore.studentMultipleFails.length > 0"
            class="mb-4"
        >
            <table class="table">
                <tr>
                    <th>Skill</th>
                    <th>Times</th>
                </tr>
                <tr
                    v-for="failedAssessment in teacherAnalyticsStore.studentMultipleFails"
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
