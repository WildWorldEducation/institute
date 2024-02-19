<script>
import ProfileDetails from '../components/ProfileDetails.vue';
import Settings from '../components/Settings.vue';
import BulkQuestionsUpload from '../components/BulkQuestionsUpload.vue';
// Import the store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

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
        BulkQuestionsUpload
    }
};
</script>

<template>
    <div id="banner">
        <img src="/images/banners/general-banner.png" class="img-fluid" />
    </div>
    <ProfileDetails />
    <!--Only show if admin -->
    <Settings v-if="userDetailsStore.role == 'admin'" />
    <BulkQuestionsUpload v-if="userDetailsStore.role == 'admin'" />
</template>

<style></style>
