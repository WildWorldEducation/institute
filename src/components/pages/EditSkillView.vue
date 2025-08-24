<script>
import { useSkillsStore } from '../../stores/skillsStore.js';

import EditSkill from '../components/EditSkill.vue';
import SkillTimeTracker from '../components/analytics/SkillTimeTracker.vue';
export default {
    data() {
        return {
            skillUrl: this.$route.params.skillUrl,
            skillId: null
        };
    },
    setup() {
        const skillsStore = useSkillsStore();
        return {
            skillsStore
        };
    },
    components: {
        EditSkill,
        SkillTimeTracker
    },
    async mounted() {
        // Need to work out which banner to show.
        // Call the API to get list of skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }
        // Find the correct skill path (first ancestor skill), and level in hierarchy
        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillUrl == this.skillsStore.skillsList[i].URL) {
                this.skillId = this.skillsStore.skillsList[i].id;
            }
        }
    },
    beforeRouteLeave(to, from, next) {
        this.$refs.skillTimeTracker.saveDuration();
        next();
    }
};
</script>

<template>
    <EditSkill />
    <!-- To track student time for this skill -->
    <SkillTimeTracker v-if="skillId" ref="skillTimeTracker" />
</template>

<style></style>
