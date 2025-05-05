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
        } else if (this.userDetailsStore.subscriptionTier == 'basic') {
            if (
                this.settingsStore.basicPlanTokenLimit <=
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
        // Purchase subscription
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
        // Load the Stripe Customer Portal page
        // (This redirects to Stripe's website)
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
        },
        // Cancel subscription at end of billing cycle.
        cancelPlan() {
            fetch('/subscriptions/cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.userDetailsStore.userId
                })
            });
        }
    }
};
</script>

<template>
    <div class="container">
        <h1 class="heading" :class="{ 'text-center': isMobileCheck < 576 }">
            Subscription
        </h1>
        <div class="row mt-4">
            <div class="col-md mb-3">
                <!-- Token usage stats -->
                <h2
                    class="secondary-heading h4 mb-4"
                    :class="{ 'text-center': isMobileCheck < 576 }"
                >
                    Monthly AI usage: {{ month }} {{ year }}
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
            <div
                class="col-md mb-3"
                :class="{ 'text-center': isMobileCheck < 576 }"
            >
                <h2 class="secondary-heading h4">Free</h2>
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
            <!-- Basic plan -->
            <div
                class="col-md mb-3"
                :class="{
                    'text-center': isMobileCheck < 576
                }"
            >
                <h2 class="secondary-heading h4">Basic</h2>
                <p>Ideal for moderate use</p>
                <p>$20 / month</p>
                <p>
                    <strong>Token limit:</strong>
                    {{
                        this.settingsStore.basicPlanTokenLimit.toLocaleString()
                    }}
                </p>
                <!-- Buy subscription -->
                <button
                    v-if="this.userDetailsStore.subscriptionTier == 'free'"
                    @click="checkout('basic')"
                    class="btn primary-btn mt-2"
                >
                    buy
                </button>
                <button
                    v-else-if="
                        this.userDetailsStore.subscriptionTier == 'basic'
                    "
                    disabled
                    class="btn primary-btn mt-1 mb-3"
                >
                    current plan
                </button>
                <button
                    @click="cancelPlan()"
                    v-else
                    class="btn primary-btn mt-2"
                >
                    downgrade to the Free plan
                </button>
            </div>
            <!-- Infinite plan -->
            <div
                class="col-md mb-3"
                :class="{ 'text-center': isMobileCheck < 576 }"
            >
                <h2 class="secondary-heading h4">Infinite</h2>
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
                <button
                    v-else-if="
                        this.userDetailsStore.subscriptionTier == 'infinite'
                    "
                    disabled
                    class="btn primary-btn mt-1 mb-3"
                >
                    current plan
                </button>
                <div v-else>
                    <!-- <button class="btn primary-btn mt-2">
                        downgrade to the Basic plan
                    </button> -->
                    <button @click="cancelPlan()" class="btn primary-btn mt-2">
                        downgrade to the Free plan
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
