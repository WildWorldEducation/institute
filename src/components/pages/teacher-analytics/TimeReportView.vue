<script>
export default {
    setup() {},
    data() {
        return {
            studentId: this.$route.params.studentId,
            skillDurations: []
        };
    },
    async created() {
        this.getSkillDuration();
    },
    methods: {
        getSkillDuration() {
            fetch(`/student-analytics/skill-durations/${this.studentId}`)
                .then((response) => response.json())
                .then((data) => {
                    this.skillDurations = data;
                    console.log('Skill durations:', this.skillDurations);
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
        <h1 class="heading">Time Report</h1>
    </div>
</template>

<style></style>
