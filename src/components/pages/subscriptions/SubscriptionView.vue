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
            isAITokenLimitReached: false,
            tokenLimit: 0
        };
    },
    async mounted() {
        //Stripe external script
        let stripeScript = document.createElement('script');
        stripeScript.setAttribute('src', 'https://js.stripe.com/v3/');
        document.head.appendChild(stripeScript);

        // Get free monthly AI token limit
        if (this.settingsStore.freePlanTokenLimit == 0) {
            await this.settingsStore.getSettings();
        }

        await this.userDetailsStore.getUserDetails();
        // Check if user is over free monthly AI token limit
        if (this.userDetailsStore.subscriptionTier == 'free') {
            if (
                this.settingsStore.freePlanTokenLimit <=
                this.userDetailsStore.monthlyTokenUsage
            ) {
                this.isAITokenLimitReached = true;
            }
            this.tokenLimit =
                this.settingsStore.freePlanTokenLimit.toLocaleString();
        } else if (this.userDetailsStore.subscriptionTier == 'capped') {
            if (
                this.settingsStore.cappedPlanTokenLimit <=
                this.userDetailsStore.monthlyTokenUsage
            ) {
                this.isAITokenLimitReached = true;
            }
            this.tokenLimit =
                this.settingsStore.cappedPlanTokenLimit.toLocaleString();
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

        if (this.userDetailsStore.subscriptionTier == 'free') {
        } else if (this.userDetailsStore.subscriptionTier == 'capped') {
            this.tokenLimit = this.settingsStore.cappedPlanTokenLimit;
        } else if (this.userDetailsStore.subscriptionTier == 'infinite') {
        }
    },
    methods: {
        checkout(planType) {
            fetch('/subscriptions/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    // convert cents to dollars
                    userId: this.userDetailsStore.userId,
                    planType: planType
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
    }
};
</script>

<template>
    <div class="container">
        <h1 class="heading">Subscription</h1>
        <!-- Token usage stats -->
        <h2 class="secondary-heading h4 mb-4">
            Monthly AI usage: {{ month }}, {{ year }}
        </h2>
        <ul>
            <li>
                <p>
                    <strong>Your subscription tier:</strong>
                    {{ userDetailsStore.subscriptionTier.toLocaleString() }}
                </p>
            </li>
            <li>
                <p>
                    <strong>Plan token limit:</strong>
                    {{ tokenLimit }}
                </p>
            </li>
            <li>
                <p>
                    <strong>Current usage:</strong>
                    {{ userDetailsStore.monthlyTokenUsage.toLocaleString() }}
                </p>
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
        <!-- <hr />
        <div class="row mt-4">
            <div class="col">
                <h2 class="secondary-heading h4">Capped plan</h2>
                <p>Ideal for moderate use</p>
                <p>$20 / month</p>
                <button
                    @click="checkout('capped')"
                    class="btn primary-btn mt-2"
                >
                    buy
                </button> -->
        <!-- Buy subscription -->
        <!-- </div>
            <div class="col">
                <h2 class="secondary-heading h4">Infinite plan</h2>
                <p>Ideal for daily use</p>
                <p>$100 / month</p>
                <button
                    @click="checkout('infinite')"
                    class="btn primary-btn mt-2"
                >
                    buy
                </button>
            </div>
        </div> -->
    </div>
</template>

<style scoped></style>
