<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSettingsStore } from '../../stores/SettingsStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const settingsStore = useSettingsStore();

        return {
            userDetailsStore,
            settingsStore
        };
    },
    data() {
        return {
            tokenCount: null,
            year: 0,
            month: '',
            tokensToBuy: 10000
        };
    },
    async mounted() {
console.log(this.settingsStore.mon)


        // Work out date
        // Get current year
        this.year = new Date().getFullYear();
        // Get current month
        const month = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];

        const d = new Date();
        this.month = month[d.getMonth()];
    },
    methods: {
        checkout() {
            console.log(this.tokensToBuy);
            fetch('/subscriptions/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tokens: this.tokensToBuy,
                    userId: this.userDetailsStore.userId
                })
            })
                .then((res) => {
                    if (res.ok) return res.json();
                    return res.json().then((json) => Promise.reject(json));
                })
                .then(({ url }) => {
                    console.log('add tokens');
                    window.location = url;
                })
                .catch((e) => {
                    console.error(e.error);
                });
        }
    },
    computed: {}
};
</script>

<template>
    <div class="container">
        <h1 class="heading">Subscription</h1>
        <h2 class="secondary-heading h4">
            Monthly AI usage: {{ month }}, {{ year }}
        </h2>
        <ul>
            <li><p>Free limit: 10,000</p></li>
            <li><p>Your tokens: 0</p></li>
            <li>
                <p>Current usage: {{ userDetailsStore.tokenCount }}</p>
            </li>
        </ul>
        <h2 class="secondary-heading h4 mt-5">Buy tokens</h2>
        <label>Amount of tokens: </label>
        <input
            type="number"
            v-model="tokensToBuy"
            min="1000"
            max="500000"
        /><br />
        <button @click="checkout()" class="btn primary-btn mt-2">
            Check out
        </button>
    </div>
</template>

<style scoped></style>
