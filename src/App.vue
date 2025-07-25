<script>
// Import the stores.
import { useSessionDetailsStore } from './stores/SessionDetailsStore.js';
import { useUserDetailsStore } from './stores/UserDetailsStore.js';
import router from './router';
import AppTimeTracker from './components/components/teacher-analytics/AppTimeTracker.vue';

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
            isMobileCheck: window.innerWidth,
            currentTab: null,
            isDropdownOpen: false
        };
    },
    async mounted() {
        await this.userDetailsStore.getUserDetails();
        this.initDropdown();

        // Instructor theme
        if (
            this.userDetailsStore.theme == 'instructor' ||
            this.userDetailsStore.theme == 'partner'
        ) {
            document.body.classList.remove('editor-theme');
            document.body.classList.add('instructor-theme');
            // Editor theme.
        } else if (this.userDetailsStore.theme == 'editor') {
            document.body.classList.add('editor-theme');
            document.body.classList.remove('instructor-theme');
            // Original theme.
        } else {
            document.body.classList.remove('editor-theme');
            document.body.classList.remove('instructor-theme');
        }
        this.closeNavbarOnClick();
        window.addEventListener('beforeunload', this.handleBeforeUnload);
    },

    beforeUnmount() {
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
    },
    components: {
        AppTimeTracker
    },
    watch: {
        $route() {
            this.closeNavbarWithAnimation();
        }
    },
    methods: {
        initDropdown() {
            // Single click listener that handles both toggle and outside clicks
            document.addEventListener('click', (e) => {
                const dropdown = document.querySelector('.nav-item.dropdown');
                const dropdownToggle =
                    dropdown?.querySelector('.dropdown-toggle');

                if (!dropdown) return;

                // If clicking the toggle button, toggle the dropdown
                if (dropdownToggle && dropdownToggle.contains(e.target)) {
                    this.isDropdownOpen = !this.isDropdownOpen;
                }
                // If clicking outside the dropdown, close it
                else if (!dropdown.contains(e.target)) {
                    this.isDropdownOpen = false;
                }
            });
        },
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
        },
        LogOut() {
            document.getElementsByTagName('body')[0].style =
                'background-image: none;';

            this.sessionDetailsStore.isLoggedIn = false;

            // Reset both stores to their initial state
            this.userDetailsStore.$reset();
            this.sessionDetailsStore.$reset();

            // Reset theme classes
            document.body.classList.remove('editor-theme');
            document.body.classList.remove('instructor-theme');

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            };

            fetch('/logout', requestOptions).then(() => {
                router.push({ name: 'login' });
            });
        },
        handleBeforeUnload(event) {
            console.log('Tab is closing or refreshing');
            this.$refs.appTimeTracker.saveDuration();
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
                    $route.name == 'pathways' ||
                    $route.name == 'radial-tree' ||
                    $route.name == 'student-vertical-tree'
            }"
        >
            <div class="container-fluid justify-content-between">
                <div class="d-flex align-items-center">
                    <RouterLink to="/" class="nav-link logo">
                        <img
                            v-if="userDetailsStore.theme == 'editor'"
                            src="/images/logo-white.png"
                            alt=""
                            width="50"
                            height="50"
                            aria-label="Collins Institute logo"
                        />
                        <img
                            v-else
                            src="/images/logo-red.png"
                            alt=""
                            width="50"
                            height="50"
                            aria-label="Collins Institute logo"
                        />
                    </RouterLink>
                </div>

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
                    class="collapse navbar-collapse flex-grow-0"
                    id="navbarSupportedContent"
                >
                    <ul class="navbar-nav d-flex bg-white rounded pt-2 pb-2">
                        <li
                            v-if="
                                sessionDetailsStore.isLoggedIn &&
                                userDetailsStore.role == 'student'
                            "
                            class="nav-item"
                        >
                            <RouterLink
                                to="/search"
                                class="nav-link close-on-click"
                                >Search</RouterLink
                            >
                        </li>
                        <li
                            v-else-if="!sessionDetailsStore.isLoggedIn"
                            class="nav-item"
                        >
                            <RouterLink
                                to="/search"
                                class="nav-link close-on-click"
                                >Search</RouterLink
                            >
                        </li>
                        <li
                            v-if="
                                userDetailsStore.role == 'student' ||
                                userDetailsStore.role == 'instructor' ||
                                userDetailsStore.role == 'partner' ||
                                userDetailsStore.role == 'editor' ||
                                userDetailsStore.role == 'school_admin'
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
                                sessionDetailsStore.isLoggedIn &&
                                (userDetailsStore.role == 'platform_admin' ||
                                    userDetailsStore.role == 'editor')
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

                        <!-- <li
                            v-if="userDetailsStore.role == 'student'"
                            class="nav-item"
                        >
                            <RouterLink
                                to="/learning-tracks"
                                class="nav-link close-on-click"
                                >Learning Tracks</RouterLink
                            >
                        </li> -->
                        <li
                            v-if="!sessionDetailsStore.isLoggedIn"
                            class="nav-item"
                        >
                            <RouterLink
                                to="/skill-tree"
                                class="nav-link close-on-click"
                                >Skill Tree</RouterLink
                            >
                        </li>
                        <!-- Users / Editors -->
                        <li
                            v-if="
                                userDetailsStore.role == 'platform_admin' ||
                                userDetailsStore.role == 'editor'
                            "
                            class="nav-item"
                        >
                            <RouterLink
                                to="/users"
                                class="nav-link close-on-click"
                            >
                                <span
                                    v-if="
                                        userDetailsStore.role ==
                                        'platform_admin'
                                    "
                                    >Users
                                </span>
                                <span
                                    v-else-if="
                                        userDetailsStore.role == 'editor'
                                    "
                                    >Editors</span
                                >
                            </RouterLink>
                        </li>
                        <!-- Students -->
                        <li
                            v-if="
                                userDetailsStore.role == 'instructor' ||
                                userDetailsStore.role == 'partner'
                            "
                            class="nav-item dropdown"
                        >
                            <div class="d-flex align-items-center">
                                <!-- Navigation link to /students -->
                                <RouterLink
                                    to="/students"
                                    class="nav-link"
                                    @click="closeDropdown"
                                >
                                    <span>Students</span>
                                </RouterLink>

                                <!-- Dropdown toggle button -->
                                <button
                                    class="nav-link dropdown-toggle border-0 bg-transparent"
                                ></button>
                            </div>

                            <!-- Dropdown menu (conditionally shown) -->
                            <ul
                                class="dropdown-menu"
                                :class="{ show: isDropdownOpen }"
                            >
                                <li>
                                    <RouterLink
                                        to="/cohorts"
                                        class="dropdown-item close-on-click"
                                        @click="isDropdownOpen = false"
                                    >
                                        Cohorts
                                    </RouterLink>
                                </li>
                                <li>
                                    <RouterLink
                                        to="/student-questions"
                                        class="dropdown-item close-on-click"
                                        @click="isDropdownOpen = false"
                                    >
                                        Student Questions
                                    </RouterLink>
                                </li>
                                <li>
                                    <RouterLink
                                        to="/student-assessments"
                                        class="dropdown-item close-on-click"
                                        @click="isDropdownOpen = false"
                                    >
                                        Mark Assessments
                                    </RouterLink>
                                </li>
                            </ul>
                        </li>
                        <li
                            v-if="userDetailsStore.role == 'school_admin'"
                            class="nav-item dropdown"
                        >
                            <div class="d-flex align-items-center">
                                <RouterLink
                                    to="/tenant-students"
                                    class="nav-link"
                                >
                                    <span>Students</span>
                                </RouterLink>
                            </div>
                        </li>
                        <!-- Tenant Cohorts -->
                        <li
                            v-if="userDetailsStore.role == 'school_admin'"
                            class="nav-item"
                        >
                            <RouterLink
                                to="/classes"
                                class="nav-link close-on-click"
                            >
                                Classes
                            </RouterLink>
                        </li>
                        <!-- Tenants -->
                        <li
                            v-if="userDetailsStore.role == 'platform_admin'"
                            class="nav-item"
                        >
                            <RouterLink
                                to="/tenants/"
                                class="nav-link close-on-click"
                            >
                                Tenants
                            </RouterLink>
                        </li>
                        <!-- Skills -->
                        <li
                            v-if="
                                sessionDetailsStore.isLoggedIn &&
                                userDetailsStore.role != 'school_admin'
                            "
                            class="nav-item"
                        >
                            <RouterLink
                                to="/skills"
                                class="nav-link close-on-click"
                            >
                                <span>Skills</span>
                            </RouterLink>
                        </li>
                        <!-- School admin reports -->
                        <li
                            v-if="
                                sessionDetailsStore.isLoggedIn &&
                                userDetailsStore.role == 'school_admin'
                            "
                            class="nav-item"
                        >
                            <RouterLink
                                :to="
                                    '/school-report/' +
                                    userDetailsStore.tenantId
                                "
                                class="nav-link close-on-click"
                            >
                                <span>School</span>
                            </RouterLink>
                        </li>
                        <li
                            v-if="sessionDetailsStore.isLoggedIn"
                            class="nav-item"
                        >
                            <!-- Large screen menu -->
                            <div class="dropdown d-none d-sm-block">
                                <a
                                    href="#"
                                    class="nav-link dropdown-toggle"
                                    id="navbarDropdown"
                                    role="button"
                                    data-bs-toggle="dropdown"
                                    aria-expanded="false"
                                >
                                    <img
                                        id="user-avatar"
                                        :src="userDetailsStore.avatar"
                                        alt="user avatar"
                                    />
                                </a>

                                <div
                                    class="dropdown-menu dropdown-menu-end"
                                    aria-labelledby="navbarDropdown"
                                >
                                    <RouterLink
                                        to="/profile"
                                        class="dropdown-item"
                                    >
                                        Profile
                                    </RouterLink>
                                    <RouterLink
                                        to="/settings"
                                        class="dropdown-item"
                                    >
                                        Settings
                                    </RouterLink>
                                    <RouterLink
                                        to="/news-and-notifications"
                                        class="dropdown-item"
                                    >
                                        News & Notifications
                                    </RouterLink>
                                    <RouterLink
                                        v-if="
                                            userDetailsStore.role === 'student'
                                        "
                                        to="/goals"
                                        class="dropdown-item"
                                    >
                                        Goals
                                    </RouterLink>
                                    <RouterLink
                                        v-if="
                                            userDetailsStore.role ==
                                                'student' ||
                                            userDetailsStore.role ==
                                                'instructor' ||
                                            userDetailsStore.role == 'partner'
                                        "
                                        to="/reputation"
                                        class="dropdown-item"
                                    >
                                        Reputation
                                    </RouterLink>
                                    <RouterLink
                                        v-if="
                                            userDetailsStore.role == 'student'
                                        "
                                        to="/tokens"
                                        class="dropdown-item"
                                    >
                                        Tokens
                                    </RouterLink>
                                    <RouterLink
                                        v-if="
                                            userDetailsStore.role == 'partner'
                                        "
                                        to="/referrals"
                                        class="dropdown-item"
                                    >
                                        Referrals
                                    </RouterLink>
                                    <RouterLink
                                        v-if="
                                            userDetailsStore.role ==
                                            'platform_admin'
                                        "
                                        to="/partners"
                                        class="dropdown-item"
                                    >
                                        Partners
                                    </RouterLink>
                                    <div class="dropdown-divider"></div>
                                    <a
                                        v-if="sessionDetailsStore.isLoggedIn"
                                        @click="LogOut()"
                                        class="dropdown-item logout-btn"
                                    >
                                        Log out
                                    </a>
                                </div>
                            </div>
                            <!-- Mobile menu -->
                            <div class="d-sm-none">
                                <RouterLink to="/profile" class="nav-link">
                                    Profile
                                </RouterLink>
                                <RouterLink to="/settings" class="nav-link">
                                    Settings
                                </RouterLink>
                                <RouterLink
                                    to="/news-and-notifications"
                                    class="nav-link"
                                >
                                    News & Notifications
                                </RouterLink>
                                <RouterLink
                                    v-if="userDetailsStore.role === 'student'"
                                    to="/goals"
                                    class="nav-link"
                                >
                                    Goals
                                </RouterLink>
                                <RouterLink
                                    v-if="
                                        userDetailsStore.role == 'student' ||
                                        userDetailsStore.role == 'instructor' ||
                                        userDetailsStore.role == 'partner'
                                    "
                                    to="/reputation"
                                    class="nav-link"
                                >
                                    Reputation
                                </RouterLink>
                                <RouterLink
                                    v-if="userDetailsStore.role == 'student'"
                                    to="/tokens"
                                    class="nav-link"
                                >
                                    Tokens
                                </RouterLink>
                                <RouterLink
                                    v-if="userDetailsStore.role == 'partner'"
                                    to="/referrals"
                                    class="nav-link"
                                >
                                    Referrals
                                </RouterLink>
                                <RouterLink
                                    v-if="
                                        userDetailsStore.role ==
                                        'platform_admin'
                                    "
                                    to="/referrers"
                                    class="nav-link"
                                >
                                    Referrers
                                </RouterLink>
                                <a
                                    v-if="sessionDetailsStore.isLoggedIn"
                                    @click="LogOut()"
                                    class="nav-link logout-btn"
                                >
                                    Log out
                                </a>
                            </div>
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
    <div id="router-view" class="router-view-padding">
        <RouterView />
    </div>
    <!-- To track student time -->
    <AppTimeTracker ref="appTimeTracker" />
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

    --tertiary-color: #5f31dd;

    --skill-tree-background-color: white;
    --skill-tree-color: black;

    --stroke-width: 0px;

}

