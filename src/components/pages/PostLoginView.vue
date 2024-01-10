<script>
// import components.
import StudentMessages from '../components/StudentMessages.vue';
import StudentProgress from '../components/StudentProgress.vue';
import Notifications from '../components/Notifications.vue';
import News from '../components/News.vue';
// Import store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
  setup() {
    const userDetailsStore = useUserDetailsStore();
    // Run the GET request.
    userDetailsStore.getUserDetails();
    return {
      userDetailsStore,
    };
  },
  data() {
    return {};
  },
  components: {
    News,
    Notifications,
    StudentMessages,
    StudentProgress,
  },
  computed: {
    name() {
      return (
        this.userDetailsStore.firstName + ' ' + this.userDetailsStore.lastName
      );
    },
  },
  methods: {},
};
</script>

<template>
  <div id="banner">
    <img src="/images/banners/general-banner.png" class="" />
  </div>
  <div id="purple-banner"></div>
  <div class="container post-login-container">
    <div class="row text-center text-md-start">
      <h1 id="user-name">{{ name }}</h1>
    </div>
    <div class="row content-row">
      <div class="column col-md-4 align-md-self-start">
        <!-- Avatar image -->
        <img :src="userDetailsStore.avatar" class="img-fluid px-md-0 px-5" />
      </div>
      <div class="column col-lg-4 col-md-6">
        <StudentProgress
          v-if="userDetailsStore.role == 'student'"
          :userId="userDetailsStore.userId"
        />
        <RouterLink
          v-else-if="userDetailsStore.role == 'instructor'"
          to="/assessments"
          >Mark assessments
        </RouterLink>
      </div>
      <div id="message-col" class="column col-lg-4 col-md-6">
        <StudentMessages />
      </div>
    </div>
    <div class="row content-row">
      <div class="column col-lg-3 col-md-6">
        <Notifications />
      </div>
      <div class="column col-lg-9 col-md-6">
        <img src="/images/post-login.png" class="img-fluid" />
      </div>
    </div>
    <div class="row">
      <News />
    </div>
  </div>
</template>

<style>
/**Some how the image-fluid bootstrap does not work 
*  So we have to implement it
*/
.img-fluid {
  width: 100%;
  height: auto;
}

.content-row {
  padding-bottom: 51px;
}

#banner {
  width: 100%;
}

#banner > img {
  width: 100%;
  height: auto;
}

#purple-banner {
  height: 77px;
  background-color: #a48be640;
}

.post-login-container {
  padding-top: 68px;
}

h1 {
  color: #8f7bd6;
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
}

#user-name {
  font-size: 2.375;
}

#message-col {
  padding-top: 8px;
}
</style>
