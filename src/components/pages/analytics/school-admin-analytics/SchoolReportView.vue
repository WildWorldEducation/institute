<script>
import TenantAvgTokensToMasterSkillsHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantAvgTokensToMasterSkillsHorizontalBarChart.vue';
import TenantAvgInteractionTimePerSkillHorizontalBarChart from '../../../components/teacher-analytics/tenants/TenantAvgInteractionTimePerSkillHorizontalBarChart.vue';
import TenantPercentageStudentsMasteredAtLeastOneSkillPieChart from '../../../components/teacher-analytics/tenants/TenantPercentageStudentsMasteredAtLeastOneSkillPieChart.vue';
import TenantProgressLineChart from '../../../components/teacher-analytics/tenants/TenantProgressLineChart.vue';
import TenantDurationPerDayLineChart from '../../../components/teacher-analytics/tenants/TenantDurationPerDayLineChart.vue';

export default {
    setup() {
        return {};
    },
    components: {
        TenantAvgTokensToMasterSkillsHorizontalBarChart,
        TenantAvgInteractionTimePerSkillHorizontalBarChart,
        TenantPercentageStudentsMasteredAtLeastOneSkillPieChart,
        TenantProgressLineChart,
        TenantDurationPerDayLineChart
    },
    data() {
        return {
            tenantId: this.$route.params.tenantId,
            avgTokensToMasterSkills: [],
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
            <!-- <h2 class="secondary-heading h3">{{ tenantName }}</h2>-->
        </span>
        <h2 class="secondary-heading">Skill Engagement & Resource Usage</h2>
        <h4>Average interaction time per skill (minutes)</h4>
        <TenantAvgInteractionTimePerSkillHorizontalBarChart
            v-if="avgTimeOnSkills.length > 0"
            :data="avgTimeOnSkills"
            colour="purple"
        />
        <p v-else>No data yet</p>

        <h4 class="mt-5">Average number of tokens to master a skill</h4>
        <TenantAvgTokensToMasterSkillsHorizontalBarChart
            v-if="avgTokensToMasterSkills.length > 0"
            :data="avgTokensToMasterSkills"
            colour="darkgreen"
        />
        <p v-else>No data yet</p>

        <h2 class="secondary-heading">Student Progress & Attendance</h2>
        <h3>Usage and Fidelity Reports</h3>
        <h4>
            Percentage of students who completed at least one skill (cumulative)
        </h4>
        <TenantPercentageStudentsMasteredAtLeastOneSkillPieChart
            v-if="percentageStudentsMasteredOneSkill.length > 0"
            :data="percentageStudentsMasteredOneSkill"
            class="mb-5"
        />
        <p v-else>No data yet</p>
        <p>add weekly version</p>

        <h4>Tenant progress</h4>
        <TenantProgressLineChart
            v-if="tenantProgress.length > 0"
            :data="tenantProgress"
            colour="#5f31dd"
            class="mb-5 mt-5"
        />
        <p v-else>No data yet</p>
        <ul class="mt-5">
            <li class="mt-3">
                total tutoring time
                <ul>
                    <li>
                        <em>weekly and cumulative usage</em>
                    </li>
                </ul>
            </li>
            <li class="mt-3">
                engagement
                <ul>
                    <li><em>task made</em></li>
                    <li>
                        <em>starting date is when first student started on</em>
                    </li>
                    <li>
                        <em>total time on platform </em>
                    </li>
                    <li>
                        <em>line chart </em>
                    </li>
                    <li>
                        <em>weekly and cumulative usage</em>
                    </li>
                </ul>
            </li>
        </ul>
        <TenantDurationPerDayLineChart
            v-if="studentDurationsPerSkill.length > 0"
            :data="studentDurationsPerSkill"
            colour="#5f31dd"
            class="mb-5 mt-5"
        />

        <h2 class="secondary-heading mt-5">Academic Performance Overview</h2>
        <h3>Growth Analytics</h3>
        <p>
            (Jonathan, you may be able to determine what would be both easiest
            and most compelling for us to share at this level—e.g. Skills
            mastered, Key Skills mastered by student grade, progress made, %
            progress made within cohorts, etc.)
        </p>
        <ul>
            <li>number of skills mastered</li>
            <li>% progress made within cohorts</li>
        </ul>

        <h3>Assessment Completion Tracking</h3>
        <p>
            Visualizes the percentage of students who have completed, are in
            progress, or have not started skills' assessments, with daily and
            weekly updates.
        </p>

        <h3>Performance by Skill Category</h3>
        <p>
            Allows drill-down into skill categories to view where extra help
            might be needed (e.g. with math, science, history, etc.)
        </p>
        <p><em>What skills / categories are students failing the most?</em></p>
    </div>
</template>

<style></style>
