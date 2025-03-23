<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSettingsStore } from '../../../stores/SettingsStore.js';

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
            monthlyTokenUsage: null,
            year: 0,
            month: '',
            dollars: 10,
            isAITokenLimitReached: false,
            assistantsModelPrice: { input: 75, output: 150 }
            // Not being charged yet
            // ttsModelPrice: 15,
            // sttModelPerMinutePrice: 0.006
        };
    },
    async mounted() {
        // Get free monthly AI token limit
        if (this.settingsStore.freeMonthlyTokens == 0) {
            await this.settingsStore.getSettings();
        }

        await this.userDetailsStore.getUserDetails();
        // Check if user is over free monthly AI token limit
        if (this.userDetailsStore.tokens <= 0) {
            if (
                this.settingsStore.freeMonthlyTokens <=
                this.userDetailsStore.monthlyTokenUsage
            ) {
                this.isAITokenLimitReached = true;
            }
        }

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
            fetch('/subscriptions/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tokens: this.dollars,
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
    computed: {
        numberOfInputTokens() {
            let tokensPerDollar = 1000000 / this.assistantsModelPrice.input;
            return Math.trunc(this.dollars * tokensPerDollar);
        },
        numberOfOutputTokens() {
            let tokensPerDollar = 1000000 / this.assistantsModelPrice.output;
            return Math.trunc(this.dollars * tokensPerDollar);
        }
    }
};
</script>

<template>
    <div class="container">
        <h1 class="heading">Subscription</h1>
        <p>
            <em>
                In general one token is roughly equivalent to 4 characters
                (letters)</em
            >
        </p>
        <h2 class="secondary-heading h4">
            Monthly AI usage: {{ month }}, {{ year }}
        </h2>
        <ul>
            <li>
                <p>Free limit: {{ settingsStore.freeMonthlyTokens }}</p>
            </li>
            <li>
                <p>Your tokens: {{ userDetailsStore.tokens }}</p>
            </li>
            <li>
                <p>Current usage: {{ userDetailsStore.monthlyTokenUsage }}</p>
            </li>
        </ul>
        <div
            v-if="isAITokenLimitReached"
            class="alert alert-warning"
            role="alert"
        >
            You are over the monthly free limit. You can't use the AI features
            until next month.
        </div>
        <h2 class="secondary-heading h4 mt-5">Buy tokens</h2>
        <label>$&nbsp; </label>
        <input
            class=""
            type="number"
            v-model="dollars"
            min="1"
            max="500"
        /><br />
        <ul class="mt-3">
            <li>Amount of input tokens: {{ numberOfInputTokens }}</li>
            or
            <li>Amount of output tokens: {{ numberOfOutputTokens }}</li>
            <!-- Not being charged yet -->
            <!-- <li>Amount of speech to text seconds:</li>
            <li>Amount of text to speech tokens:</li> -->
        </ul>
        <button @click="checkout()" class="btn primary-btn mt-2">
            Check out
        </button>
        <hr />
        <h2>info</h2>
        <p>Example usage:</p>
        <ul>
            <li>AI asking me a question: 329 tokens</li>
            <li>AI explaining something: 673 tokens</li>
            <li>AI assessing if I have mastered a skill:</li>
        </ul>
    </div>
</template>

<style scoped></style>
