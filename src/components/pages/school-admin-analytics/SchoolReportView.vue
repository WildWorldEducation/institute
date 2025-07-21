<script>
import TenantAvgTokensToMasterSkillsHorizontalBarChart from '../../components/teacher-analytics/tenants/TenantAvgTokensToMasterSkillsHorizontalBarChart.vue';
import TenantAvgInteractionTimePerSkillHorizontalBarChart from '../../components/teacher-analytics/tenants/TenantAvgInteractionTimePerSkillHorizontalBarChart.vue';
import TenantPercentageStudentsMasteredAtLeastOneSkillPieChart from '../../components/teacher-analytics/tenants/TenantPercentageStudentsMasteredAtLeastOneSkillPieChart.vue';
export default {
    setup() {
        return {};
    },
    components: {
        TenantAvgTokensToMasterSkillsHorizontalBarChart,
        TenantAvgInteractionTimePerSkillHorizontalBarChart,
        TenantPercentageStudentsMasteredAtLeastOneSkillPieChart
    },
    data() {
        return {
            tenantId: this.$route.params.tenantId,
            avgTokensToMasterSkills: [],
            avgTimeOnSkills: [],
            percentageStudentsMasteredOneSkill: []
        };
    },
    async created() {
        await this.getAvgTokensToMasterSkills();
        await this.getAvgTimeOnSkills();
        await this.getPercentageStudentsMasteredOneSkill();
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

        <h4 class="mt-5">Average number of tokens to master a skill</h4>
        <TenantAvgTokensToMasterSkillsHorizontalBarChart
            v-if="avgTokensToMasterSkills.length > 0"
            :data="avgTokensToMasterSkills"
            colour="darkgreen"
        />

        <h2 class="secondary-heading mt-5">Student Progress & Attendance</h2>
        <h3>Usage and Fidelity Reports</h3>
        <h4>
            Percentage of students who completed at least one skill (cumulative)
        </h4>
        <TenantPercentageStudentsMasteredAtLeastOneSkillPieChart
            v-if="percentageStudentsMasteredOneSkill.length > 0"
            :data="percentageStudentsMasteredOneSkill"
        />
        <ul class="mt-5">
            <li>
                percentage of students who completed at least one skill
                <ul>
                    <li>
                        <em>task made</em>
                    </li>
                    <li>
                        <em
                            >percentage of students who completed at least one
                            skill
                        </em>
                    </li>
                    <li>
                        <em>pie chart </em>
                    </li>
                    <li>
                        <em>add weekly version</em>
                    </li>
                </ul>
            </li>
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
            <li class="mt-3">any others?</li>
        </ul>

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
