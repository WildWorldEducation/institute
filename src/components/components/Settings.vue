<script>
// Import the stores.
import { useSettingsStore } from '../../stores/SettingsStore.js';

export default {
    setup() {
        const settingsStore = useSettingsStore();
        settingsStore.getSettings();
        return {
            settingsStore
        };
    },
    data() {
        return {};
    }
};
</script>

<template>
    <div class="container mt-3 pb-5 px-3 px-lg-0">
        <hr />
        <h1>Settings</h1>
        <p>
            time for student skills to degrade (in days):
            {{ settingsStore.skillDegradationDays }}
        </p>
        <p>
            max number of questions per quiz:
            {{ settingsStore.quizMaxQuestions }}
        </p>
        <p>
            <router-link
                to="/settings/edit"
                class="btn green-btn"
                role="button"
            >
                Edit&nbsp;
                <!-- Pencil icon -->
                <svg
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
                        fill="white"
                    />
                    <path
                        d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
                        fill="white"
                    />
                    <path
                        d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
                        fill="white"
                    />
                </svg>
            </router-link>
        </p>
    </div>
</template>

<style scoped>
.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}
</style>
