<script>
import SkillEditComparison from '../components/edit-comparisons/SkillEditComparison.vue';
import MCQuestionEditComparison from '../components/edit-comparisons/MCQuestionEditComparison.vue';
import EssayQuestionEditComparison from '../components/edit-comparisons/EssayQuestionEditComparison.vue';

export default {
    setup() {},
    data() {
        return {
            type: null
        };
    },
    components: {
        SkillEditComparison,
        MCQuestionEditComparison,
        EssayQuestionEditComparison
    },
    async created() {
        console.log();
        this.type = this.$route.query.type;
    },
    methods: {}
};
</script>

<template>
    <div class="container">
        <SkillEditComparison v-if="type == 'skill'" />
        <MCQuestionEditComparison v-if="type == 'mcquestion'" />
        <EssayQuestionEditComparison v-if="type == 'essayquestion'" />
    </div>
</template>

<style>
.page-title {
    color: #a48be7;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
}
</style>
