<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSettingsStore } from '../../../stores/SettingsStore.js';
import { useSessionDetailsStore } from '../../../stores/SessionDetailsStore';
export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const settingsStore = useSettingsStore();
        const sessionDetailsStore = useSessionDetailsStore();
        return {
            userDetailsStore,
            settingsStore,
            sessionDetailsStore
        };
    },
    data() {
        return {
            monthlyTokenUsage: null,
            year: 0,
            month: '',
            isAITokenLimitReached: false,
            isMobileCheck: window.innerWidth,
            showTooltip: false,
            subscription: {},
            subSchedule: {},
            basicPlanPriceId: import.meta.env.VITE_BASIC_PLAN_PRICE_ID,
            infinitePlanPriceId: import.meta.env.VITE_INFINITE_PLAN_PRICE_ID,
            nextSubSchedulePhasePlan: '',
            // For the loading animation.
            isLoading: false,
            // For downloading invoices from Stripe
            receipts: []
        };
    },
    async created() {
        // Get free monthly AI token limit
        if (!this.settingsStore.freePlanTokenLimit) {
            await this.settingsStore.getSettings();
        }

        await this.userDetailsStore.getUserDetails();
        await this.getSubscription();
    },
    async mounted() {
        //Stripe external script
        let stripeScript = document.createElement('script');
        stripeScript.setAttribute('src', 'https://js.stripe.com/v3/');
        document.head.appendChild(stripeScript);

        // Check if user is over free monthly AI token limit
        if (this.userDetailsStore.subscriptionTier == 'free') {
            if (
                this.settingsStore.freePlanTokenLimit &&
                this.userDetailsStore.monthlyTokenUsage &&
                this.settingsStore.freePlanTokenLimit <=
                    this.userDetailsStore.monthlyTokenUsage
            ) {
                this.isAITokenLimitReached = true;
            }
        } else if (this.userDetailsStore.subscriptionTier == 'basic') {
            if (
                this.settingsStore.basicPlanTokenLimit &&
                this.userDetailsStore.monthlyTokenUsage &&
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
    computed: {
        formattedStripeCurrentPeriodEndDate() {
            let dateObj = new Date(this.subscription.current_period_end * 1000);

            // You could get this from a store or user preferences
            const locale = 'en-US'; // Default to English

            // Get day name using Intl.DateTimeFormat
            const dayName = new Intl.DateTimeFormat(locale, {
                weekday: 'long'
            }).format(dateObj);

            // Get day number
            const day = dateObj.getDate();

            // Get day suffix (note: this is English-specific, would need adaptation for other languages)
            let daySuffix = 'th';
            if (day % 10 === 1 && day !== 11) daySuffix = 'st';
            if (day % 10 === 2 && day !== 12) daySuffix = 'nd';
            if (day % 10 === 3 && day !== 13) daySuffix = 'rd';

            // Get month name using Intl.DateTimeFormat
            const monthName = new Intl.DateTimeFormat(locale, {
                month: 'long'
            }).format(dateObj);

            // Get year
            const year = dateObj.getFullYear();

            // Format template (this would also need to be translated for other languages)
            return `${dayName} the ${day}${daySuffix} of ${monthName}, ${year}`;
        },
        formattedMonthlyTokenUsage() {
            return this.userDetailsStore.monthlyTokenUsage
                ? this.userDetailsStore.monthlyTokenUsage.toLocaleString()
                : '0';
        },
        formattedFreePlanTokenLimit() {
            return this.settingsStore.freePlanTokenLimit
                ? this.settingsStore.freePlanTokenLimit.toLocaleString()
                : '0';
        },
        formattedBasicPlanTokenLimit() {
            return this.settingsStore.basicPlanTokenLimit
                ? this.settingsStore.basicPlanTokenLimit.toLocaleString()
                : '0';
        },
        subscriptionTierFormatted() {
            return this.userDetailsStore.subscriptionTier
                ? this.userDetailsStore.subscriptionTier.toLocaleString()
                : 'free';
        }
    },
    methods: {
        async getSubscription() {
            const result = await fetch(
                '/subscriptions/get-sub/' + this.userDetailsStore.userId
            );
            const subscriptionData = await result.json();
            // Load the subscription, if there is one
            this.subscription = subscriptionData.subscription;
            // Check if there is a subscription schedule
            // This would have been created in the case of a downgrade or upgrade,
            // but not cancellation (downgrade to free plan).
            this.subSchedule = subscriptionData.subSchedule;
            if (this.subSchedule) {
                let nextPhasePlan = this.subSchedule.phases[1].items[0].price;
                if (nextPhasePlan == this.basicPlanPriceId) {
                    this.nextSubSchedulePhasePlan = 'Basic';
                } else if (nextPhasePlan == this.infinitePlanPriceId) {
                    this.nextSubSchedulePhasePlan = 'Infinite';
                }
            }

            for (let i = 0; i < subscriptionData.charges.data.length; i++) {
                this.receipts.push(subscriptionData.charges.data[i]);
            }
        },
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
            if (
                confirm('Are you sure you want to downgrade to the Free plan?')
            ) {
                fetch('/subscriptions/cancel', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        userId: this.userDetailsStore.userId
                    })
                })
                    .then(function (response) {
                        return response.json();
                    })
                    .then(async (data) => {
                        if (data.status == 'succeeded') {
                            this.getSubscription();
                        } else {
                            alert(
                                'Downgrade did not work. Please try again later.'
                            );
                        }
                    });
            } else {
                return;
            }
        },
        // Downgrade subscription from Infinite to Basic.
        downgradePlan() {
            if (
                confirm('Are you sure you want to downgrade to the Basic plan?')
            ) {
                this.isLoading = true;
                fetch('/subscriptions/downgrade', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        subscriptionId: this.subscription.id,
                        subScheduleId: this.subSchedule
                            ? this.subSchedule.id
                            : null
                    })
                })
                    .then(function (response) {
                        return response.json();
                    })
                    .then(async (data) => {
                        if (data.status == 'succeeded') {
                            await this.getSubscription();
                        } else {
                            alert(
                                'Downgrade did not work. Please try again later.'
                            );
                        }
                        this.isLoading = false;
                    });
            } else {
                return;
            }
        },
        // Upgrade subscription from Basic to Infinite.
        upgradePlan() {
            if (
                confirm(
                    `Are you sure you want to upgrade to the Infinite plan? (You will be billed immediately)`
                )
            ) {
                this.isLoading = true;
                fetch('/subscriptions/upgrade', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        subscriptionId: this.subscription.id
                    })
                })
                    .then(function (response) {
                        return response.json();
                    })
                    .then(async (data) => {
                        if (data.status == 'succeeded') {
                            await this.userDetailsStore.getUserDetails();
                            this.$router.push('/subscriptions/completed');
                        } else {
                            alert(
                                'Upgrade did not work. Please try again later.'
                            );
                        }
                        this.isLoading = false;
                    });
            } else {
                return;
            }
        },
        formattedStripeReceiptDate(receipt) {
            let dateObj = new Date(receipt.created * 1000);
            const month = dateObj.getUTCMonth() + 1; // months from 1-12
            const day = dateObj.getUTCDate();
            const year = dateObj.getUTCFullYear();
            const formattedDate = year + '/' + month + '/' + day;
            return formattedDate;
        },
        formattedStripeReceiptAmount(receipt) {
            const formattedAmount = (
                receipt.amount_captured / 100
            ).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });
            return formattedAmount;
        },
        // Tutorial tooltips
        openTooltip() {
            this.showTooltip = true;
        },
        closeTooltip() {
            this.showTooltip = false;
        }
    }
};
</script>

