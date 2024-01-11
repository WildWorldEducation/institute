<script>
import { RouterLink, RouterView } from 'vue-router';

// Import the store.
import { useSessionDetailsStore } from './stores/SessionDetailsStore.js';
import { useUserDetailsStore } from './stores/UserDetailsStore.js';

export default {
  setup() {
    const sessionDetailsStore = useSessionDetailsStore();
    const userDetailsStore = useUserDetailsStore();

    return {
      sessionDetailsStore,
      userDetailsStore,
    };
  },
};
</script>

<template>
  <header v-if="sessionDetailsStore.isLoggedIn">
    <nav id="navbar" class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <RouterLink to="/" class="nav-link">
          <img src="/images/logo-red.png" alt="" width="50" height="50" />
        </RouterLink>
        <span class="navbar-brand">The Collins Institute</span>
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li v-if="userDetailsStore.role == 'student'" class="nav-item">
              <RouterLink to="/skill-tree" class="nav-link"
                >Skill Tree</RouterLink
              >
            </li>
            <li class="nav-item">
              <RouterLink to="/skills" class="nav-link">Skills</RouterLink>
            </li>
            <li v-if="userDetailsStore.role != 'student'" class="nav-item">
              <RouterLink to="/users" class="nav-link">
                <span v-if="userDetailsStore.role == 'admin'">Users</span>
                <span v-else-if="userDetailsStore.role == 'instructor'"
                  >Students</span
                >
              </RouterLink>
            </li>
          </ul>
          <ul class="navbar-nav d-flex">
            <li class="nav-item me-2">
              <RouterLink to="/profile-settings" class="nav-link">
                <img
                  id="profile-image"
                  v-bind:src="userDetailsStore.avatar"
                  alt="profile image"
                />
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  <RouterView />
</template>

<style scoped>
.navbar-brand {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  margin-left: 20px;
  margin-right: 50px;
}

.nav-link {
  color: #a48be5;
  font-weight: 700;
  font-size: 16px;
}

#profile-image {
  border-radius: 50%;
  width: 40px;
  height: 40px;
}
</style>
