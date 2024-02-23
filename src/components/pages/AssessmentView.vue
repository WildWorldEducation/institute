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
                console.log(this.skillsStore.skillsList[i]);
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
        <!-- BECAUSE WE DONT HAVE BANNER FOR SKILL YET SO I WILL PUT HERE A DEFAULT STATIC ONE -->
        <img
            src="/images/banners/institute-collins-2.png"
            alt="static banner"
            class="img-fluid"
        />
        <!-- Assign banner dynamically -->
        <img
            v-bind:src="
                '/images/banners/skills/' +
                this.skill.firstAncestorId +
                '/' +
                this.skill.levelInHierarchy +
                '.png'
            "
            class="img-fluid"
        />
    </div>
    <div class="container mt-3">
        <div class="d-flex">
            <!-- Display a default image if skill doesn`t have one -->
            <img
                v-if="!this.skill.image"
                src="/images/skill-avatar/recurso.png"
                alt="skill avatar"
            />
            <img :src="this.skill.image" />
            <h1 class="ms-3">{{ this.skill.name }} Quiz</h1>
        </div>
        <div class="horizontal-line">
            <br />
            <hr
                class="border border-2 opacity-100"
                style="border-color: #aea3ce"
            />
        </div>
        <Assessment />
    </div>
</template>

<style scoped></style>
