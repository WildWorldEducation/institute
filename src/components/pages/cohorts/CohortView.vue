<script>
export default {
    setup() {},
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohort: {},
            members: []
        };
    },
    async created() {
        await this.getCohort();
        await this.getCohortMembers();
    },
    methods: {
        async getCohort() {
            fetch('/cohorts/' + this.cohortId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    console.log(data);
                    this.cohort = data;
                });
        },
        async getCohortMembers() {
            fetch('/cohorts/' + this.cohortId + '/members')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.members = data;
                });
        }
    }
};
</script>

<template>
    <div class="container">
        <h1>Cohorts: {{ cohort.name }}</h1>
        <h2>Filters</h2>
        <h2>Members</h2>
        <ul>
            <li v-for="member in members">{{ member.username }}</li>
        </ul>
    </div>
</template>

<style scoped></style>
