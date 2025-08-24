<script>
import AddResource from '../components/AddResource.vue';
import SkillTimeTracker from '../components/analytics/SkillTimeTracker.vue';
export default {
    data() {
        return {};
    },
    components: {
        AddResource,
        SkillTimeTracker
    },
    beforeRouteLeave(to, from, next) {
        this.$refs.skillTimeTracker.saveDuration();
        next();
    }
};
</script>

<template>
    <AddResource />
    <!-- To track student time for this skill -->
    <SkillTimeTracker ref="skillTimeTracker" />
</template>

<style></style>
