<script>
// Import the stores.
import { useCohortsStore } from '../../../stores/CohortsStore.js';
import FilterChild from './FilterChild.vue';

export default {
    setup() {
        const cohortsStore = useCohortsStore();

        return {
            cohortsStore
        };
    },

    data() {
        return {
            cohortId: this.$route.params.cohortId
        };
    },
    computed: {},
    async created() {
        await this.cohortsStore.getCohortSkillFilters(this.cohortId);        
    },
    methods: {},
    components: {
        FilterChild
    }
};
</script>

<template>
    <FilterChild
        v-for="skill in this.cohortsStore.cohortSkills"
        :id="skill.id"
        :children="skill.children"
        :depth="1"
        :name="skill.name"
        :type="skill.type"
        :filtered="skill.filtered"
    >
    </FilterChild>
</template>

<style scoped>
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid #a48be5;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

@media screen and (min-width: 992px) {
    /* Loading animation */
    .loading-animation {
        min-height: 100%;
        position: fixed;
        top: 50%;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }
}
</style>