/* The Instructor theme */
.instructor-theme {
    --primary-color: #040095;
    --primary-contrast-color: white;

    --secondary-color: gold;
    --secondary-contrast-color: #040095;

    --tertiary-color: #040095;

    --skill-tree-background-color: white;
    --skill-tree-color: black;

    --stroke-width: 1px;
   /* --background-image: url('../images/backgrounds/themes/apprentice/apprentice-bg.jpg'); */
}

/* The Editor theme */
.editor-theme {
    --primary-color: black;
    --primary-contrast-color: white;

    --secondary-color: gold;
    --secondary-contrast-color: black;

    --tertiary-color: white

    --skill-tree-background-color: black;
    --skill-tree-color: white;

    --stroke-width: 1px;
    --background-image: url('../images/backgrounds/themes/scholar/scholar-bg.jpg');
    background-repeat: no-repeat;
    background-attachment: fixed;
}


.editor-theme .secondary-heading.white-heading {
  color: white !important;
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
.logout-btn{
    cursor: pointer;
    color: black;
}

.nav-link .active {
    color: darkorange !important;
}

.nav-link:hover,
.nav-link:focus {
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

.tertiary-heading {
    color: var(--tertiary-color) !important;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
}

/* Regular text */
p {
    /* color: black; */
    font-family: 'Poppins', sans-serif;
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
.router-link-active {
    text-decoration: underline;
    color: var(--primary-color);
}
.primary-btn.router-link-active {
    text-decoration: underline;
    color: var(--primary-contrast-color) !important;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    max-width: fit-content;
    /* display: flex; */
    align-items: center;
    max-height: 40px;
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
    padding: 0px !important;
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
    height: calc(100% - 88px);
}

.signin-btn {
    border: 1px solid var(--primary-color);
}
.btn:disabled {
    background-color: #b0b0b0 !important;
    border-color: #a0a0a0 !important;
    color: #4d4d4d !important;
    cursor: not-allowed !important;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.2) !important;
}


/* Tooltip Arrow (Base) */
.tooltip-arrow {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
}
.tool-tip-base {
    position: relative;
    top: 12px;
    z-index: 100;
}

.explain-tool-tip {
    position: relative;
    border: var(--primary-color) 1px solid;
    border-radius: 5px;
    background-color: white;
    padding: 5px 10px;
}

.triangle-top-left:before {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-bottom: 10px solid var(--primary-color);
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    left: 15px;
    top: -10px;
}

.triangle-top-left::after {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-bottom: 10px solid white;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    left: 15px;
    top: -9px;
}
/* Tooltip Arrow - Top Middle */
.triangle-top-middle::before {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-bottom: 10px solid var(--primary-color);
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    left: 50%;
    transform: translateX(-50%);
    top: -10px;
}

.triangle-top-middle::after {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-bottom: 10px solid white;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    left: 50%;
    transform: translateX(-50%);
    top: -9px;
}

/* Tooltip Arrow - Top Right */
.triangle-top-right::before {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-bottom: 10px solid var(--primary-color);
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    right: 15px;
    top: -10px;
}

.triangle-top-right::after {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-bottom: 10px solid white;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    right: 15px;
    top: -9px;
}

/* Tooltip Arrow - Bottom Left */
.triangle-bottom-left::before {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-top: 10px solid var(--primary-color);
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    left: 15px;
    bottom: -10px;
}

.triangle-bottom-left::after {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-top: 10px solid white;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    left: 15px;
    bottom: -9px;
}

/* Tooltip Arrow - Bottom Middle */
.triangle-bottom-middle::before {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-top: 10px solid var(--primary-color);
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    left: 50%;
    transform: translateX(-50%);
    bottom: -10px;
}

.triangle-bottom-middle::after {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-top: 10px solid white;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    left: 50%;
    transform: translateX(-50%);
    bottom: -9px;
}

/* Tooltip Arrow - Bottom Right */
.triangle-bottom-right::before {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-top: 10px solid var(--primary-color);
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    right: 15px;
    bottom: -10px;
}

.triangle-bottom-right::after {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-top: 10px solid white;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    right: 15px;
    bottom: -9px;
}
.navbar.fixed-top {
  background-color: transparent;
  box-shadow: none;
}

.navbar.fixed-top .container-fluid {
  max-width: 100%;
  padding-left: 15px;
  padding-right: 15px;
}

.navbar.fixed-top .navbar-collapse {
  background-color: white;
  border-radius: 8px;
  padding: 0 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

#navbarSupportedContent {
    overflow: visible;
}

/* Responsive pointer-events behavior - only for tablets and up */
@media (min-width: 768px) {
  /* Ensure the navbar doesn't block clicks when fixed-top on larger screens */
  .navbar.fixed-top {
    pointer-events: none;
  }

  /* But allow clicks on the actual navbar elements */
  .navbar.fixed-top .logo,
  .navbar.fixed-top .navbar-toggler,
  .navbar.fixed-top .navbar-collapse,
  .navbar.fixed-top .navbar-nav,
  .navbar.fixed-top a,
  .navbar.fixed-top button,
  .navbar.fixed-top .dropdown-menu,
  .navbar.fixed-top .container-fluid > div {
    pointer-events: auto;
  }
}

.dropdown-menu {
    --bs-dropdown-link-active-bg: var(--primary-color);
    --bs-dropdown-link-active-color: var(--primary-contrast-color);
}

/* Mobile-specific styles - make navbar fully interactive on small screens */
@media (max-width: 767.98px) {
  .navbar.fixed-top {
    background-color: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(5px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .navbar.fixed-top .navbar-collapse {
    max-height: 80vh;
    overflow-y: auto;
  }
}
</style>
