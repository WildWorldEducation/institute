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

        // Kids theme
        if (this.userDetailsStore.theme == 'apprentice') {
            document.body.classList.remove('scholar-theme');
            document.body.classList.add('apprentice-theme');
        } else if (this.userDetailsStore.theme == 'scholar') {
            document.body.classList.add('scholar-theme');
            document.body.classList.remove('apprentice-theme');
            // Original theme.
        } else {
            document.body.classList.remove('scholar-theme');
            document.body.classList.remove('apprentice-theme');
        }

        console.log(this.userDetailsStore.theme);
        console.log(typeof this.userDetailsStore.theme);
    },
    methods: {}
};
</script>

<template>
    <header>
        <nav
            id="navbar"
            class="navbar navbar-expand-sm nav-bar"
            :class="{
                'fixed-top':
                    $route.name == 'vertical-tree' ||
                    $route.name == 'radial-tree' ||
                    $route.name == 'student-vertical-tree'
            }"
        >
            <div class="container-fluid">
                <RouterLink to="/" class="nav-link logo">
                    <img
                        v-if="userDetailsStore.theme == 'scholar'"
                        src="/images/logo-white.png"
                        alt=""
                        width="50"
                        height="50"
                    />
                    <img
                        v-else
                        src="/images/logo-red.png"
                        alt=""
                        width="50"
                        height="50"
                    />
                </RouterLink>
                <!-- <span class="navbar-brand">The Collins Institute</span> -->
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
                    <ul class="navbar-nav me-auto mb-2 mb-lg-0"></ul>
                    <ul class="navbar-nav d-flex bg-light rounded p-2">
                        <li
                            v-if="
                                sessionDetailsStore.isLoggedIn &&
                                this.$route.name != 'hub'
                            "
                            class="nav-item"
                        >
                            <RouterLink to="/" class="nav-link">Hub</RouterLink>
                        </li>
                        <li
                            v-if="
                                sessionDetailsStore.isLoggedIn &&
                                (userDetailsStore.role == 'admin' ||
                                    userDetailsStore.role == 'editor') &&
                                this.$route.name != 'todo'
                            "
                            class="nav-item"
                        >
                            <RouterLink to="/todo" class="nav-link">
                                <span>Todo</span>
                            </RouterLink>
                        </li>
                        <li
                            v-if="
                                sessionDetailsStore.isLoggedIn &&
                                this.$route.name != 'skills'
                            "
                            class="nav-item"
                        >
                            <RouterLink to="/skills" class="nav-link">
                                <span>Collapsible Tree</span>
                            </RouterLink>
                        </li>
                        <li
                            v-if="
                                userDetailsStore.role == 'student' &&
                                this.$route.name != 'vertical-tree'
                            "
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
                            v-if="
                                userDetailsStore.role == 'student' &&
                                this.$route.name != 'radial-tree'
                            "
                            class="nav-item"
                        >
                            <RouterLink to="/radial-tree" class="nav-link"
                                >Radial Tree (Alpha Version)</RouterLink
                            >
                        </li>
                        <li
                            v-if="
                                (userDetailsStore.role == 'instructor' ||
                                    userDetailsStore.role == 'admin' ||
                                    userDetailsStore.role == 'editor') &&
                                this.$route.name != 'users'
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
                            v-if="
                                userDetailsStore.role == 'instructor' &&
                                this.$route.name != 'cohorts'
                            "
                            class="nav-item"
                        >
                            <RouterLink to="/cohorts" class="nav-link">
                                <span>Cohorts</span>
                            </RouterLink>
                        </li>
                        <li
                            v-if="sessionDetailsStore.isLoggedIn"
                            class="nav-item"
                        >
                            <RouterLink
                                to="/profile-settings"
                                class="nav-link profile-btn"
                            >
                                <img
                                    id="user-avatar"
                                    :src="userDetailsStore.avatar"
                                    alt="user avatar"
                                />
                            </RouterLink>
                        </li>
                        <li class="nav-item" v-else>
                            <RouterLink to="/login" class="login-btn nav-link">
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
/* The Original theme */
:root {
    --primary-color: #8d6ce7;
    --primary-contrast-color: white;

    --secondary-color: #56c5b6;
    --secondary-contrast-color: white;

    --skill-tree-background-color: white;
    --skill-tree-color: black;

    --stroke-width: 0px;
}

/* The Apprentice theme */
.apprentice-theme {
    --primary-color: #040095;
    --primary-contrast-color: white;

    --secondary-color: gold;
    --secondary-contrast-color: #040095;

    --skill-tree-background-color: skyblue;
    --skill-tree-color: black;

    --stroke-width: 1px;
    --background-image: url('../images/backgrounds/themes/apprentice/apprentice-bg.jpg');
}

/* The Scholar theme */
.scholar-theme {
    --primary-color: black;
    --primary-contrast-color: white;

    --secondary-color: gold;
    --secondary-contrast-color: black;

    --skill-tree-background-color: black;
    --skill-tree-color: white;

    --stroke-width: 1px;
    --background-image: url('../images/backgrounds/themes/scholar/scholar-bg.jpg');
}

/* Navigation bar */
.nav-link {
    color: var(--primary-color);
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    display: flex;
    flex-direction: row;
    align-items: baseline;
}

.nav-link .active {
    color: darkorange !important;
}

.nav-link:hover {
    color: darkorange;
    text-decoration: underline;
}

/* Background image */
body {
    background-image: var(--background-image);
    background-size: cover;
}

/* Headings */
.heading {
    color: var(--primary-color) !important;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

.secondary-heading {
    color: var(--primary-color) !important;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
}

/* Regular text */
p {
    color: black !important;
}

/* Buttons */
.primary-btn {
    background-color: var(--primary-color) !important;
    color: var(--primary-contrast-color);
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    max-height: 40px;
    text-wrap: nowrap;
}

.primary-btn:hover,
.primary-btn:focus,
.primary-btn:active {
    border-color: var(--primary-contrast-color) !important;
    color: var(--primary-contrast-color);
}

.secondary-btn {
    background-color: var(--secondary-color) !important;
    color: var(--secondary-contrast-color);
    fill: var(--secondary-contrast-color);
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    max-height: 44px;
    text-wrap: nowrap;
    border-style: solid;
}

.secondary-btn:hover,
.secondary-btn:focus,
.secondary-btn:active {
    border-color: var(--secondary-contrast-color) !important;
    color: var(--secondary-contrast-color);
}

/* Icons */
.primary-icon {
    fill: var(--primary-color) !important;
}

.secondary-icon {
    fill: var(--secondary-color) !important;
}

/* End of themes section */

.navbar-toggler {
    background-color: white;
}

.logo {
    background-color: transparent;
}

.profile-btn {
    padding: 0px;
    background-color: transparent;
}

.navbar-brand {
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    margin-left: 20px;
    margin-right: 50px;
}

#user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
}
#user-avatar:hover {
    border: 2px solid var(--fourth-colour);
}
.router-view {
    height: 100vh;
}

.login-btn {
    max-width: 100px;
    justify-content: center;
}
</style>
