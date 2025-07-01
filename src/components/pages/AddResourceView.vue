<script>
import AddResource from '../components/AddResource.vue';
import SkillTimeTracker from '../components/student-analytics/SkillTimeTracker.vue';
export default {
    setup() {},
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
