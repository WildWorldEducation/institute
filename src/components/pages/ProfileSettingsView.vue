<script>
import ProfileDetails from '../components/profile-page/ProfileDetails.vue';
import ThemeDetails from '../components/profile-page/ThemeDetails.vue';
import Settings from '../components/settings/Settings.vue';
import BulkQuestionsUpload from '../components/settings/BulkQuestionsUpload.vue';
import AutoGenerateSources from '../components/settings/AutoGenerateSources.vue';
import DeleteDownVotedSources from '../components/settings/DeleteDownVotedSources.vue';
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
        ThemeDetails,
        Settings,
        BulkQuestionsUpload,
        AutoGenerateSources,
        DeleteDownVotedSources
    },
    methods: {
        CheckMCQuestions() {
            fetch('/questions/check-questions');
        }
    }
};
</script>

<template>
    <!-- Profile Section -->
    <ProfileDetails />
    <ThemeDetails />
    <!-- 
    Admin role only 
    -->
    <!-- App Settings --->
    <Settings v-if="userDetailsStore.role == 'admin'" />
    <!-- Bulk upload multiple choice questions --->
    <BulkQuestionsUpload v-if="userDetailsStore.role == 'admin'" />
    <!-- Delete all sources with negative vote amount --->
    <DeleteDownVotedSources
        v-if="
            userDetailsStore.role == 'admin' ||
            userDetailsStore.userName == 'Sgt. Dysxleia' ||
            userDetailsStore.userName == 'jonathandyason@gmail.com'
        "
    />
    <!-- 
    Hidden from all users 
    --->
    <!-- AI Check MC Questions for errors--->
    <section
        class="container mt-1 px-3 px-lg-0 mb-5"
        v-if="userDetailsStore.role == 'dev'"
    >
        <hr />
        <h2>Check MC Questions</h2>
        <button class="btn green-btn mt-3" @click="CheckMCQuestions()">
            Check now
        </button>
        <div style="font-size: 14px" class="mt-2">
            <ul>
                <li><em>To be done by devs and not admins.</em></li>
                <li>
                    <em>
                        Note that this will check ALL unchecked multiple-choice
                        questions, and can be expensive.</em
                    >
                </li>
            </ul>
        </div>
    </section>
    <!-- Autogenerate sources for all skills. At the moment, has to be done by programmer --->
    <AutoGenerateSources v-if="userDetailsStore.role == 'dev'" />
</template>

<style></style>
