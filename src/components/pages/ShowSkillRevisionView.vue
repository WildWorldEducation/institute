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
            skillId: this.$route.params.skillId
        };
    },
    async mounted() {
        // Call the API to get list of skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
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
