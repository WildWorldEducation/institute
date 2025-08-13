<script>
import { useSettingsStore } from '../../../stores/SettingsStore.js';
import { useTenantStore } from '../../../stores/TenantStore.js';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';

export default {
    setup() {
        const settingsStore = useSettingsStore();
        const tenantStore = useTenantStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            settingsStore,
            tenantStore,
            userDetailsStore
        };
    },
    data() {
        return {
            monthlyTokenUsage: null,
            year: 0,
            month: '',
            isAITokenLimitReached: false,
            isMobileCheck: window.innerWidth,
            // For downloading invoices from Stripe
            receipts: [],
            showTokensDropDown: false,
            products: [
                {
                    name: '1,000,000 tokens for $50',
                    tokens: 1000000
                },
                {
                    name: '2,000,000 tokens for $100',
                    tokens: 2000000
                },
                {
                    name: '5,000,000 tokens for $250',
                    tokens: 5000000
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
        await this.tenantStore.getTenantDetails(this.userDetailsStore.tenantId);
        await this.tenantStore.getTenantMonthlyTokenUsage(this.userDetailsStore.tenantId);
    },
    async mounted() {
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
        formattedMonthlyTokenUsage() {
            return this.tenantStore.monthlyTokenUsage
                ? this.tenantStore.monthlyTokenUsage.toLocaleString()
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
    }
};
</script>

<template>
    <div class="container">
        <div class="row">
            <div class="col-md">
                <!-- Token usage stats -->
                <span class="d-flex justify-content-between">
                    <h1 class="secondary-heading h3 mb-4" :class="{ 'text-center': isMobileCheck < 576 }">
                        <strong>Monthly AI usage:</strong> {{ month }}
                        {{ year }}
                    </h1>
                    <!-- Info button -->
                    <button class="btn info-btn" @click="openTooltip">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512" width="20" height="20"
                            class="primary-icon">
                            <!-- !Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z" />
                        </svg>
                    </button>
                </span>
                <ul>
                    <li>
                        <p>
                            <strong>Free limit per student:</strong>
                            {{
                                settingsStore.freeTokenMonthlyLimit.toLocaleString()
                            }}
                        </p>
                    </li>
                    <li>
                        <p>
                            <strong>Total token usage:</strong>
                            {{ formattedMonthlyTokenUsage }}
                        </p>
                    </li>
                    <li>
                        <p>
                            <strong>Current tokens:</strong>
                            {{ tenantStore.tokens }}
                        </p>
                    </li>
                </ul>
                <div v-if="isAITokenLimitReached" class="alert alert-warning" :class="{ 'mb-0': isMobileCheck >= 576 }"
                    role="alert">
                    You are over the monthly free limit. You can't use the AI
                    features until next month.
                </div>
            </div>
        </div>
        <hr />
        <!-- Buy tokens -->
        <div class="row">
            <div class="col col-md-8 col-lg-5 mt-2">
                <!-- Custom Dropdown -->
                <h2 class="secondary-heading h4">Buy Tokens</h2>
                <div class="d-flex flex-column position-relative">
                    <div id="token-dropdown" :class="[
                        showTokensDropDown
                            ? 'custom-select-button-focus'
                            : 'custom-select-button'
                    ]" @click="
                        showTokensDropDown = !showTokensDropDown;
                    closeOnDropdownOnClickAnywhere();
                    ">
                        {{ chosenProduct.name }}
                        <!-- Down arrow -->
                        <span>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M14.2929 8.70711C14.9229 8.07714 14.4767 7 13.5858 7H6.41421C5.52331 7 5.07714 8.07714 5.70711 8.70711L9.29289 12.2929C9.68342 12.6834 10.3166 12.6834 10.7071 12.2929L14.2929 8.70711Z"
                                    fill="#344054" />
                            </svg>
                        </span>
                    </div>
                    <div v-if="showTokensDropDown" class="custom-dropdown-base">
                        <div v-for="product in products" class="custom-dropdown-option" @click="
                            chosenProduct = product;
                        showTokensDropDown = false;
                        ">
                            {{ product.name }}
                        </div>
                    </div>
                </div>
                <!-- End of custom dropdown -->
            </div>
        </div>
        <button @click="checkout(chosenProduct.tokens)" class="btn buy-btn mt-2 mb-2">
            buy
        </button>

        <hr />
        <div :class="{
            'text-center': isMobileCheck < 576
        }">
            <h2 class="secondary-heading h4">Receipts</h2>
            <div v-for="receipt in receipts">
                <a :href="receipt.url" target="_blank">
                    {{ formattedStripeReceiptAmount(receipt) }}
                    {{ formattedStripeReceiptDate(receipt) }}</a>
            </div>
            <p v-if="isMobileCheck < 576">&nbsp;</p>
        </div>
    </div>
</template>

<style scoped>
.buy-btn {
    background-color: darkgreen;
    color: white;
}

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

.custom-select-button>span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotationBack 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.custom-select-button-focus>span {
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
    height: 40px;
}
</style>
