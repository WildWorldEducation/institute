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
    data() {
        return {
            isMobileCheck: window.innerWidth
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
        this.closeNavbarOnClick();
    },
    watch: {
        $route() {
            this.closeNavbarWithAnimation();
        }
    },
    methods: {
        closeNavbarOnClick() {
            const links = document.querySelectorAll('.close-on-click');
            const navbarToggler = document.querySelector('.navbar-toggler');
            const navbarCollapse = document.querySelector('.navbar-collapse');
            links.forEach((link) => {
                link.addEventListener('click', function () {
                    if (
                        navbarCollapse &&
                        navbarCollapse.classList.contains('show')
                    ) {
                        navbarToggler.click();
                    }
                });
            });
            document.addEventListener('click', (e) => {
                if (
                    navbarCollapse &&
                    !navbarCollapse.contains(e.target) &&
                    !navbarToggler.contains(e.target) &&
                    navbarCollapse.classList.contains('show')
                ) {
                    navbarToggler.click();
                }
            });
        },

        closeNavbarWithAnimation() {
            const navbarToggler = document.querySelector('.navbar-toggler');
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                navbarToggler.click();
                setTimeout(() => {
                    if (navbarCollapse.classList.contains('show')) {
                        navbarToggler.click();
                    }
                }, 300);
            }
        }
    }
};
</script>

<template>
    <header>
        <nav
            id="navbar"
            class="navbar navbar-expand-sm nav-bar"
            :class="{
                'fixed-top':
                    $route.name == 'skill-tree' ||
                    $route.name == 'my-skill-tree' ||
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
                    <ul class="navbar-nav d-flex bg-white rounded p-2">
                        <div
                            v-if="
                                !sessionDetailsStore.isLoggedIn &&
                                this.$route.name == 'skill-tree'
                            "
                            class="p-2 rounded me-2 mb-1"
                            style="background-color: #fff3cd; height: 37.6px"
                        >
                            You cannot master skills until signed in
                        </div>
                        <li
                            v-if="
                                sessionDetailsStore.isLoggedIn &&
                                this.$route.name != 'hub'
                            "
                            class="nav-item"
                        >
                            <RouterLink to="/" class="nav-link close-on-click"
                                >Hub</RouterLink
                            >
                        </li>
                        <li
                            v-if="
                                sessionDetailsStore.isLoggedIn &&
                                (userDetailsStore.role == 'admin' ||
                                    userDetailsStore.role == 'editor') &&
                                this.$route.name != 'todo-list'
                            "
                            class="nav-item"
                        >
                            <RouterLink
                                to="/todo"
                                class="nav-link close-on-click"
                            >
                                <span>Todo</span>
                            </RouterLink>
                        </li>
                        <li
                            v-if="
                                userDetailsStore.role == 'student' &&
                                this.$route.name != 'my-skill-tree'
                            "
                            class="nav-item"
                        >
                            <RouterLink
                                to="/my-skill-tree"
                                class="nav-link close-on-click"
                                >My Tree</RouterLink
                            >
                        </li>
                        <li
                            v-if="
                                userDetailsStore.role == 'student' &&
                                this.$route.name != 'skill-tree'
                            "
                            class="nav-item"
                        >
                            <RouterLink
                                to="/skill-tree"
                                class="nav-link close-on-click"
                                >Full Tree</RouterLink
                            >
                        </li>
                        <li
                            v-if="
                                sessionDetailsStore.isLoggedIn &&
                                this.$route.name != 'skills'
                            "
                            class="nav-item"
                        >
                            <RouterLink
                                to="/skills"
                                class="nav-link close-on-click"
                            >
                                <span>Collapsible Tree</span>
                            </RouterLink>
                        </li>

                        <li
                            v-if="
                                !sessionDetailsStore.isLoggedIn &&
                                this.$route.name != 'skill-tree'
                            "
                            class="nav-item"
                        >
                            <RouterLink
                                to="/skill-tree"
                                class="nav-link close-on-click"
                                >Skill Tree</RouterLink
                            >
                        </li>
                        <li
                            v-if="
                                userDetailsStore.role == 'student' &&
                                this.$route.name != 'radial-tree'
                            "
                            class="nav-item"
                        >
                            <RouterLink
                                to="/radial-tree"
                                class="nav-link close-on-click"
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
                            <RouterLink
                                to="/users"
                                class="nav-link close-on-click"
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
                            <RouterLink
                                to="/cohorts"
                                class="nav-link close-on-click"
                            >
                                <span>Cohorts</span>
                            </RouterLink>
                        </li>
                        <li
                            v-if="sessionDetailsStore.isLoggedIn"
                            class="nav-item"
                        >
                            <RouterLink
                                to="/profile-settings"
                                class="nav-link profile-btn close-on-click"
                            >
                                <img
                                    id="user-avatar"
                                    :src="userDetailsStore.avatar"
                                    alt="user avatar"
                                />
                            </RouterLink>
                        </li>
                        <li
                            class="nav-item"
                            v-if="!sessionDetailsStore.isLoggedIn"
                        >
                            <RouterLink
                                to="/login"
                                class="btn me-2 mb-1 signin-btn"
                            >
                                Sign in
                            </RouterLink>
                        </li>
                        <li
                            class="nav-item"
                            v-if="!sessionDetailsStore.isLoggedIn"
                        >
                            <RouterLink
                                to="/student-signup"
                                class="btn primary-btn"
                            >
                                Register
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
    --primary-color: #5f31dd;
    --primary-contrast-color: white;

    --secondary-color: #c6e76c;
    --secondary-contrast-color: black;

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

/* Background just for moving between the 2 skill trees */
.skill-tree-transition {
    --background-color: var(--skill-tree-background-color);
    --background-image: none;
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
    background-color: var(--background-color);
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
    align-items: center;
    max-width: fit-content;
    max-height: 40px;
    text-wrap: nowrap;
}

.primary-btn:hover,
.primary-btn:focus,
.primary-btn:active {
    border-color: var(--secondary-contrast-color) !important;
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

.tertiary-icon {
    fill: var(--primary-contrast-color) !important;
}

/* End of themes section */

.red-btn {
    background-color: #e24d4d;
    color: white;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    /* display: flex; */
    align-items: center;
}

.red-btn:hover {
    color: white;
    background-color: #e24d4d;
    border: 1px solid black;
}

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

.signin-btn {
    border: 1px solid var(--primary-color);
}
</style>
