<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import SkillTimeTracker from '../components/analytics/SkillTimeTracker.vue';
import EditEssayQuestion from '../components/EditEssayQuestion.vue';
export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            questionId: this.$route.params.questionId,
            skillId: null
        };
    },
    components: {
        EditEssayQuestion,
        SkillTimeTracker
    },
    async created() {
        // get skill id, for time tracker
        const res = await fetch(
            '/questions/essay/' + this.questionId + '/get-skill-id/'
        );
        const question = await res.json();
        this.skillId = question.skillId;
    },
    beforeRouteLeave(to, from, next) {
        this.$refs.skillTimeTracker.saveDuration();
        next();
    }
};
</script>

<template>
    <EditEssayQuestion />
    <!-- To track student time for this skill -->
    <SkillTimeTracker ref="skillTimeTracker" v-if="skillId" />
</template>

<style></style>
