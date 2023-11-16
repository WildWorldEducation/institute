<script>
import router from "../../router";
// Import the store.
import { useSettingsStore } from '../../stores/SettingsStore'

export default {
    setup() {
        const settingsStore = useSettingsStore();
        return {
            settingsStore
        }
    },
    data() {
        return {

        };
    },
    async created() {

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
            <button @click="Submit()" type="submit" class="btn btn-dark">Submit</button>
        </div>
    </div>
</template>


<style scoped></style> 