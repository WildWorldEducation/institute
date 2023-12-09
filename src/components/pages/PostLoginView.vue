<script>
// import components.
import StudentMessages from '../components/StudentMessages.vue';
import StudentProgress from '../components/StudentProgress.vue';
import Notifications from '../components/Notifications.vue';
import News from '../components/News.vue';
// Import store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore'

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        // Run the GET request.
        userDetailsStore.getUserDetails()
        return {
            userDetailsStore
        }
    },
    data() {
        return {
        }
    },
    components: {
        News, Notifications, StudentMessages, StudentProgress
    },
    computed: {
        name() {
            return this.userDetailsStore.firstName + " " + this.userDetailsStore.lastName;
        }
    },
    methods: {
    }
}
</script>

<template>
    <div id="banner">
        <img src="/images/banners/general-banner.png" class="img-fluid">
    </div>
    <div id="purple-banner">
    </div>
    <div class="container">
        <div class="row">
            <div class="column col-md-4">
                <h1>{{ name }}</h1>
                <!-- Avatar image -->
                <img :src="userDetailsStore.avatar" class="img-fluid" />
            </div>
            <div class="column col-md-4">
                <StudentProgress v-if="userDetailsStore.role == 'student'" :userId="userDetailsStore.userId" />
                <RouterLink v-else-if="userDetailsStore.role == 'instructor'" to="/assessments">Mark assessments
                </RouterLink>
            </div>
            <div class="column col-md-4">
                <StudentMessages />
            </div>
        </div>
        <div class="row">
            <div class="column col-md-3">
                <Notifications />
            </div>
            <div class="column col-md-9">
                <img src="/images/post-login.png" class="img-fluid">
            </div>
        </div>
        <div class="row">
            <News />
        </div>
    </div>
</template> 
 
<style>
#purple-banner {
    height: 77px;
    background-color: #A48BE640;
}

h1 {
    color: #8F7BD6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}
</style>
