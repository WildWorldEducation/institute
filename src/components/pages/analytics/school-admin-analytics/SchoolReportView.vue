<script>
import TenantAvgTokensToMasterSkillsHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantAvgTokensToMasterSkillsHorizontalBarChart.vue';
import TenantAvgInteractionTimePerSkillHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantAvgInteractionTimePerSkillHorizontalBarChart.vue';
import TenantPercentageStudentsMasteredAtLeastOneSkillPieChart from '../../../components/teacher-analytics/tenants/TenantPercentageStudentsMasteredAtLeastOneSkillPieChart.vue';
import TenantProgressLineChart from '../../../components/teacher-analytics/tenants/TenantProgressLineChart.vue';
import TenantDurationPerDayLineChart from '../../../components/teacher-analytics/tenants/TenantDurationPerDayLineChart.vue';
import TenantTokensPerSkillHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantTokensPerSkillHorizontalBarChart.vue';

export default {
    setup() {
        return {};
    },
    components: {
        TenantAvgTokensToMasterSkillsHorizontalBarChart,
        TenantTokensPerSkillHorizontalBarChart,
        TenantAvgInteractionTimePerSkillHorizontalBarChart,
        TenantPercentageStudentsMasteredAtLeastOneSkillPieChart,
        TenantProgressLineChart,
        TenantDurationPerDayLineChart
    },
    data() {
        return {
            chosenPage: 1,
            tenantId: this.$route.params.tenantId,
            avgTokensToMasterSkills: [],
            totalTokensPerSkill: [],
            avgTimeOnSkills: [],
            percentageStudentsMasteredOneSkill: [],
            tenantProgress: [],
            studentDurationsPerSkill: []
        };
    },
    async created() {
        await this.getAvgTokensToMasterSkills();
        await this.getAvgTimeOnSkills();
        await this.getPercentageStudentsMasteredOneSkill();
        await this.getTenantProgress();
        await this.getTenantDuration();
    },
    methods: {
        async getAvgTokensToMasterSkills() {
            try {
                const response = await fetch(
                    `/student-analytics/avg-tokens-to-master-skills/tenant/${this.tenantId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.avgTokensToMasterSkills = Array.isArray(data) ? data : [];
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.avgTokensToMasterSkills = [];
            }
        },
        async getAvgTimeOnSkills() {
            try {
                const response = await fetch(
                    `/student-analytics/avg-times-on-skills/tenant/${this.tenantId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.avgTimeOnSkills = Array.isArray(data) ? data : [];
                for (let i = 0; i < this.avgTimeOnSkills.length; i++) {
                    this.avgTimeOnSkills[i].formattedQuantity =
                        this.millisToMinutesAndSeconds(
                            this.avgTimeOnSkills[i].quantity
                        );
                }
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.avgTimeOnSkills = [];
            }
        },
        async getPercentageStudentsMasteredOneSkill() {
            try {
                const response = await fetch(
                    `/student-analytics/percentage-students-mastered-one-skill/tenant/${this.tenantId}`
                );

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                this.percentageStudentsMasteredOneSkill = await response.json();
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.percentageStudentsMasteredOneSkill = [];
            }
        },
        async getTenantProgress() {
            fetch(`/student-analytics/tenant-progress/${this.tenantId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.tenantProgress = data;
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
                });
        },
        async getTenantDuration() {
            fetch(`/student-analytics/tenant-duration-per-day/${this.tenantId}`)
                .then((response) => response.json())
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = new Date(data[i].date);
                        data[i].formattedQuantity = data[i].quantity / 1000;
                    }
                    data.sort((a, b) => a.date - b.date);
                    this.studentDurationsPerSkill = data;
                })
                .catch((error) => {
                    console.error('Error fetching student progress:', error);
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
            <h1 class="heading">School Admin Report</h1>
        </span>
        <div>
            <button class="btn primary-btn me-1" @click="chosenPage = 1">
                Engagement
            </button>
            <button class="btn primary-btn me-1" @click="chosenPage = 2">
                Academic Performance
            </button>
            <button class="btn primary-btn" @click="chosenPage = 3">
                Resource Usage
            </button>
        </div>
        <div v-if="chosenPage == 1">
            <div class="mt-2 mb-4">
                <button class="btn btn-dark me-1">Total</button>
                <button class="btn btn-dark me-1">This week</button>
            </div>
            <h4>Average interaction time per skill (minutes)</h4>
            <TenantAvgInteractionTimePerSkillHorizontalBarChart
                v-if="avgTimeOnSkills.length > 0"
                :data="avgTimeOnSkills"
                colour="purple"
                class="mb-5"
            />
            <p v-else>No data yet</p>
            <h4>Time spent on platform per day</h4>
            <TenantDurationPerDayLineChart
                v-if="studentDurationsPerSkill.length > 0"
                :data="studentDurationsPerSkill"
                colour="#5f31dd"
                class="mb-5"
            />
            <p v-else>No data yet</p>

            <h4>
                Percentage of students who completed at least one skill
                (cumulative)
            </h4>
            <TenantPercentageStudentsMasteredAtLeastOneSkillPieChart
                v-if="percentageStudentsMasteredOneSkill.length > 0"
                :data="percentageStudentsMasteredOneSkill"
            />
            <p v-else>No data yet</p>
            <p>add total tutoring time</p>
        </div>

        <div v-else-if="chosenPage == 2">
            <div class="mt-2 mb-4">
                <button class="btn btn-dark me-1">Total</button>
                <button class="btn btn-dark me-1">This week</button>
            </div>
            <h3>Growth Analytics</h3>
            <h4>Tenant progress</h4>
            <TenantProgressLineChart
                v-if="tenantProgress.length > 0"
                :data="tenantProgress"
                colour="#5f31dd"
                class="mb-5 mt-5"
            />
            <p v-else>No data yet</p>
            <p>number of skills mastered</p>

            <h3>Assessment Completion Tracking</h3>
            <p>
                Visualizes the percentage of students who have completed, are in
                progress, or have not started skills' assessments, with daily
                and weekly updates.
            </p>

            <h3>Performance by Skill Category</h3>
            <p>
                Allows drill-down into skill categories to view where extra help
                might be needed (e.g. with math, science, history, etc.)
            </p>
            <p>
                <em>What skills / categories are students failing the most?</em>
            </p>
        </div>

        <div v-if="chosenPage == 3">
            <div class="mt-2 mb-4">
                <button class="btn btn-dark me-1">Total</button>
                <button class="btn btn-dark me-1">This week</button>
            </div>
            <h4 class="mt-5">Average number of tokens to master a skill</h4>
            <TenantAvgTokensToMasterSkillsHorizontalBarChart
                v-if="avgTokensToMasterSkills.length > 0"
                :data="avgTokensToMasterSkills"
                colour="darkgreen"
            />
            <p v-else>No data yet</p>

            <TenantTokensPerSkillHorizontalBarChart
                v-if="totalTokensPerSkill.length > 0"
                :data="totalTokensPerSkill"
                colour="darkgreen"
            />
            <p v-else>No data yet</p>
            <p>
                Number of tokens per skill (cut off recording usage after
                mastery)
            </p>
            <p>Number of tokens per day</p>
        </div>
    </div>
</template>

<style></style>
