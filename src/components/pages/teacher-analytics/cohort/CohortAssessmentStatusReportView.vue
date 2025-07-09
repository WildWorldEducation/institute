<script>
export default {
    setup() {
        return {};
    },
    components: {},
    data() {
        return {};
    },
    async created() {},
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
        <h1 class="heading">Assessment Status Report: {{ cohortName }}</h1>
        <h2 class="secondary-heading">Passed</h2>
        <h2 class="secondary-heading">Attempted</h2>
        <h2 class="secondary-heading">Failed multiple times</h2>
    </div>
</template>

<style></style>