<template>
    <div class="container">
        <div class="row mt-4">
            <div class="col-md">
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
                            {{ subscriptionTierFormatted }}
                        </p>
                    </li>
                    <li>
                        <p>
                            <strong>Current token usage:</strong>
                            {{ formattedMonthlyTokenUsage }}
                        </p>
                    </li>
                </ul>
                <div
                    v-if="isAITokenLimitReached"
                    class="alert alert-warning"
                    :class="{ 'mb-0': isMobileCheck >= 576 }"
                    role="alert"
                >
                    You are over the monthly free limit. You can't use the AI
                    features until next month.
                </div>
                <div
                    v-if="subscription && subscription.cancel_at_period_end"
                    class="alert alert-warning"
                    :class="{ 'mb-0': isMobileCheck >= 576 }"
                    role="alert"
                >
                    Your plan will downgrade to the Free plan on
                    {{ formattedStripeCurrentPeriodEndDate }}
                </div>
                <div
                    v-if="nextSubSchedulePhasePlan != ''"
                    class="alert alert-warning"
                    :class="{ 'mb-0': isMobileCheck >= 576 }"
                    role="alert"
                >
                    Your plan will downgrade to the
                    {{ nextSubSchedulePhasePlan }} plan on
                    {{ formattedStripeCurrentPeriodEndDate }}
                </div>
            </div>

            <!-- Single Tooltip -->
            <div v-if="showTooltip" class="modal">
                <div class="modal-content">
                    <div>
                        <p>
                            It is against our policy to share accounts and each
                            account is meant to only be used by one user.
                        </p>

                        <button class="btn primary-btn" @click="closeTooltip">
                            Close
                        </button>
                    </div>
                </div>
            </div>
            <div
                class="col-md d-flex"
                :class="
                    isMobileCheck > 576
                        ? 'justify-content-end'
                        : 'justify-content-center'
                "
            >
                <!-- Manage subscription -->
                <button
                    v-if="userDetailsStore.subscriptionTier != 'free'"
                    class="btn primary-btn"
                    @click="loadPortal()"
                >
                    Manage subscription
                </button>
                <!-- Info button -->
                <button class="btn info-btn ms-1" @click="openTooltip">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 192 512"
                        width="20"
                        height="20"
                        class="primary-icon"
                    >
                        <!-- !Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                        <path
                            d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"
                        />
                    </svg>
                </button>
            </div>
        </div>
        <hr />
        <!-- Loading animation -->
        <div
            v-if="isLoading == true"
            class="d-flex justify-content-center align-items-center py-4"
        >
            <span class="subscription-loader"></span>
        </div>
        <div v-else class="row mt-4">
            <!-- Free plan -->
            <div
                class="col-md mb-3"
                :class="{ 'text-center': isMobileCheck < 576 }"
            >
                <h2 class="secondary-heading h4">Free</h2>
                <p>
                    <strong>Token limit:</strong>
                    {{ formattedFreePlanTokenLimit }}
                </p>
                <button
                    v-if="userDetailsStore.subscriptionTier == 'free'"
                    disabled
                    class="btn primary-btn mt-1"
                >
                    current plan
                </button>
                <button
                    v-else-if="
                        subscription &&
                        subscription.cancel_at_period_end == false &&
                        nextSubSchedulePhasePlan != 'Basic'
                    "
                    @click="cancelPlan()"
                    class="btn primary-btn mt-1 mb-3"
                >
                    downgrade
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
                    {{ formattedBasicPlanTokenLimit }}
                </p>
                <!-- Buy subscription -->
                <button
                    v-if="userDetailsStore.subscriptionTier == 'free'"
                    @click="checkout('basic')"
                    class="btn primary-btn mt-1"
                >
                    buy
                </button>
                <button
                    v-else-if="
                        subscription &&
                        userDetailsStore.subscriptionTier == 'infinite' &&
                        nextSubSchedulePhasePlan != 'Basic' &&
                        subscription.cancel_at_period_end == false
                    "
                    @click="downgradePlan()"
                    class="btn primary-btn mt-1"
                >
                    downgrade
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
                    v-if="userDetailsStore.subscriptionTier == 'free'"
                    @click="checkout('infinite')"
                    class="btn primary-btn mt-1"
                >
                    buy
                </button>
                <button
                    v-else-if="
                        subscription &&
                        userDetailsStore.subscriptionTier == 'basic' &&
                        subscription.cancel_at_period_end == false
                    "
                    @click="upgradePlan()"
                    class="btn primary-btn mt-1"
                >
                    upgrade
                </button>
                <button
                    v-else-if="
                        this.userDetailsStore.subscriptionTier == 'infinite'
                    "
                    disabled
                    class="btn primary-btn mt-1"
                >
                    current plan
                </button>
            </div>
        </div>
        <hr />
        <div
            :class="{
                'text-center': isMobileCheck < 576
            }"
        >
            <h2 class="secondary-heading h4">Receipts</h2>
            <div v-for="receipt in receipts">
                <a :href="receipt.receipt_url" target="_blank">
                    {{ formattedStripeReceiptAmount(receipt) }}
                    {{ formattedStripeReceiptDate(receipt) }}</a
                >
            </div>
            <p v-if="isMobileCheck < 576">&nbsp;</p>
        </div>
    </div>
</template>

<style scoped>
.info-btn {
    max-height: 40px;
}

/* Loading animation */
.subscription-loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--primary-color);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    100% {
        transform: rotate(0deg);
    }
    0% {
        transform: rotate(360deg);
    }
}
/* End of loading animation */

/* Modals */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 2000;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 5% auto;
    /* 5% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    max-width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    /* Modal Content/Box */
    .modal-content {
        width: 90%;
        margin-top: 5%;
    }
}
</style>
