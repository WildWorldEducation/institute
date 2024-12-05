<script>
import ShowSkillRevision from '../components/show-skill-revision/ShowSkillRevision.vue';
// Import the store.
import { useSkillsStore } from '../../stores/SkillsStore';
import { useUsersStore } from '../../stores/UsersStore';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const userDetailsStore = useUsersStore();
        return {
            skillsStore,
            userDetailsStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.skillId,
            bannerImage: null
        };
    },
    async mounted() {
        // Call the API to get list of skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }

        // Find the correct skill path (first ancestor skill), and level, to choose the banner img file.
        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillId == this.skillsStore.skillsList[i].id) {
                this.bannerImage = this.skillsStore.skillsList[i].banner_image;
            }
        }
    },
    components: {
        ShowSkillRevision
    }
};
</script>

<template>
    <div class="position-relative d-flex">
        <div class="container-lg container-fluid show-skill-ctnr">
            <ShowSkillRevision />
        </div>
    </div>
</template>

<style scoped></style>
