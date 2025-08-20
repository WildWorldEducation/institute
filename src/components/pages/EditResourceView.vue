<script>
import EditResource from '../components/EditResource.vue';
import SkillTimeTracker from '../components/analytics/SkillTimeTracker.vue';
export default {
    data() {
        return {
            resourceId: this.$route.params.resourceId,
            skillId: null
        };
    },
    components: {
        EditResource,
        SkillTimeTracker
    },
    async created() {
        // get skill id, for time tracker
        const res = await fetch('/resources/show/' + this.resourceId);
        const resource = await res.json();
        this.skillId = resource.skill_id;
    },
    beforeRouteLeave(to, from, next) {
        this.$refs.skillTimeTracker.saveDuration();
        next();
    }
};
</script>

<template>
    <EditResource />
    <!-- To track student time for this skill -->
    <SkillTimeTracker ref="skillTimeTracker" v-if="skillId" />
</template>

<style></style>
