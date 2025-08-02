<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useTeacherAnalyticsStore } from '../../../stores/TeacherAnalyticsStore';
import { useUserSkillsStore } from '../../../stores/UserSkillsStore';
import PassedAssessmentsTimelineChart from '../../components/teacher-analytics/students/PassedAssessmentsTimelineChart.vue';
import AttemptedAssessmentsTimelineChart from '../../components/teacher-analytics/students/AttemptedAssessmentsTimelineChart.vue';
import FailedAssessmentsHorizontalBarChart from '../../components/teacher-analytics/students/FailedAssessmentsHorizontalBarChart.vue';
import TimePerSkillHorizontalBarChart from '../../components/teacher-analytics/students/TimePerSkillHorizontalBarChart.vue';
import StudentDurationPerDayLineChart from '../../components/teacher-analytics/students/StudentDurationPerDayLineChart.vue';
import StudentAvgTokensToMasterSkillsHorizontalBarChart from '../../components/teacher-analytics/students/StudentAvgTokensToMasterSkillsHorizontalBarChart.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        const userSkillsStore = useUserSkillsStore();
        return {
            userDetailsStore, teacherAnalyticsStore, userSkillsStore
        };
    },
    components: {
        // assessments
        PassedAssessmentsTimelineChart,
        AttemptedAssessmentsTimelineChart,
        FailedAssessmentsHorizontalBarChart,
        // engagement
        TimePerSkillHorizontalBarChart,
        StudentDurationPerDayLineChart,
        StudentAvgTokensToMasterSkillsHorizontalBarChart
    },
    data() {
        return {
            studentId: this.userDetailsStore.userId,
            assessmentPasses: [],
            assessmentAttempts: [],
            multipleFails: [],
            skillDurations: [],
            durationsPerDay: [],
            tokensPerSkills: []
        };
    },
    async created() {
        // assessments
        await this.getAssessmentAttempts();
        await this.getAssessmentPasses();
        await this.teacherAnalyticsStore.getStudentMultipleFails(
            this.userDetailsStore.userId
        );
        // engagement
        await this.getSkillDuration();
        await this.getStudentDurationPerDay();
        await this.getAvgTokensToMasterSkills();
    },
    methods: {
        // assessments
        async getAssessmentAttempts() {
            fetch(
                `/student-analytics/started-unmastered-assessments/${this.userDetailsStore.userId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    this.assessmentAttempts = data.map((e) => {
                        return {
                            ...e,
                            url: `/skills/${e.url}`,
                            // labelName: `${e.rootParent} - ${e.name}`
                            labelName: `${e.name}`
                        };
                    });
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        },       
        async getAssessmentPasses() {
            await this.userSkillsStore.getMasteredSkills(this.userDetailsStore.userId);            

            this.assessmentPasses = this.userSkillsStore.masteredSkills.map(
                (e) => {
                    return {
                        ...e,
                        url: `/skills/${e.url}`,
                        // labelName: `${e.rootParent} - ${e.name}`
                        labelName: `${e.name}`
                    };
                }
            );
        },
        // engagement
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
        async getStudentDurationPerDay() {
            fetch(
                `/student-analytics/student-duration-per-day/${this.studentId}`
            )
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].formattedQuantity = data[i].quantity / 1000;
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
        async getAvgTokensToMasterSkills() {
            try {
                const response = await fetch(
                    `/student-analytics/avg-tokens-to-master-skills/student/${this.studentId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.tokensPerSkills = Array.isArray(data) ? data : [];
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.tokensPerSkills = [];
            }
        },
        millisToMinutesAndSeconds(millis) {
            var minutes = Math.floor(millis / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
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
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">My Progress</h1>
        </span>
        <h2 class="heading">Assessments</h2>
        <h4 class="secondary-heading"> Failed multiple times</h4>
        <FailedAssessmentsHorizontalBarChart
            v-if="teacherAnalyticsStore.studentMultipleFails.length > 0"
            :data="teacherAnalyticsStore.studentMultipleFails"
            colour="darkred"
            class="mb-5"
        />       
        <p v-else>
            This student has not failed any assessments more than once yet.
        </p>
        <h4 class="secondary-heading">Passed</h4>
        <PassedAssessmentsTimelineChart
            class="mb-5"
            v-if="assessmentPasses.length > 0"
            :data="assessmentPasses"
        />     
        <p v-else>This student has not completed any assessments yet.</p>

        <h4 class="secondary-heading">Attempted</h4>
        <AttemptedAssessmentsTimelineChart
            class="mb-5"
            v-if="assessmentAttempts.length > 0"
            :data="assessmentAttempts"
        />      
        <p v-else>This student has attempted any assessments yet.</p>
       
        <h2 class="heading">Engagement</h2>
        <h4>Time spent on each skill</h4>
        <TimePerSkillHorizontalBarChart
            v-if="skillDurations.length > 0"
            :data="skillDurations"
            colour="purple"
        />
        <p v-else>No data yet</p>
        <h4 class="mt-5">Time spent per day</h4>
        <StudentDurationPerDayLineChart
            v-if="durationsPerDay.length > 0"
            :data="durationsPerDay"
            colour="purple"
        />
        <p v-else>No data yet</p>
        <h4 class="mt-5">Tokens spent per skill</h4>
        <StudentAvgTokensToMasterSkillsHorizontalBarChart
            class="mb-5"
            v-if="tokensPerSkills.length > 0"
            :data="tokensPerSkills"
            colour="purple"
        />
        <p v-else>No data yet</p>
    </div>
</template>

<style></style>
