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
    <!-- <div id="banner">
        <img
            v-bind:src="'/images/banners/skills-banner.png'"
            class="img-fluid"
        />
    </div> -->
    <div class="container mt-3">
        <div class="d-flex justify-content-md-between justify-content-center">
            <div class="d-flex flex-column flex-md-row">
                <h1
                    class="ms-3 d-flex justify-content-md-end text-center justify-content-center"
                >
                    {{ this.skill.name }} Quiz
                </h1>
            </div>
        </div>

        <div class="mt-4 mb-2">
            <hr
                class="border border-2 opacity-100 w-md-75 w-100"
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

.img-fluid {
    width: 100% !important;
    height: auto;
}
#skill-icon {
    width: 200px;
    border-radius: 10px;
}

/*Style for Mobile Devices */
@media (max-width: 480px) {
    #skill-icon {
        width: 60%;
        height: auto;
        margin: 0% auto;
    }
}
</style>
