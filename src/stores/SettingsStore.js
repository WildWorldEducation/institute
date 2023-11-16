import { defineStore } from 'pinia'

export const useSettingsStore = defineStore("settings", {
    state: () => ({
        settings: {},
    }),
    actions: {
        async getSettings() {
            const result = await fetch('/settings');
            const data = await result.json();
            this.settings = data;
        },
    }
});