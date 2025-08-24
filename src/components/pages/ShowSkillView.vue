<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import { useShowSkillStore } from '../../stores/ShowSkillStore.js';
import ShowSkill from '../components/ShowSkill.vue';
import SkillTimeTracker from '../components/analytics/SkillTimeTracker.vue';
export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const showSkillStore = useShowSkillStore();

        return {
            userDetailsStore,
            showSkillStore
        };
    },
    data() {
        return {};
    },
    components: {
        ShowSkill,
        SkillTimeTracker
    },
    beforeRouteLeave(to, from, next) {
        if (
            !this.userDetailsStore.userId ||
            this.showSkillStore.skill.type == 'domain'
        ) {
            next();
            return;
        }
        this.$refs.skillTimeTracker.saveDuration();
        next();
    }
};
</script>

<template>
    <div class="position-relative d-flex">
        <div class="container">
            <ShowSkill ref="childComponent" />
        </div>
    </div>
    <!-- To track student time for this skill -->
    <SkillTimeTracker v-if="showSkillStore.skill" ref="skillTimeTracker" />
</template>

<style scoped></style>
