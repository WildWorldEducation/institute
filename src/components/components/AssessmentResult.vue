<script>
// Import

export default {
    setup() {},
    data() {
        return {
            assessmentResult: '',
            finishDate: ''
        };
    },
    mounted() {
        this.assessmentResult = this.$parent.assessmentStatus;

        // convert the date time string to readable format
        // pass undefined in first argument to make the function working with all language
        this.finishDate =
            this.$parent.finishTime.toLocaleString(undefined, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) +
            ' at: ' +
            this.$parent.finishTime.toLocaleTimeString();
    },
    methods: {}
};
</script>

<template>
    <div class="container mt-3">
        <div class="page-tile">Assessment Result</div>
        <!-- Assessment Info -->
        <div class="assessment-info">
            <div>Result: {{ assessmentResult }}</div>
            <div>Finish Date: {{ finishDate }}</div>
        </div>
    </div>
</template>

<style scoped>
.page-tile {
    color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
    font-size: 1.75rem;
}
</style>
