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
        <div class="d-flex justify-content-between">
            <div class="d-flex">
                <!-- Display a default skill icon if the current skill doesn`t have one -->
                <img v-if="this.skill.image" :src="this.skill.image" />
                <img
                    v-else
                    src="/images/skill-avatar/recurso.png"
                    alt="default skill icon"
                />
                <h1 class="ms-3 d-flex justify-content-end">
                    {{ this.skill.name }} Quiz
                </h1>
            </div>
            <button type="button" class="btn" style="height: 50px">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    style="height: 27px; opacity: 0.5"
                >
                    <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                    <path
                        fill="#8f7bd6"
                        d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"
                    />
                </svg>
            </button>
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
