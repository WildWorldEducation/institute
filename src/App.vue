<script>
// Import the stores.
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
    async mounted() {
        await this.userDetailsStore.getUserDetails();
        if (this.userDetailsStore.theme == 'scholar') {
            document.body.classList.add('scholar-theme');
        } else {
            document.body.classList.remove('scholar-theme');
        }
    },
    methods: {}
};
</script>

<template>
    <header>
        <nav
            id="navbar"
            class="navbar fixed-top navbar-expand-lg navbar-light bg-light"
        >
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
                        <li
                            v-if="sessionDetailsStore.isLoggedIn"
                            class="nav-item"
                        >
                            <!-- ".native is used because Vue doesnt really allow for click handlers for routerlinks" -->
                            <RouterLink to="/" class="nav-link">Hub</RouterLink>
                        </li>
                        <li
                            v-if="
                                sessionDetailsStore.isLoggedIn &&
                                (userDetailsStore.role == 'admin' ||
                                    userDetailsStore.role == 'editor')
                            "
                            class="nav-item"
                        >
                            <RouterLink to="/todo" class="nav-link">
                                <span>Todo</span>
                            </RouterLink>
                        </li>
                        <li
                            v-if="sessionDetailsStore.isLoggedIn"
                            class="nav-item"
                        >
                            <RouterLink to="/skills" class="nav-link">
                                <span>Collapsible Tree</span>
                            </RouterLink>
                        </li>

                        <li
                            v-if="userDetailsStore.role == 'student'"
                            class="nav-item"
                        >
                            <RouterLink to="/vertical-tree" class="nav-link"
                                >Vertical Tree</RouterLink
                            >
                        </li>
                        <li
                            v-if="!sessionDetailsStore.isLoggedIn"
                            class="nav-item"
                        >
                            <RouterLink to="/vertical-tree" class="nav-link"
                                >You Can Not Interact With the Tree Until Logged
                                in</RouterLink
                            >
                        </li>
                        <li
                            v-if="userDetailsStore.role == 'student'"
                            class="nav-item"
                        >
                            <RouterLink to="/radial-tree" class="nav-link"
                                >Radial Tree (Alpha Version)</RouterLink
                            >
                        </li>
                        <li
                            v-if="
                                userDetailsStore.role == 'instructor' ||
                                userDetailsStore.role == 'admin' ||
                                userDetailsStore.role == 'editor'
                            "
                            class="nav-item"
                        >
                            <RouterLink to="/users" class="nav-link">
                                <span v-if="userDetailsStore.role == 'admin'"
                                    >Users
                                </span>
                                <span
                                    v-else-if="
                                        userDetailsStore.role == 'instructor'
                                    "
                                    >Students</span
                                >
                                <span
                                    v-else-if="
                                        userDetailsStore.role == 'editor'
                                    "
                                    >Editors</span
                                >
                            </RouterLink>
                        </li>
                        <li
                            v-if="userDetailsStore.role == 'instructor'"
                            class="nav-item"
                        >
                            <RouterLink to="/cohorts" class="nav-link">
                                <span>Cohorts</span>
                            </RouterLink>
                        </li>
                    </ul>
                    <ul class="navbar-nav d-flex">
                        <li
                            v-if="sessionDetailsStore.isLoggedIn"
                            class="nav-item me-2"
                        >
                            <RouterLink to="/profile-settings" class="nav-link">
                                <img
                                    id="user-avatar"
                                    :src="userDetailsStore.avatar"
                                    alt="user avatar"
                                />
                            </RouterLink>
                        </li>
                        <li class="nav-item me-2" v-else>
                            <RouterLink
                                to="/login"
                                class="btn purple-btn login-btn"
                            >
                                Log in
                            </RouterLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    </header>
    <div class="router-view-padding router-view">
        <RouterView />
    </div>
</template>

<style>
/*
Themes
*/

/* The Apprentice theme */
:root {
    --primary-colour: #8f7bd6;
}
/* The Scholar theme */
.scholar-theme {
    --primary-colour: black;
}

/* The following are changed by the themes, globally */
h1 {
    color: var(--primary-colour) !important;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

h2 {
    color: var(--primary-colour) !important;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

.icon {
    fill: var(--primary-colour) !important;
}

/* End of themes section */

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

.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.purple-btn:hover,
.purple-btn:active,
.purple-btn:focus {
    background-color: #7f56d9;
    border: 1px solid #7f56d9;
    color: white;
}

#user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
}
.router-view {
    height: 100vh;
}
.router-view-padding {
    padding-top: 72px;
}
.login-btn {
    max-width: 100px;
    justify-content: center;
}
@media (max-width: 991px) {
    .router-view-padding {
        padding-top: 66px;
    }
}
</style>
