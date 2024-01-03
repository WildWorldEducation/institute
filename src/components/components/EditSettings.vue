<script>
import router from "../../router";
// Import the store.
import { useSettingsStore } from '../../stores/SettingsStore'
import { useTagsStore } from '../../stores/TagsStore'

export default {
    setup() {
        const settingsStore = useSettingsStore();
        const tagsStore = useTagsStore();
        return {
            settingsStore, tagsStore
        }
    },
    data() {
        return {
            checkedFilters: []
        };
    },
    async created() {
        await this.tagsStore.getTagsList()
    },
    methods: {
        Submit() {
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        skill_degradation_days: this.settingsStore.settings.skill_degradation_days,
                    })
            };
            var url = "/settings/edit";
            fetch(url, requestOptions)
                .then(() => {
                    this.$router.push("/profile-settings");
                });
        },
        ApplyFilter() {

        }
    }
}
</script> 

<template>
    <div class="container mt-3">
        <h1>Edit Settings</h1>
        <div class="mb-3">
            <label for="daysForSkillToDegrade" class="form-label">Days For Skills To Degrade:</label>
            <input v-model="settingsStore.settings.skill_degradation_days" type="number" id="daysForSkillToDegrade" min="1"
                max="3650" class="form-control" aria-describedby="daysForSkillToDegrade">
        </div>
        <div class="mb-3">
            <div v-for="tag in this.tagsStore.tagsList">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" :value="tag.id" id="flexCheckDefault"
                        v-model="checkedFilters" @change="ApplyFilter()">
                    <label class=" form-check-label" for="flexCheckDefault">
                        {{ tag.name }}
                    </label>
                </div>
            </div>
        </div>

        <div class="d-flex justify-content-between mb-3">
            <router-link class="btn btn-dark" to="/profile-settings">
                Cancel
            </router-link>
            <button @click="Submit()" type="submit" class="btn btn-dark">Submit</button>
        </div>
    </div>
</template>


<style scoped></style> 