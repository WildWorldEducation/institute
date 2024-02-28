<script>
import Assessment from '../components/Assessment.vue';
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
                levelInHierarchy: null
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
                this.skill.image = this.skillsStore.skillsList[i].image;
                this.skill.firstAncestorId =
                    this.skillsStore.skillsList[i].first_ancestor;
                this.skill.levelInHierarchy =
                    this.skillsStore.skillsList[i].hierarchy_level;
            }
        }
    },
    components: {
        Assessment
    }
};
</script>

<template>
    <div id="banner">
        <!-- We will use a default banner for now -->
        <img
            v-bind:src="'/images/banners/skills-banner.png'"
            class="img-fluid"
        />
        <!-- Assign banner dynamically -->
        <!-- <img
            v-bind:src="
                '/images/banners/skills/' +
                this.skill.firstAncestorId +
                '/' +
                this.skill.levelInHierarchy +
                '.png'
            "
            class="img-fluid"
        /> -->
    </div>
    <div class="container mt-3">
        <div class="d-flex">
            <!-- Display a default skill icon if the current skill doesn`t have one -->
            <img v-if="this.skill.image" :src="this.skill.image" />
            <img
                v-else
                src="/images/skill-avatar/recurso.png"
                alt="default skill icon"
            />
            <h1 class="ms-3">{{ this.skill.name }} Quiz</h1>
        </div>
        <div class="mt-4 mb-4">
            <hr
                class="border border-2 opacity-100 w-75"
                id="assessment-horizontal-line"
            />
        </div>
        <Assessment />
    </div>
</template>

<style scoped>
#assessment-horizontal-line {
    border-color: #aea3ce !important;
    border: solid;
}
</style>
