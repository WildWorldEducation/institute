<script>
// import { useUsersStore } from '../../../stores/UsersStore';
// import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        // const usersStore = useUsersStore();
        // const usersDetailsStore = useUserDetailsStore();
        // return {
        //     usersStore,
        //     usersDetailsStore
        // };
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            payments: []
        };
    },
    async created() {
        // if (typeof this.usersDetailsStore.userId == 'undefined') {
        //     await this.usersDetailsStore.getUserDetails();
        // }
        this.getPayments();
    },
    methods: {
        getPayments() {
            fetch(`/referrals/get-receipts/${this.studentId}`)
                .then(function (response) {
                    return response.json();
                })
                .then(async (data) => {
                    console.log(data);
                    this.payments = data;

                    // await this.usersStore.getUsers();
                    // this.referrals = data;
                    // for (let i = 0; i < this.referrals.length; i++) {
                    //     for (let j = 0; j < this.usersStore.users.length; j++) {
                    //         // Get referred user
                    //         if (
                    //             this.referrals[i].referred_user_id ==
                    //             this.usersStore.users[j].id
                    //         ) {
                    //             this.referrals[i].referredUser =
                    //                 this.usersStore.users[j].username;
                    //         }
                    //         // Get referring user
                    //         if (
                    //             this.referrals[i].referrer_user_id ==
                    //             this.usersStore.users[j].id
                    //         ) {
                    //             this.referrals[i].referringUser =
                    //                 this.usersStore.users[j].username;
                    //         }
                    //     }
                    // }
                });
        },
        formattedStripeReceiptAmount(amount) {
            const formattedAmount = (amount / 100).toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD'
            });
            return formattedAmount;
        },
        formattedStripeReceiptDate(date) {
            let dateObj = new Date(date);
            const month = dateObj.getUTCMonth() + 1; // months from 1-12
            const day = dateObj.getUTCDate();
            const year = dateObj.getUTCFullYear();
            const formattedDate = year + '/' + month + '/' + day;
            return formattedDate;
        }
    }
};
</script>

<template>
    <div class="container bg-light rounded">
        <h1 class="heading">Student Payments</h1>
        <ul>
            <li v-for="payment in payments">
                <h2 class="h6">
                    {{ formattedStripeReceiptDate(payment.date) }}
                </h2>
                <ul>
                    <li>
                        <strong>total:</strong>
                        {{ formattedStripeReceiptAmount(payment.amount) }}
                    </li>
                    <li>
                        <strong>amount owed to partner:</strong>
                        {{ formattedStripeReceiptAmount(payment.amount / 3) }}
                    </li>
                    <li>
                        <!-- Custom Toggle Switch -->
                        <div class="toggle-switch-container me-3">
                            <label class="toggle-switch">
                                <input
                                    type="checkbox"
                                    @change="
                                        tenantStore.toggleBillingMode(
                                            this.userDetailsStore.tenantId,
                                            billingMode
                                        )
                                    "
                                    class="toggle-input"
                                />
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</template>

<style scoped>
/* Custom toggle switch styling */
.toggle-switch-container {
    display: inline-block;
}

.toggle-switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
    margin: 0;
}

.toggle-switch .toggle-input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: black;
    transition: 0.4s;
    border-radius: 34px;
}

.toggle-slider:before {
    position: absolute;
    content: '';
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
}

.toggle-input:checked + .toggle-slider {
    background-color: green; /* Default theme color */
}

.toggle-input:checked + .toggle-slider:before {
    transform: translateX(30px);
}

/* Theme-specific toggle colors */
.instructor-theme .toggle-input:checked + .toggle-slider {
    background-color: green; /* Instructor theme color */
}

.editor-theme .toggle-input:checked + .toggle-slider {
    background-color: green; /* Editor theme color */
}
.editor-theme .setting-label {
    color: white;
}
</style>
