<script>
import { useUsersStore } from '../../../stores/UsersStore';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const usersStore = useUsersStore();
        const usersDetailsStore = useUserDetailsStore();
        return {
            usersStore,
            usersDetailsStore
        };
    },
    data() {
        return {
            referrals: [],
            copySuccess: false,
            copyTimeoutId: null
        };
    },
    async created() {
        if (typeof this.usersDetailsStore.userId == 'undefined') {
            await this.usersDetailsStore.getUserDetails();
        }
        await this.getReferrals();
    },
    computed: {
        referralLink() {
            return `https://parrhesia.io/student-signup?ref=${this.usersDetailsStore.userName}`;
        }
    },
    methods: {
        async getReferrals() {
            fetch(`/referrals/${this.usersDetailsStore.userId}/list`)
                .then(function (response) {
                    return response.json();
                })
                .then(async (data) => {
                    await this.usersStore.getUsers();
                    this.referrals = data;
                    for (let i = 0; i < this.referrals.length; i++) {
                        for (let j = 0; j < this.usersStore.users.length; j++) {
                            // Get referred user
                            if (
                                this.referrals[i].referred_user_id ==
                                this.usersStore.users[j].id
                            ) {
                                this.referrals[i].referredUser =
                                    this.usersStore.users[j].username;
                            }
                            // Get referring user
                            if (
                                this.referrals[i].referrer_user_id ==
                                this.usersStore.users[j].id
                            ) {
                                this.referrals[i].referringUser =
                                    this.usersStore.users[j].username;
                            }
                        }
                    }
                    console.log(this.referrals);
                });
        },

        async copyReferralLink() {
            try {
                await this.copyToClipboard(this.referralLink);
            } catch (err) {
                console.error('Copy failed:', err);
            }
        },

        async copyToClipboard(text) {
            // Clear any existing timeout
            if (this.copyTimeoutId) {
                clearTimeout(this.copyTimeoutId);
            }

            let success = false;

            // Try modern clipboard API first
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(text);
                    success = true;
                } catch (err) {
                    console.warn('Clipboard API failed, using fallback');
                }
            }

            // Fallback: use the existing input field
            if (!success) {
                await this.$nextTick(); // Ensure DOM is updated
                const input = this.$refs.referralInput;
                if (input) {
                    input.focus();
                    input.select();
                    success = document.execCommand('copy');
                }
            }

            if (success) {
                this.showCopyFeedback();
            } else {
                throw new Error('Could not copy to clipboard');
            }
        },

        showCopyFeedback() {
            this.copySuccess = true;
            this.copyTimeoutId = setTimeout(() => {
                this.copySuccess = false;
                this.copyTimeoutId = null;
            }, 3000);
        }
    },

    beforeUnmount() {
        // Clean up timeout when component is destroyed
        if (this.copyTimeoutId) {
            clearTimeout(this.copyTimeoutId);
        }
    }
};
</script>

<template>
    <div class="container bg-light rounded">
        <div class="d-flex justify-content-between align-items-start mb-4">
            <h1 class="heading">Referrals</h1>

            <!-- Student Referral Link Section - Top Right -->
            <div
                v-if="usersDetailsStore.role == 'partner'"
                class="referral-link-section"
            >
                <h3 class="secondary-heading h5 mb-2">Student Referral Link</h3>
                <div class="d-flex align-items-center gap-2">
                    <div class="referral-link-container">
                        <input
                            ref="referralInput"
                            :value="referralLink"
                            type="text"
                            class="form-control referral-input"
                            readonly
                        />
                        <button
                            @click="copyReferralLink"
                            class="btn primary-btn copy-btn"
                            :class="{ 'btn-success': copySuccess }"
                        >
                            <svg
                                v-if="!copySuccess"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M20 9H11C9.89543 9 9 9.89543 9 11V20C9 21.1046 9.89543 22 11 22H20C21.1046 22 22 21.1046 22 20V11C22 9.89543 21.1046 9 20 9Z"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                                <path
                                    d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                            <svg
                                v-else
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M20 6L9 17L4 12"
                                    stroke="currentColor"
                                    stroke-width="2"
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                />
                            </svg>
                            {{ copySuccess ? 'Copied!' : 'Copy' }}
                        </button>
                    </div>
                </div>
                <transition name="fade">
                    <p
                        v-if="copySuccess"
                        class="copy-success-message mt-2 mb-0"
                    >
                        ✓ Referral link copied to clipboard!
                    </p>
                </transition>
            </div>
        </div>

        <!-- Existing Referrals List -->
        <div class="referrals-list">
            <h3 class="secondary-heading h5 mb-3">Your Referrals</h3>
            <ul v-if="referrals.length > 0" class="list-unstyled">
                <li
                    v-for="referral in referrals"
                    :key="referral.id"
                    class="mb-2"
                >
                    <div class="referral-item p-3 border rounded">
                        <router-link
                            :to="
                                '/referrals/' +
                                referral.referrer_user_id +
                                '/' +
                                referral.referred_user_id
                            "
                            class="text-decoration-none"
                        >
                            <strong>{{ referral.referredUser }}</strong>
                        </router-link>
                    </div>
                </li>
            </ul>
            <p v-else class="text-muted">
                No referrals yet. Share your referral link to start earning!
            </p>
        </div>
    </div>
</template>

<style scoped>
.referral-link-section {
    max-width: 400px;
    min-width: 300px;
}

.referral-link-container {
    display: flex;
    gap: 8px;
}

.referral-input {
    font-size: 0.875rem;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #f8f9fa;
    color: #495057;
    min-width: 250px;
}

.copy-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    font-size: 0.875rem;
    border-radius: 4px;
    white-space: nowrap;
    transition: all 0.2s ease;
}

.copy-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.copy-btn.btn-success {
    background-color: #28a745 !important;
    border-color: #28a745 !important;
}

.copy-success-message {
    font-size: 0.875rem;
    color: #28a745;
    font-weight: 500;
}

.referral-item {
    background-color: white;
    transition: all 0.2s ease;
}

.referral-item:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
}

.referrals-list {
    clear: both;
}

/* Responsive design */
@media (max-width: 768px) {
    .d-flex.justify-content-between {
        flex-direction: column;
        align-items: stretch !important;
    }

    .referral-link-section {
        max-width: 100%;
        min-width: auto;
        margin-top: 1rem;
        margin-bottom: 1rem;
    }

    .referral-link-container {
        flex-direction: column;
    }

    .referral-input {
        min-width: auto;
        margin-bottom: 8px;
    }

    .copy-btn {
        align-self: flex-start;
    }
}

/* Fade transition for success message */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
