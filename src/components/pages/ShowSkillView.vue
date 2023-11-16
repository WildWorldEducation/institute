<script>
import ShowSkill from '../components/ShowSkill.vue'
// Import the store.
import { useSkillsStore } from '../../stores/SkillsStore'

export default {
    setup() {
        const skillsStore = useSkillsStore();
        return {
            skillsStore
        }
    },
    data() {
        return {
            skillId: this.$route.params.id,
            firstAncestorId: null,
            levelInHierarchy: null
        }
    },
    async mounted() {
        // Need to work out which banner to show.
        // Call the API to get list of skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList()
        }
        // Find the correct skill path (first ancestor skill), and level in hierarchy
        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillId == this.skillsStore.skillsList[i].id) {
                this.firstAncestorId = this.skillsStore.skillsList[i].first_ancestor;
                this.levelInHierarchy = this.skillsStore.skillsList[i].hierarchy_level;
            }
        }
    },
    components: {
        ShowSkill
    }
}
</script>
 
<template>
    <div id="banner">
        <!-- Assign banner dynamically -->
        <img v-bind:src="'/images/banners/skills/' + this.firstAncestorId + '/' + this.levelInHierarchy +
            '.png'" class="img-fluid">
    </div>
    <ShowSkill />
</template>
    
<style></style>
  