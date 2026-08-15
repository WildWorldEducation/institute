<script>
// import components.
import LastVisitedSkills from '../components/search-components/LastVisitedSkills.vue';
import RecommendedSkillsGenerator from '../components/search-components/RecommendedSkillsGenerator.vue';
// Import store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore';
import { useSessionDetailsStore } from '../../stores/SessionDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const sessionDetailsStore = useSessionDetailsStore();
        // Run the GET request.
        userDetailsStore.getUserDetails();
        return {
            userDetailsStore,
            sessionDetailsStore
        };
    },
    data() {
        return {
            showWelcomeModal: false, // Modal to ask for tutorial preference
            isTutorialComplete: false,
            showTutorialTip1: false,
            showTutorialTip2: false,
            showTutorialTip3: false
        };
    },
    components: {
        LastVisitedSkills,
        RecommendedSkillsGenerator
    },
    computed: {
        name() {
            return (
                this.userDetailsStore.firstName +
                ' ' +
                this.userDetailsStore.lastName
            );
        }
    },
    async created() {
        // Meta description for browser tab, Google Search snippet and SEO
        // (Meta title added in router file already)
        document
            .querySelector('meta[name="description"]')
            .setAttribute(
                'content',
                'Search for a skill or profession you want to learn about.'
            );
        // Check tutorial complete
        if (window.innerWidth < 576 && this.sessionDetailsStore.isLoggedIn) {
            this.checkIfTutorialComplete();
        }
    },
    methods: {
        // Tutorial
        async checkIfTutorialComplete() {
            // Only check and show tutorial on mobile
            if (window.innerWidth < 576) {
                try {
                    const result = await fetch(
                        '/users/check-tutorial-progress/hub/' +
                            this.userDetailsStore.userId
                    );
                    const data = await result.json();

                    if (
                        data === 0 &&
                        this.userDetailsStore.role === 'student'
                    ) {
                        this.showWelcomeModal = true;
                    } else if (data === 1) {
                        this.isTutorialComplete = true;
                    }
                } catch (error) {
                    console.error('Error checking tutorial progress:', error);
                }
            } else {
                // On desktop, don't show the tutorial for SearchView
                this.isTutorialComplete = true;
            }
        },
        progressTutorial(step) {
            if (step == 1) {
                this.showTutorialTip1 = false;
                this.showTutorialTip2 = true;
            } else if (step == 2) {
                this.showTutorialTip2 = false;
                this.showTutorialTip3 = true;
            } else if (step == 3) {
                this.showTutorialTip3 = false;
                this.markTutorialComplete();
            }
        },
        markTutorialComplete() {
            let url =
                '/users/mark-tutorial-complete/hub/' +
                this.userDetailsStore.userId;
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            };
            fetch(url, requestOptions);
        },
        async startTutorial() {
            // Show the tutorial tooltips and mark tutorial as not complete
            this.showTutorialTip1 = true;
            this.isTutorialComplete = false;
            this.showWelcomeModal = false;
            // Reset tutorial fields for the user
            await this.resetTutorialProgress();
        },
        async resetTutorialProgress() {
            try {
                await fetch(
                    `/users/reset-all-tutorials/${this.userDetailsStore.userId}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );
            } catch (error) {
                console.error('Error resetting tutorials:', error);
            }
        },
        async closeTutorial() {
            // Close the welcome modal
            this.showWelcomeModal = false;
            // Mark all tutorials as complete
            await this.markAllTutorialsComplete();
        },
        restartTutorial() {
            this.startTutorial();
        },
        async markAllTutorialsComplete() {
            try {
                const response = await fetch(
                    `/users/mark-all-tutorials-complete/${this.userDetailsStore.userId}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
                if (response.ok) {
                    this.isTutorialComplete = true;
                } else {
                    console.error('Error marking tutorials as complete.');
                }
            } catch (error) {
                console.error('API request failed:', error);
            }
        },
        skipTutorial() {
            this.showTutorialTip1 = false;
            this.showTutorialTip2 = false;
            this.showTutorialTip3 = false;
            this.isTutorialComplete = true;
            this.markTutorialComplete();
        }
    }
};
</script>

