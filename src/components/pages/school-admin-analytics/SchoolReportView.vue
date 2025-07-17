<script>
import TenantAvgTokensToMasterSkillsHorizontalBarChart from '../../components/teacher-analytics/tenants/TenantAvgTokensToMasterSkillsHorizontalBarChart.vue';
import TenantAvgInteractionTimePerSkillHorizontalBarChart from '../../components/teacher-analytics/tenants/TenantAvgInteractionTimePerSkillHorizontalBarChart.vue';
export default {
    setup() {
        return {};
    },
    components: {
        TenantAvgTokensToMasterSkillsHorizontalBarChart,
        TenantAvgInteractionTimePerSkillHorizontalBarChart
    },
    data() {
        return {
            tenantId: this.$route.params.tenantId,
            avgTokensToMasterSkills: [],
            avgTimeOnSkills: []
        };
    },
    async created() {
        await this.getAvgTokensToMasterSkills();
        await this.getAvgTimeOnSkills();
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
            } catch (error) {
                console.error(
                    'Error fetching cohort mastered assessments:',
                    error
                );
                this.avgTimeOnSkills = [];
            }
        }
    }
};
</script>

<template>
    <div class="container">
        <span class="d-flex justify-content-between w-100">
            <h1 class="heading">School Admin Report</h1>
            <h2 class="secondary-heading h3">{{ tenantName }}</h2>
        </span>
        <h2 class="secondary-heading">Resource usage</h2>
        <h3>Skill Engagement</h3>
        <h4>Average interaction time per skill</h4>
        <TenantAvgInteractionTimePerSkillHorizontalBarChart
            v-if="avgTimeOnSkills.length > 0"
            :data="avgTimeOnSkills"
            colour="darkblue"
        />

        <h4>Average amount of tokens to master a skill</h4>
        <TenantAvgTokensToMasterSkillsHorizontalBarChart
            v-if="avgTokensToMasterSkills.length > 0"
            :data="avgTokensToMasterSkills"
            colour="darkblue"
        />

        <h2 class="secondary-heading mt-5">Student Progress & Attendance</h2>
        <h3>Usage and Fidelity Reports</h3>
        <p>
            Track weekly and cumulative usage, including the percentage of
            students who completed at least one skill, total tutoring time, and
            engagement.
        </p>
        <ul>
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
                </ul>
            </li>
            <li>total tutoring time</li>
            <li>
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
                </ul>
            </li>
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
