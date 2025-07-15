<script>
export default {
    setup() {
        return {};
    },
    components: {},
    data() {
        return {
            tenantId: this.$route.params.tenantId
        };
    },
    async created() {},
    methods: {}
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
        <ul>
            <li><p>average interaction time per skills</p></li>
            <li>
                <p>
                    how many tokens it’s taking, on average, for a student to
                    master a skill (to help manage budgeting and understand
                    spending)
                </p>
            </li>
        </ul>

        <h2 class="secondary-heading mt-5">Student Progress & Attendance</h2>
        <h3>Usage and Fidelity Reports</h3>
        <p>
            Track weekly and cumulative usage, including the percentage of
            students who completed at least one skill, total tutoring time, and
            engagement by school/class.
        </p>
        <ul>
            <li>percentage of students who completed at least one skill</li>
            <li>total tutoring time</li>
            <li>engagement by school/class</li>
            <li>percentage of students who completed at least one skill</li>
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
