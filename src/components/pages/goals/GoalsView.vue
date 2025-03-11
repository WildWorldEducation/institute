<script lang="ts">
import Goals from '../../components/Goals.vue';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSessionDetailsStore } from '../../../stores/SessionDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const sessionDetailsStore = useSessionDetailsStore();

        return {
            userDetailsStore,
            sessionDetailsStore
        };
    },
    data() {
        return {
            showTutorialTip1: false, // Control whether to show the tooltip
            isTutorialComplete: false
        };
    },
    components: {
        Goals
    },
    async created() {
        if (this.sessionDetailsStore.isLoggedIn) {
            await this.checkIfTutorialComplete();
        }
    },
    methods: {
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
        async checkIfTutorialComplete() {
            try {
                const result = await fetch(
                    '/users/check-tutorial-progress/hub/' +
                        this.userDetailsStore.userId
                );
                const data = await result.json();

                if (data === 0 && this.userDetailsStore.role == 'student') {
                    this.showTutorialTip1 = true;
                } else if (data === 1) {
                    this.isTutorialComplete = true;
                }
            } catch (error) {
                console.error('Error checking tutorial progress:', error);
            }
        },
        progressTutorial(step) {
            if (step == 1) {
                this.showTutorialTip1 = false;
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
        restartTutorial() {
            this.startTutorial();
        }
    }
};
</script>

<template>
    <div class="container">
        <!-- Header row with title and tutorial button -->
        <div class="d-flex justify-content-between align-items-start">
            <!-- Goals component -->
            <Goals
                :showTutorialTip="showTutorialTip1"
                @progressTutorial="progressTutorial"
            />
            <button
                v-if="sessionDetailsStore.isLoggedIn"
                class="btn"
                @click="restartTutorial"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 192 512"
                    width="20"
                    height="20"
                    class="primary-icon"
                >
                    <!-- !Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"
                    />
                </svg>
            </button>
        </div>
    </div>
</template>

<style scoped></style>
