<script>
import ProfileDetails from '../components/profile-page/ProfileDetails.vue';
import ThemeDetails from '../components/profile-page/ThemeDetails.vue';
import ReputationDetails from '../components/profile-page/ReputationDetails.vue';
import Settings from '../components/settings/Settings.vue';
import BulkQuestionsUpload from '../components/settings/BulkQuestionsUpload.vue';
import AutoGenerateSources from '../components/settings/AutoGenerateSources.vue';
import DeleteDownVotedSources from '../components/settings/DeleteDownVotedSources.vue';
import ReputationEvents from '../components/hub-components/ReputationEvents.vue';
import Notifications from '../components/hub-components/Notifications.vue';
import News from '../components/hub-components/News.vue';

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
        ReputationDetails,
        Settings,
        BulkQuestionsUpload,
        AutoGenerateSources,
        DeleteDownVotedSources,
        ReputationEvents,
        News,
        Notifications
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
        <!-- Notifications -->
        <div class="row mt-2">
            <div class="col-lg-4 col-md-6 mb-2">
                <div class="hub-component h-100">
                    <Notifications />
                </div>
            </div>
        </div>
        <!-- News -->
        <div class="row">
            <div class="col">
                <div class="hub-component h-100">
                    <News />
                </div>
            </div>
        </div>
        <ThemeDetails />
        <div class="container pb-4 theme-background mt-2">
            <h2 class="secondary-heading h4">Reputation</h2>
            <ReputationDetails />
            <ReputationEvents
                v-if="
                    userDetailsStore.role == 'student' ||
                    userDetailsStore.role == 'instructor'
                "
            />
        </div>

        <!-- Admin role only -->
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
                    <li><em>To be done by devs and not admins.</em></li>
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
