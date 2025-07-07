<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import SkillTimeTracker from '../components/student-analytics/SkillTimeTracker.vue';
import EditMCQuestion from '../components/EditMCQuestion.vue';
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
        EditMCQuestion,
        SkillTimeTracker
    },
    async created() {
        const res = await fetch(
            '/questions/mc/' + this.questionId + '/get-skill-id/'
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
    <EditMCQuestion />
    <!-- To track student time for this skill -->
    <SkillTimeTracker ref="skillTimeTracker" v-if="skillId" />
</template>

<style></style>
