import { defineStore } from 'pinia'

export const useSessionDetailsStore = defineStore("sessionDetails", {
    state: () => {
        return {
            isLoggedIn: null,
            userId: null,
        }
    },
    actions: {
        async getSessionDetails() {
            const result = await fetch('/get-session-details');
            const data = await result.json();

            this.isLoggedIn = data.isLoggedIn;
            this.userId = data.userId;

            return this.$state;
        },
    }
});