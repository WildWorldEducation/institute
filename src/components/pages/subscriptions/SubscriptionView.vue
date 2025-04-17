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
            isMobileCheck: window.innerWidth
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
        } else if (this.userDetailsStore.subscriptionTier == 'capped') {
            if (
                this.settingsStore.cappedPlanTokenLimit <=
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
        checkout(planType) {
            fetch('/subscriptions/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.userDetailsStore.userId,
                    planType: planType
                })
            })
                .then((res) => {
                    if (res.ok) return res.json();
                    return res.json().then((json) => Promise.reject(json));
                })
                .then(({ url }) => {
                    window.location = url;
                })
                .catch((e) => {
                    console.error(e.error);
                });
        },
        loadPortal() {
            fetch('/subscriptions/create-customer-portal-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.userDetailsStore.userId
                })
            })
                .then((res) => {
                    if (res.ok) return res.json();
                    return res.json().then((json) => Promise.reject(json));
                })
                .then(({ url }) => {
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
        <div class="row mt-4">
            <div class="col-md mb-3">
                <!-- Token usage stats -->
                <h2 class="secondary-heading h4 mb-4">
                    Monthly AI usage: {{ month }}, {{ year }}
                </h2>
                <ul>
                    <li>
                        <p>
                            <strong>Your subscription tier:</strong>
                            {{
                                userDetailsStore.subscriptionTier.toLocaleString()
                            }}
                        </p>
                    </li>
                    <li>
                        <p>
                            <strong>Current token usage:</strong>
                            {{
                                userDetailsStore.monthlyTokenUsage.toLocaleString()
                            }}
                        </p>
                    </li>
                </ul>
                <div
                    v-if="isAITokenLimitReached"
                    class="alert alert-warning"
                    role="alert"
                >
                    You are over the monthly free limit. You can't use the AI
                    features until next month.
                </div>
            </div>
            <div
                class="col-md mb-3 d-flex"
                :class="
                    isMobileCheck > 576
                        ? 'justify-content-end'
                        : 'justify-content-center'
                "
            >
                <!-- Manage  billing -->
                <button
                    v-if="this.userDetailsStore.subscriptionTier != 'free'"
                    class="btn primary-btn"
                    @click="loadPortal()"
                >
                    Manage billing
                </button>
            </div>
        </div>
        <hr />
        <div class="row mt-4">
            <!-- Free plan -->
            <div class="col-md mb-3">
                <h2 class="secondary-heading h4">Free plan</h2>
                <p>
                    <strong>Token limit:</strong>
                    {{ this.settingsStore.freePlanTokenLimit.toLocaleString() }}
                </p>
                <button
                    v-if="this.userDetailsStore.subscriptionTier == 'free'"
                    disabled
                    class="btn primary-btn mt-2"
                >
                    current plan
                </button>
            </div>
            <!-- Capped plan -->
            <div class="col-md mb-3">
                <h2 class="secondary-heading h4">Capped plan</h2>
                <p>Ideal for moderate use</p>
                <p>$20 / month</p>
                <p>
                    <strong>Token limit:</strong>
                    {{
                        this.settingsStore.cappedPlanTokenLimit.toLocaleString()
                    }}
                </p>
                <!-- Buy subscription -->
                <button
                    v-if="this.userDetailsStore.subscriptionTier == 'free'"
                    @click="checkout('capped')"
                    class="btn primary-btn mt-2"
                >
                    buy
                </button>
                <button
                    v-if="this.userDetailsStore.subscriptionTier == 'capped'"
                    disabled
                    class="btn primary-btn mt-2"
                >
                    current plan
                </button>
            </div>
            <div class="col-md mb-3">
                <h2 class="secondary-heading h4">Infinite plan</h2>
                <p>Ideal for daily use</p>
                <p>$100 / month</p>
                <p>
                    <strong>Token limit:</strong>
                    Infinite
                </p>
                <button
                    v-if="this.userDetailsStore.subscriptionTier == 'free'"
                    @click="checkout('infinite')"
                    class="btn primary-btn mt-2"
                >
                    buy
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
