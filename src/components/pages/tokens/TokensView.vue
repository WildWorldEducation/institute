<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import { useSettingsStore } from '../../../stores/SettingsStore.js';
import { useSessionDetailsStore } from '../../../stores/SessionDetailsStore.js';
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
            // For downloading invoices from Stripe
            receipts: [],
            isAITokenLimitReached: false,
            assistantsModelPrice: { input: 75, output: 150 }
        };
    },
    async created() {
        // Get free monthly AI token limit
        if (this.settingsStore.freeTokenMonthlyLimit == 0) {
            await this.settingsStore.getSettings();
        }

        await this.userDetailsStore.getUserDetails();
    },
    async mounted() {
        //Stripe external script
        let stripeScript = document.createElement('script');
        stripeScript.setAttribute('src', 'https://js.stripe.com/v3/');
        document.head.appendChild(stripeScript);

        // Check if user is over free monthly AI token limit
        let tokenBalance =
            this.userDetailsStore.monthlyTokenUsage -
            this.settingsStore.freeTokenMonthlyLimit;

        if (
            this.settingsStore.freeTokenMonthlyLimit <=
            this.userDetailsStore.monthlyTokenUsage
        ) {
            if (tokenBalance > this.userDetailsStore.tokens) {
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

        this.getReceipts();
    },
    computed: {
        formattedMonthlyTokenUsage() {
            return this.userDetailsStore.monthlyTokenUsage
                ? this.userDetailsStore.monthlyTokenUsage.toLocaleString()
                : '0';
        }
    },
    methods: {
        async getReceipts() {
            const result = await fetch(
                '/tokens/get-receipts/' + this.userDetailsStore.userId
            );
            const receiptsData = await result.json();
            for (let i = 0; i < receiptsData.charges.data.length; i++) {
                this.receipts.push(receiptsData.charges.data[i]);
            }
        },
        // Purchase tokens
        checkout(numberOfTokens) {
            fetch('/tokens/create-checkout-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.userDetailsStore.userId,
                    numberOfTokens: numberOfTokens
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
            fetch('/tokens/create-customer-portal-session', {
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
        <div class="row">
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
                            <strong>Free limit:</strong>
                            {{
                                settingsStore.freeTokenMonthlyLimit.toLocaleString()
                            }}
                        </p>
                    </li>
                    <li>
                        <p>
                            <strong>Current token usage:</strong>
                            {{ formattedMonthlyTokenUsage }}
                        </p>
                    </li>
                    <li>
                        <p>
                            <strong>Your tokens:</strong>
                            {{ userDetailsStore.tokens.toLocaleString() }}
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
                <!-- Manage billing -->
                <button
                    v-if="
                        userDetailsStore.stripeCustomerId &&
                        userDetailsStore.stripeCustomerId != ''
                    "
                    class="btn primary-btn"
                    @click="loadPortal()"
                >
                    Manage billing
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

        <div class="row mt-4">
            <!-- 200,000 tokens -->
            <div
                class="col-md mb-3"
                :class="{ 'text-center': isMobileCheck < 576 }"
            >
                <h2 class="secondary-heading h5">200,000 tokens</h2>
                <p>$10</p>
                <!-- Buy tokens -->
                <button @click="checkout(200000)" class="btn primary-btn mt-1">
                    buy
                </button>
            </div>
            <!-- 400,000 tokens -->
            <div
                class="col-md mb-3"
                :class="{
                    'text-center': isMobileCheck < 576
                }"
            >
                <h2 class="secondary-heading h5">400,000 tokens</h2>
                <p>$20</p>
                <!-- Buy tokens -->
                <button @click="checkout(400000)" class="btn primary-btn mt-1">
                    buy
                </button>
            </div>
            <!-- 1000,000 tokens -->
            <div
                class="col-md mb-3"
                :class="{ 'text-center': isMobileCheck < 576 }"
            >
                <h2 class="secondary-heading h5">1,000,000 tokens</h2>
                <p>$50</p>
                <button @click="checkout(1000000)" class="btn primary-btn mt-1">
                    buy
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
