<script>
import ProfileDetails from '../../components/profile-page/ProfileDetails.vue';
import Settings from '../../components/settings/Settings.vue';
import BulkQuestionsUpload from '../../components/settings/BulkQuestionsUpload.vue';
import AutoGenerateSources from '../../components/settings/AutoGenerateSources.vue';
import DeleteDownVotedSources from '../../components/settings/DeleteDownVotedSources.vue';

// Import the store.
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

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
    <div class="container">
        <!-- Profile Section -->
        <ProfileDetails />
        <!-- Platform Admin role only -->
        <!-- App Settings --->
        <Settings v-if="userDetailsStore.role == 'platform_admin'" />
        <!-- Bulk upload multiple choice questions --->
        <BulkQuestionsUpload v-if="userDetailsStore.role == 'platform_admin'" />
        <!-- Delete all sources with negative vote amount --->
        <DeleteDownVotedSources
            v-if="
                userDetailsStore.role == 'platform_admin' ||
                userDetailsStore.userName == 'Sgt. Dysxleia' ||
                userDetailsStore.userName == 'jonathandyason@gmail.com'
            "
        />
        <!-- Hidden from all users  --->
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
                    <li>
                        <em>To be done by devs and not platform admins.</em>
                    </li>
                    <li>
                        <em>
                            Note that this will check ALL unchecked
                            multiple-choice questions, and can be expensive.</em
                        >
                    </li>
                </ul>
            </div>
        </section>
        <!-- Autogenerate sources for all skills. At the moment, has to be done by programmer --->
        <AutoGenerateSources v-if="userDetailsStore.role == 'dev'" />
    </div>
</template>

<style scoped>
.hub-component {
    background-color: white;
    border-radius: 10px;
    padding: 10px;
}

.themes {
    width: 300px;
}

.theme-background {
    background-color: white;
    border-radius: 10px;
    padding: 10px;
}
</style>
