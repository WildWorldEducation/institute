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
                    this.payments = data;
                    console.log(data);
                });
        },
        toggleIsCompensated(paymentId, isPaid) {
            console.log(paymentId);
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
                        <input
                            type="radio"
                            id="one"
                            value="0"
                            v-model="payment.is_partner_compensated"
                            @click="toggleIsCompensated(payment.id, false)"
                        />
                        <label class="me-4 ms-2" for="one">Not paid</label>

                        <input
                            type="radio"
                            id="two"
                            value="1"
                            @click="toggleIsCompensated(payment.id, true)"
                            v-model="payment.is_partner_compensated"
                        />
                        <label class="ms-2" for="two">Paid</label>
                    </li>
                </ul>
            </li>
        </ul>
    </div>
</template>

<style scoped></style>
