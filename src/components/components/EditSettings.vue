<script>
import router from '../../router';
// Import the store.
import { useSettingsStore } from '../../stores/SettingsStore';

export default {
    setup() {
        const settingsStore = useSettingsStore();

        return {
            settingsStore
        };
    },
    data() {
        return {};
    },
    async created() {
        // Load the settings.
        if (
            this.settingsStore.skillDegradationDays == null ||
            this.settingsStore.quizMaxQuestions == null
        ) {
            await this.settingsStore.getSettings();
        }
    },
    methods: {
        Submit() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skill_degradation_days:
                        this.settingsStore.skillDegradationDays,
                    quiz_max_questions: this.settingsStore.quizMaxQuestions,
                    is_manual_essay_marking:
                        this.settingsStore.isManualEssayMarking
                })
            };
            var url = '/settings/edit';
            fetch(url, requestOptions).then(() => {
                this.$router.push('/profile-settings');
            });
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <h1>Edit Settings</h1>
        <div class="mb-3">
            <label for="daysForSkillToDegrade" class="form-label"
                >Days For Skills To Degrade:</label
            >
            <input
                v-model="settingsStore.skillDegradationDays"
                type="number"
                id="daysForSkillToDegrade"
                min="1"
                max="3650"
                class="form-control"
                aria-describedby="daysForSkillToDegrade"
            />
        </div>
        <div class="mb-3">
            <label for="daysForSkillToDegrade" class="form-label"
                >Max Number of Questions Per Quiz:</label
            >
            <input
                v-model="settingsStore.quizMaxQuestions"
                type="number"
                id="quizMaxQuestions"
                min="1"
                max="200"
                class="form-control"
                aria-describedby="quizMaxQuestions"
            />
        </div>
        <div class="mb-3">
            <label class="form-label"
                >Grading method for written questions:</label
            >
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="radio"
                    value="0"
                    v-model="settingsStore.isManualEssayMarking"
                />
                <label class="form-check-label"> Automatic (AI) </label>
            </div>
            <div class="form-check">
                <input
                    class="form-check-input"
                    type="radio"
                    value="1"
                    v-model="settingsStore.isManualEssayMarking"
                />
                <label class="form-check-label"> Manual (instructor) </label>
            </div>
        </div>
        <div class="d-flex justify-content-between mb-3">
            <router-link class="btn btn-dark" to="/profile-settings">
                Cancel
            </router-link>
            <button @click="Submit()" type="submit" class="btn btn-dark">
                Submit
            </button>
        </div>
    </div>
</template>

<style scoped></style>
