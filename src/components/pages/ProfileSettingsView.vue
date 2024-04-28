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
    <section
        class="container mt-1 px-3 px-lg-0 mb-5"
        v-if="userDetailsStore.role == 'admin'"
    >
        <hr />
        <h1>Content Flags</h1>
        <router-link class="btn green-btn mt-3" to="/content-flags"
            >Go to page</router-link
        >
    </section>
    <BulkQuestionsUpload v-if="userDetailsStore.role == 'admin'" />
    <AutoGenerateSources v-if="userDetailsStore.role == 'admin'" />
</template>

<style>
.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    line-height: 24px;
    display: flex;
    align-items: center;
    height: auto;
    width: fit-content;
}

.green-btn:hover {
    background-color: #3eb3a3;
    color: white;
}
</style>
