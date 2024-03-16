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
            userDetailsStore
        };
    },
    methods: {
        // To stop the Pixi app when it is in the background,
        // to save client browser resources
        // for better experience.
        stopPixiApp() {
            this.$pixiApp.stop();
        }
    }
};
</script>

<template>
    <header v-if="sessionDetailsStore.isLoggedIn">
        <nav id="navbar" class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="container-fluid">
                <RouterLink to="/" class="nav-link">
                    <img
                        src="/images/logo-red.png"
                        alt=""
                        width="50"
                        height="50"
                    />
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
                <div
                    class="collapse navbar-collapse"
                    id="navbarSupportedContent"
                >
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <!-- ".native is used because Vue doesnt really allow for click handlers for routerlinks" -->
                            <RouterLink
                                @click.native="stopPixiApp()"
                                to="/"
                                class="nav-link"
                                >Hub</RouterLink
                            >
                        </li>
                        <li
                            v-if="userDetailsStore.role == 'student'"
                            class="nav-item"
                        >
                            <RouterLink to="/tidy-tree" class="nav-link"
                                >Tidy Tree</RouterLink
                            >
                        </li>
                        <li
                            v-if="userDetailsStore.role == 'student'"
                            class="nav-item"
                        >
                            <RouterLink to="/canvas-tidy-tree" class="nav-link"
                                >Canvas Tidy Tree</RouterLink
                            >
                        </li>
                        <li
                            v-if="userDetailsStore.role == 'student'"
                            class="nav-item"
                        >
                            <RouterLink to="/radial-tree" class="nav-link"
                                >Radial Tree</RouterLink
                            >
                        </li>
                        <li class="nav-item">
                            <RouterLink
                                @click.native="stopPixiApp()"
                                to="/skills"
                                class="nav-link"
                            >
                                <span> Skills </span>
                            </RouterLink>
                        </li>
                        <li
                            v-if="userDetailsStore.role != 'student'"
                            class="nav-item"
                        >
                            <RouterLink
                                @click.native="stopPixiApp()"
                                to="/users"
                                class="nav-link"
                            >
                                <span v-if="userDetailsStore.role == 'admin'"
                                    >Users
                                </span>
                                <span
                                    v-else-if="
                                        userDetailsStore.role == 'instructor'
                                    "
                                    >Students</span
                                >
                            </RouterLink>
                        </li>
                    </ul>
                    <ul class="navbar-nav d-flex">
                        <li class="nav-item me-2">
                            <RouterLink
                                @click.native="stopPixiApp()"
                                to="/profile-settings"
                                class="nav-link"
                            >
                                <img
                                    id="user-avatar"
                                    :src="userDetailsStore.avatar"
                                    alt="user avatar"
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
    display: flex;
    flex-direction: row;
    align-items: baseline;
}

.nav-link > img {
    margin-left: 5px;
}

#user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 40px;
}
</style>
