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
        <nav id="navbar" class="navbar navbar-expand-sm nav-bar">
            <div class="container-fluid">
                <RouterLink to="/" class="nav-link logo">
                    <img
                        v-if="
                            userDetailsStore.theme == 'apprentice' ||
                            userDetailsStore.theme == 'scholar'
                        "
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
                    <ul class="navbar-nav d-flex">
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
    --nav-colour: black;

    --primary-heading-colour: #8f7bd6;
    --secondary-heading-colour: #8f7bd6;

    --primary-icon-colour: #8f7bd6;
    --secondary-icon-colour: #8f7bd6;

    --primary-btn-colour: #8f7bd6;
    --primary-btn-colour-hover: #9a7ceb;
    --primary-btn-colour-border: #7f56d9;
    --secondary-btn-colour: #56c5b6;
    --secondary-btn-colour-border: #2fa894;

    --fourth-colour: gold;
    --tertiary-colour: white;
    --regular-text-colour: black;
    --hr-colour: #aea3ce;

    --fifth-colour: #888;
    --stroke-width: 0px;
}
/* The Apprentice theme */
.apprentice-theme {
    --nav-colour: white;

    --primary-heading-colour: white;
    --secondary-heading-colour: #8f7bd6;

    --primary-icon-colour: #8f7bd6;
    --secondary-icon-colour: #8f7bd6;

    --primary-btn-colour: #8f7bd6;
    --primary-btn-colour-hover: #9a7ceb;
    --primary-btn-colour-border: #7f56d9;
    --secondary-btn-colour: #56c5b6;
    --secondary-btn-colour-border: #2fa894;

    --fourth-colour: gold;
    --tertiary-colour: white;
    --regular-text-colour: #8f7bd6;
    --hr-colour: #aea3ce;
    --background-image: url('../images/backgrounds/themes/apprentice/apprentice-bg.jpg');

    --fifth-colour: white;
    --stroke-width: 1px;
}
/* The Scholar theme */
.scholar-theme {
    --nav-colour: white;

    --primary-heading-colour: white;
    --secondary-heading-colour: black;

    --primary-icon-colour: white;
    --secondary-icon-colour: black;

    --primary-btn-colour: black;
    --primary-btn-colour-hover: #303030;
    --primary-btn-colour-border: black;
    --secondary-btn-colour: black;
    --secondary-btn-colour-hover-border: darkorange;

    --tertiary-colour: #87ceeb;
    --regular-text-colour: black;
    --hr-colour: black;
    --fourth-colour: #bf202f;
    --background-image: url('../images/backgrounds/themes/scholar/scholar-bg.jpg');

    --fifth-colour: white;
    --stroke-width: 1px;
}

body {
    background-image: var(--background-image);
    background-size: cover;
}

/* The following are changed by the themes, globally */
/* .nav-bar {
    background-color: var(--tertiary-colour);
} */

h1 {
    color: var(--primary-heading-colour) !important;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

.h1-stroke {
    -webkit-text-stroke-color: var(--secondary-heading-colour);
    -webkit-text-stroke-width: var(--stroke-width);
}

h2 {
    color: var(--primary-heading-colour) !important;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

.h2-stroke {
    -webkit-text-stroke-color: var(--secondary-heading-colour);
    -webkit-text-stroke-width: var(--stroke-width);
}

.icon {
    fill: var(--secondary-icon-colour) !important;
}

.primary-btn {
    background-color: var(--primary-btn-colour) !important;
    border: 1px solid var(--primary-btn-colour-border) !important;
    color: white;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    max-height: 44px;
    text-wrap: nowrap;
}

.primary-btn:hover {
    background-color: var(--primary-btn-colour-hover) !important;
    color: white;
}

.primary-btn:focus,
.primary-btn:active {
    background-color: var(--primary-btn-colour) !important;
    color: white;
}

.secondary-btn {
    background-color: var(--secondary-btn-colour) !important;
    color: white;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    max-height: 44px;
    text-wrap: nowrap;
}

.secondary-btn:hover {
    border-color: var(--secondary-btn-colour-hover-border) !important;
    color: white;
}

.nav-link {
    color: var(--nav-colour);
    font-weight: 700;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    display: flex;
    flex-direction: row;
    align-items: baseline;
}

.nav-link .active {
    color: var(--primary-heading-colour) !important;
}

.nav-link:hover {
    color: var(--fourth-colour);
    text-decoration: underline;
}

.table-header {
    background-color: var(--h2-colour) !important;
    border-color: var(--secondary-btn-colour-border) !important;
    color: white !important;
}

/* End of themes section */

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
