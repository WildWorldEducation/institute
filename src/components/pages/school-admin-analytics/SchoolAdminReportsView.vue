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
        <h3>Per Tenant</h3>
        <p>"Skill Engagement"</p>
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
        <h3>Per Tenant</h3>
        <p>"Usage and Fidelity Reports"</p>
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

        <h3>Per Class</h3>
        <p>"Usage and Fidelity Reports"</p>
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
        <h3>Per Tenant</h3>
        <h4>Growth Analytics</h4>
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

        <h4 class="mt-4">Assessment Completion Tracking</h4>
        <p>
            Visualizes the percentage of students who have completed, are in
            progress, or have not started skills' assessments, with daily and
            weekly updates.
        </p>

        <h4 class="mt-4">Performance by Skill Category</h4>
        <strong>per tenant</strong>
        <p>
            Allows drill-down into skill categories to view where extra help
            might be needed (e.g. with math, science, history, etc.)
        </p>
        <p><em>What skills / categories are students failing the most?</em></p>

        <h3 class="mt-5">Per Student</h3>
        <h4>Growth Analytics</h4>
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

        <h4 class="mt-4">Estimated Mastery Scores</h4>
        <p>
            Offers the current best estimate of a student’s progress, calculated
            from all available data (skills completed per their grade's cohort
            skills—e.g. "12th grade skills").
        </p>
        <p>
            <em
                >Student skills completed as percentage of grade level
                skills</em
            >
        </p>
    </div>
</template>

<style></style>
