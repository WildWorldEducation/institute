<script>
export default {
    setup() {},
    data() {
        return {
            studentId: this.$route.params.studentId,
            payments: []
        };
    },
    async created() {
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
                });
        },
        async toggleIsCompensated(paymentId, isPaid) {
            try {
                const reqOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        is_partner_compensated: isPaid
                    })
                };
                await fetch(`/referrals/${paymentId}/update`, reqOptions);
            } catch (error) {
                console.error('Error updating instructor:', error);
            }
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
        <ul v-if="payments.length > 0">
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
                        <strong>commission:</strong>
                        {{ formattedStripeReceiptAmount(payment.amount / 3) }}
                    </li>
                    <li>
                        <input
                            type="radio"
                            id="one"
                            value="0"
                            v-model="payment.is_partner_compensated"
                            @click="toggleIsCompensated(payment.id, 0)"
                        />
                        <label class="me-4 ms-2" for="one">Not paid</label>

                        <input
                            type="radio"
                            id="two"
                            value="1"
                            @click="toggleIsCompensated(payment.id, 1)"
                            v-model="payment.is_partner_compensated"
                        />
                        <label class="ms-2" for="two">Paid</label>
                    </li>
                </ul>
            </li>
        </ul>
        <p v-else>No payments found.</p>
    </div>
</template>

<style scoped></style>
