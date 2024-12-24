<script>
import Assessment from '../components/assessments/Assessment.vue';
// Import the store.
import { useSkillsStore } from '../../stores/SkillsStore';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        return {
            skillsStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.id,
            skill: {
                name: null,
                image: null,
                firstAncestorId: null,
                levelInHierarchy: null,
                url: ''
            }
        };
    },
    async mounted() {
        // Need to work out which banner to show.
        // Call the API to get list of skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }

        // Find the correct skill path (first ancestor skill), and level in hierarchy
        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillId == this.skillsStore.skillsList[i].id) {
                this.skill.name = this.skillsStore.skillsList[i].name;
                this.skill.url = this.skillsStore.skillsList[i].url;
            }
        }
    },
    components: {
        Assessment
    },
    methods: {
        imageUrlAlternative(event) {
            event.target.src = '/images/skill-avatar/recurso.png';
        }
    }
};
</script>

<template>
    <div class="container bg-light rounded p-3">
        <h1 class="heading">Assessment</h1>
        <p class="skill-name">
            <em>{{ this.skill.name }}</em>
        </p>
        <div class="mt-4 mb-2">
            <div id="assessment-horizontal-line" class="w-md-75 w-100">
                <div id="full-line"></div>
                <div :style="`width: ${parseInt(($refs.assessment?.questionNumber+1)/$refs.assessment?.totalNumOfQuestions*100)}%;`" id="progress"></div>
            </div>
            
        </div>
        <Assessment ref="assessment" />
    </div>
</template>

<style scoped>
#assessment-horizontal-line {
    position: relative;
    height: 5px;
}
#progress{
    height: 100%;
    background-color: var(--primary-color) !important;
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-50%);
}
#full-line{
    width: 100%;
    height: 100%;
    background-color: var(--primary-color) !important;
    opacity: 0.2;
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-50%);
}
.skill-name {
    color: var(--primary-color) !important;
}
</style>
