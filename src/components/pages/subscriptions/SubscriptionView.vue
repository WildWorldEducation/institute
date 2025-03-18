<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            tokenCount: null,
            year: 0,
            month: ''
        };
    },
    async mounted() {
        this.getTokenCount();
        this.year = new Date().getFullYear();
        // get month
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
        async getTokenCount() {
            // Get current year
            let year = new Date().getFullYear();
            // Get current month
            let month = new Date().getMonth();
            const result = await fetch(
                `/subscriptions/get-token-count/${this.userDetailsStore.userId}/${year}/${month}`
            );
            const resData = await result.json();
            console.log(resData);
            this.tokenCount = resData.token_count;
        }
    },
    computed: {}
};
</script>

<template>
    <div class="container">
        <h1 class="heading">Subscription</h1>
        <h2 class="secondary-heading h3">
            Monthly usage: {{ month }}, {{ year }}
        </h2>

        <ul>
            <li>Limit: 10,000</li>
            <li>Current usage: {{ tokenCount }}</li>
        </ul>
        <button class="btn primary-btn">Buy tokens</button>
    </div>
</template>

<style scoped></style>
