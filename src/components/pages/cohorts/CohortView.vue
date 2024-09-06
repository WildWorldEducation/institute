<script>
import FilterParent from '../../components/filter-system/FilterParent.vue';

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
    components: {
        FilterParent
    },
    methods: {
        async getCohort() {
            fetch('/cohorts/' + this.cohortId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
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
        <h2>Members</h2>
        <ul>
            <li v-for="member in members">{{ member.username }}</li>
        </ul>
        <h2>Filters</h2>
        <FilterParent />
    </div>
</template>

<style scoped></style>
