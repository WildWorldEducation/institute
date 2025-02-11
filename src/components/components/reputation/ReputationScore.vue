<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            reputationScore: this.userDetailsStore.reputationScore
        };
    },
    created() {},
    async mounted() {
        await this.userDetailsStore.getUserDetails();
    },
    methods: {}
};
</script>

<template>Score: {{ reputationScore }}</template>
<style scoped></style>
