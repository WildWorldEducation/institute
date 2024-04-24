<script>
import ProfileDetails from '../components/ProfileDetails.vue';
import Settings from '../components/Settings.vue';
import BulkQuestionsUpload from '../components/BulkQuestionsUpload.vue';
import AutoGenerateSources from '../components/AutoGenerateSources.vue';
// Import the store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore';
import { RouterLink } from 'vue-router';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {};
    },
    components: {
        ProfileDetails,
        Settings,
        BulkQuestionsUpload,
        AutoGenerateSources
    }
};
</script>

<template>
    <div id="banner">
        <img src="/images/banners/general-banner.png" class="w-100 h-auto" />
    </div>
    <ProfileDetails />
    <!--Only show if admin -->
    <Settings v-if="userDetailsStore.role == 'admin'" />
    <BulkQuestionsUpload v-if="userDetailsStore.role == 'admin'" />
    <AutoGenerateSources v-if="userDetailsStore.role == 'admin'" />
    <section>
        <router-link to="/content-errors">Content Errors</router-link>
    </section>
</template>

<style></style>
