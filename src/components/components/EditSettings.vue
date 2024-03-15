<script>
import router from '../../router';
// Import the store.
import { useSettingsStore } from '../../stores/SettingsStore';
import { useTagsStore } from '../../stores/TagsStore';

export default {
    setup() {
        const settingsStore = useSettingsStore();
        const tagsStore = useTagsStore();

        return {
            settingsStore,
            tagsStore
        };
    },
    data() {
        return {
            filters: []
        };
    },
    async created() {
        // Load the settings.
        if (
            this.settingsStore.skillDegradationDays == null ||
            this.settingsStore.quizMaxQuestions == null
        ) {
            await this.settingsStore.getSettings();
        }
        if (this.tagsStore.tagsList.length == 0)
            await this.tagsStore.getTagsList();
        for (let i = 0; i < this.tagsStore.tagsList.length; i++) {
            if (this.tagsStore.tagsList[i].is_active == 'active')
                this.filters.push(this.tagsStore.tagsList[i].id);
        }
    },
    methods: {
        Submit() {
            for (let i = 0; i < this.tagsStore.tagsList.length; i++) {
                if (this.filters.includes(this.tagsStore.tagsList[i].id)) {
                    this.tagsStore.tagsList[i].is_active = 'active';
                } else {
                    this.tagsStore.tagsList[i].is_active = 'inactive';
                }
            }

            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    skill_degradation_days:
                        this.settingsStore.skillDegradationDays,
                    quiz_max_questions: this.settingsStore.quizMaxQuestions,
                    tags: this.tagsStore.tagsList
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
            <div v-for="tag in this.tagsStore.tagsList">
                <div class="form-check">
                    <input
                        class="form-check-input"
                        type="checkbox"
                        :value="tag.id"
                        id="flexCheckDefault"
                        v-model="filters"
                    />
                    <label class="form-check-label" for="flexCheckDefault">
                        {{ tag.name }}
                    </label>
                </div>
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
