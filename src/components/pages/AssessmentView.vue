<script>
import { useSkillsStore } from '../../stores/SkillsStore';
import { useShowSkillStore } from '../../stores/ShowSkillStore.js';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import Assessment from '../components/assessments/Assessment.vue';
import SkillTimeTracker from '../components/analytics/SkillTimeTracker.vue';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const showSkillStore = useShowSkillStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            skillsStore,
            showSkillStore,
            userDetailsStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.skillId,
            skill: {
                name: null,
                image: null,
                firstAncestorId: null,
                levelInHierarchy: null,
                url: '',
                type: null
            }
        };
    },
    components: {
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
            if (this.skillId == this.skillsStore.skillsList[i].id) {
                this.skill.name = this.skillsStore.skillsList[i].name;
                this.skill.url = this.skillsStore.skillsList[i].url;
                this.skill.type = this.skillsStore.skillsList[i].type;
            }
        }
    },
    components: {
        Assessment,
        SkillTimeTracker
    },
    beforeRouteLeave(to, from, next) {
        if (!this.userDetailsStore.userId) {
            if (this.skill.type == 'domain') {
                next();
                return;
            }
        }
        this.$refs.skillTimeTracker.saveDuration();
        next();
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
                <div
                    :style="`width: ${parseInt(
                        (($refs.assessment?.questionNumber + 1) /
                            $refs.assessment?.totalNumOfQuestions) *
                            100
                    )}%;`"
                    id="progress"
                ></div>
            </div>
        </div>
        <Assessment ref="assessment" />
    </div>
    <!-- To track student time for this skill -->
    <SkillTimeTracker ref="skillTimeTracker" v-if="skill.type" />
</template>

<style scoped>
#assessment-horizontal-line {
    position: relative;
    height: 5px;
}
#progress {
    height: 100%;
    background-color: var(--primary-color) !important;
    position: absolute;
    left: 0px;
    top: 50%;
    transform: translateY(-50%);
}
#full-line {
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
