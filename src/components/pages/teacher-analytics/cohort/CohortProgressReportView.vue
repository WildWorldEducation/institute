<script>
import { useCohortsStore } from '../../../../stores/CohortsStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
export default {
    setup() {
        const cohortsStore = useCohortsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            cohortsStore,
            userDetailsStore
        };
    },
    components: {},
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohortName: ''
        };
    },
    async created() {
        if (this.cohortsStore.cohorts.length < 1) {
            await this.cohortsStore.getCohorts(this.userDetailsStore.userId);
        }
        const foundObject = this.cohortsStore.cohorts.find(
            (cohort) => cohort.id == this.cohortId
        );
        if (foundObject) {
            this.cohortName = foundObject.name;
        }
    },
    methods: {}
};
</script>

<template>
    <div class="container">
        <h1 class="heading">Progress Report: {{ cohortName }}</h1>
        <p>Number of skills mastered over time</p>
        <p>Line chart</p>
        <p>May have to record when the user started on the platform</p>
    </div>
</template>

<style></style>