<template>
    <div class="search-page">
    <!-- Tutorial button -->
    <div
        v-if="sessionDetailsStore.isLoggedIn"
        class="info-btn"
    >
        <button class="btn tutorial-btn" @click="restartTutorial" aria-label="restart tutorial"
            title="Restart the tutorial">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 192 512"
                width="16"
                height="16"
                class="primary-icon"
            >
                <!-- !Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                <path
                    d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"
                />
            </svg>
        </button>
    </div>

    <!-- Living emblem: ambient ping-pong loop, still image as poster -->
    <div class="text-center app-logo-wrapper obs-rise obs-rise-1">
        <video
            class="img-fluid app-logo"
            src="/images/emblem-loop.mp4"
            poster="/images/app-logo.jpg"
            autoplay
            muted
            loop
            playsinline
            aria-label="living constellation tree of knowledge"
        ></video>
    </div>

    <div class="container">
        <!-- Generate recommended skills bar -->
        <div class="row mb-4 obs-rise obs-rise-2">
            <div class="col">
                <RecommendedSkillsGenerator />
                <!-- Tooltip -->
                <div
                    v-if="
                        showTutorialTip2 && userDetailsStore.role == 'student'
                    "
                    class="tool-tip-base"
                    :style="{ maxWidth: '300px' }"
                >
                    <div class="explain-tool-tip triangle-top-left">
                        <div class="tool-tip-text">
                            <p>
                                Type a career or skill here to get
                                recommendations.
                            </p>
                            <div class="d-flex justify-content-between">
                                <button
                                    class="btn primary-btn"
                                    @click="progressTutorial(2)"
                                >
                                    next
                                </button>
                                <button
                                    class="btn red-btn"
                                    @click="skipTutorial"
                                >
                                    exit tutorial
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!--  Last Visited Skills -->
        <div v-if="sessionDetailsStore.isLoggedIn" class="row obs-rise obs-rise-3">
            <!--  Last Visited Skills / Mark Assessments -->
            <div class="col mb-2">
                <div class="h-100">
                    <!-- Tooltip -->
                    <div
                        v-if="
                            showTutorialTip3 &&
                            userDetailsStore.role == 'student'
                        "
                        class="tool-tip-base mb-3"
                    >
                        <div class="explain-tool-tip triangle-bottom-left">
                            <div class="tool-tip-text">
                                <p>
                                    This section shows your the last 5 skill
                                    pages you visited.
                                </p>
                                <button
                                    class="btn primary-btn"
                                    @click="progressTutorial(3)"
                                >
                                    close
                                </button>
                            </div>
                        </div>
                    </div>
                    <LastVisitedSkills
                        v-if="userDetailsStore.role == 'student'"
                        :userId="userDetailsStore.userId"
                    />
                </div>
            </div>
        </div>
    </div>

    <!-- Onboarding tooltip modals -->
    <div v-if="showWelcomeModal" class="modal">
        <div class="modal-content">
            <h1 class="heading h3">Welcome to the Collins Institute</h1>
            <p>Would you like to go through the tutorial?</p>
            <p>
                You can start or restart it anytime by clicking the "i" button
                on any page.
            </p>
            <div class="d-flex justify-content-between">
                <button class="btn red-btn mx-0" @click="closeTutorial">
                    No
                </button>
                <button class="btn primary-btn mx-0" @click="startTutorial">
                    Yes
                </button>
            </div>
        </div>
    </div>
    <!-- Student -->
    <div
        v-if="userDetailsStore.role == 'student' && showTutorialTip1"
        class="modal"
    >
        <div
            v-if="showTutorialTip1 && userDetailsStore.role == 'student'"
            class="modal-content"
        >
            <!-- Student -->
            <div>
                <p>This is the search page.</p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(1)"
                    >
                        next
                    </button>
                    <button class="btn red-btn" @click="skipTutorial">
                        exit tutorial
                    </button>
                </div>
            </div>
        </div>
    </div>
    </div>
</template>

<style scoped>
/* Observatory page backdrop */
.search-page {
    position: relative;
    min-height: 100vh;
    padding-top: 1rem;
    background: url('/images/star-tile.png') repeat,
        radial-gradient(
            ellipse 1100px 480px at 15% -5%,
            rgba(95, 49, 221, 0.2),
            transparent 62%
        ),
        radial-gradient(
            ellipse 800px 380px at 85% -8%,
            rgba(69, 216, 226, 0.1),
            transparent 60%
        ),
        linear-gradient(
        180deg,
        #0a0c26 0%,
        var(--obs-space) 55%,
        #1a1550 100%
    );
    color: var(--obs-ink);
}

/* Tutorial restart button — a deliberate circular icon button, top right. */
.info-btn {
    position: absolute;
    top: 1rem;
    right: 1.5rem;
    z-index: 10;
}

.tutorial-btn {
    width: 36px;
    height: 36px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: var(--obs-card);
    border: 1px solid var(--obs-line);
    transition: box-shadow 0.2s ease, border-color 0.2s ease;
}

.tutorial-btn svg path {
    fill: var(--obs-ink-dim);
}

.tutorial-btn:hover {
    border-color: var(--obs-gold);
    box-shadow: 0 0 12px rgba(255, 200, 87, 0.35);
}

.tutorial-btn:hover svg path {
    fill: var(--obs-gold);
}

/* Image — circular, melting into the space background. */
.app-logo-wrapper {
    position: relative;
    padding-top: 1.5rem;
}

.app-logo {
    max-height: 240px;
    border-radius: 50%;
    -webkit-mask-image: radial-gradient(
        circle,
        black 58%,
        transparent 71%
    );
    mask-image: radial-gradient(circle, black 58%, transparent 71%);
}

/* Soft nebula glow behind the emblem. */
.app-logo-wrapper::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 340px;
    height: 340px;
    transform: translate(-50%, -50%);
    background: radial-gradient(
        circle,
        rgba(95, 49, 221, 0.25) 0%,
        rgba(69, 216, 226, 0.06) 45%,
        transparent 70%
    );
    pointer-events: none;
}

/* Tooltips */
.info-panel {
    border-color: var(--obs-line-strong);
    border-width: 2px;
    border-style: solid;
    width: fit-content;
}

/* Tutorial tooltips: dark glass so they read on the space backdrop */
.explain-tool-tip {
    background-color: var(--obs-card-solid);
    color: var(--obs-ink);
    border: 1px solid var(--obs-line-strong);
    border-radius: 10px;
}

/* Modals */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 2000;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

/* Modal Content/Box — observatory dark glass */
.modal-content {
    background-color: var(--obs-card-solid);
    color: var(--obs-ink);
    margin: 5% auto;
    /* 5% from the top and centered */
    padding: 20px;
    border: 1px solid var(--obs-line-strong);
    border-radius: 14px;
    box-shadow: 0 0 40px rgba(95, 49, 221, 0.25);
    max-width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}

.modal-content .heading {
    color: var(--obs-gold);
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    /* Modal Content/Box */
    .modal-content {
        width: 90%;
        margin-top: 5%;
    }
}
</style>
