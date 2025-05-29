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
            assistantsModelPrice: { input: 75, output: 150 },
            showTokensDropDown: false,
            products: [
                {
                    name: '200,000 tokens for $10',
                    tokens: 200000
                },
                {
                    name: '400,000 tokens for $20',
                    tokens: 400000
                },
                {
                    name: '1,000,000 tokens for $50',
                    tokens: 1000000
                }
            ],
            chosenProduct: {}
        };
    },
    async created() {
        this.chosenProduct = this.products[0];
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

        if (
            this.userDetailsStore.stripeCustomerId &&
            this.userDetailsStore.stripeCustomerId != ''
        )
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
        // So the dropdown closes if click on screen
        closeOnDropdownOnClickAnywhere() {
            const tokenDropdown = document.getElementById('token-dropdown');
            document.body.addEventListener('click', (event) => {
                if (!tokenDropdown.contains(event.target)) {
                    this.showTokensDropDown = false;
                }
            });
        },
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
        <!-- Buy tokens -->
        <div class="row">
            <div class="col col-md-8 col-lg-5 mt-2">
                <!-- Custom Dropdown -->
                <h2 class="secondary-heading h4">Buy Tokens</h2>
                <div class="d-flex flex-column position-relative">
                    <div
                        id="token-dropdown"
                        :class="[
                            showTokensDropDown
                                ? 'custom-select-button-focus'
                                : 'custom-select-button'
                        ]"
                        @click="
                            showTokensDropDown = !showTokensDropDown;
                            closeOnDropdownOnClickAnywhere();
                        "
                    >
                        {{ chosenProduct.name }}
                        <!-- Down arrow -->
                        <span>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M14.2929 8.70711C14.9229 8.07714 14.4767 7 13.5858 7H6.41421C5.52331 7 5.07714 8.07714 5.70711 8.70711L9.29289 12.2929C9.68342 12.6834 10.3166 12.6834 10.7071 12.2929L14.2929 8.70711Z"
                                    fill="#344054"
                                />
                            </svg>
                        </span>
                    </div>
                    <div v-if="showTokensDropDown" class="custom-dropdown-base">
                        <div
                            v-for="product in products"
                            class="custom-dropdown-option"
                            @click="
                                chosenProduct = product;
                                showTokensDropDown = false;
                            "
                        >
                            {{ product.name }}
                        </div>
                    </div>
                </div>
                <!-- End of custom dropdown -->
            </div>
        </div>
        <button
            @click="checkout(chosenProduct.tokens)"
            class="btn primary-btn mt-2 mb-2"
        >
            buy
        </button>

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
/* =========================== */

/* Style For The Custom Select */
.custom-select-button {
    width: 100%;
    height: 42px;
    padding: 10px 0px 10px 14px;
    border-radius: 8px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    border: 1px solid #f2f4f7;
    box-shadow: 0px 1px 2px 0px #1018280d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    display: flex;
}

.custom-select-button-focus {
    width: 100%;
    height: 42px;
    padding: 10px 0px 10px 14px;
    border-radius: 8px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    border: 1px solid #9c7eec;
    box-shadow: 0px 0px 0px 4px #bca3ff4d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    display: flex;
}

.custom-select-button:hover {
    cursor: pointer;
    border: 1px solid #9c7eec;
}

.custom-select-button > span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotationBack 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.custom-select-button-focus > span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotation 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}

/* The animation key frame */
@keyframes rotation {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(180deg);
    }
}

@keyframes rotationBack {
    from {
        transform: rotate(180deg);
    }
    to {
        transform: rotate(0deg);
    }
}

.custom-select-button-focus:hover {
    cursor: pointer;
}
.custom-dropdown-base {
    border-radius: 8px;
    border: 1px;
    background: linear-gradient(0deg, #ffffff, #ffffff);
    border: 1px solid #9c7eec;
    box-shadow: 0px 4px 6px -2px #10182808;
    box-shadow: 0px 12px 16px -4px #10182814;
    position: absolute;
    z-index: 10;
    width: 100%;
    top: 42px;
}

.custom-dropdown-option {
    padding: 10px 14px 10px 14px;
    gap: 8px;
    color: #344054;
    border-radius: 8px;
}

.custom-dropdown-option:hover {
    cursor: pointer;
    background: var(--primary-color);
    color: white;
}
/* End of CSS style for Custom Select */

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
