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
            bannerImage: null
        }
    },
    async mounted() {
        // Need to work out which banner to show.
        // Call the API to get list of skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList()
        }

        // Find the correct skill path (first ancestor skill), and level, to choose the banner img file.
        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillId == this.skillsStore.skillsList[i].id) {
                this.bannerImage = this.skillsStore.skillsList[i].banner_image
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
        <img v-bind:src="bannerImage" class="img-fluid">
    </div>
    <ShowSkill />
</template>
    
<style>
#banner img {
    max-height: 200px
}
</style>
  