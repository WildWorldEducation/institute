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
            referredUserId: this.$route.params.referredUserId,
            receipts: [],
            student: null,
            loading: true
        };
    },
    async created() {
        await this.getStudentInfo();
        await this.getReferral();
    },
    methods: {
        async getStudentInfo() {
            try {
                await this.usersStore.getUsers();

                // Find the referred student by ID
                this.student = this.usersStore.users.find(
                    (user) => user.id == this.referredUserId
                );

                if (!this.student) {
                    console.error('Student not found');
                }
            } catch (error) {
                console.error('Error fetching student info:', error);
            }
        },
        async getReferral() {
            fetch(`/referrals/get-receipts/${this.referredUserId}`)
                .then(function (response) {
                    return response.json();
                })
                .then(async (data) => {
                    this.receipts = data;
                    console.log(this.receipts);
                    this.loading = false;
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
        },

        getTotalPayments() {
            return this.receipts
                .filter(
                    (receipt) =>
                        receipt.status === 'completed' || !receipt.status
                )
                .reduce(
                    (total, receipt) => total + parseFloat(receipt.amount || 0),
                    0
                );
        },

        goBack() {
            this.$router.push('/referrals');
        }
    }
};
</script>

<template>
    <div class="container bg-light rounded">
        <!-- Top row -->
        <div class="d-flex justify-content-between flex-wrap">
            <!-- Student name as page heading -->
            <h1 class="heading" v-if="student">
                {{ student.username }}
            </h1>
            <h1 class="heading" v-else>Student ID: {{ referredUserId }}</h1>
            <button
                @click="goBack"
                class="btn btn-outline-secondary primary-btn"
            >
                ← Back
            </button>
        </div>

        <!-- Loading state -->
        <div v-if="loading" class="text-center py-4">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <!-- Student info summary -->
        <div v-if="!loading && student" class="row mb-4">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <p class="card-text">
                            <strong>Total Payments:</strong>
                            {{ formattedStripeReceiptAmount(getTotalPayments())
                            }}<br />
                            <strong>Number of Transactions:</strong>
                            {{ receipts.length }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Payments list -->
        <div v-if="!loading">
            <div v-if="receipts.length === 0" class="alert alert-info">
                No payments found for this student.
            </div>

            <div v-else class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Commission</th>
                            <th>Transaction ID</th>
                            <th>Compensation Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="receipt in receipts" :key="receipt.id">
                            <td>
                                {{ formattedStripeReceiptDate(receipt.date) }}
                            </td>
                            <td class="fw-bold">
                                {{
                                    formattedStripeReceiptAmount(receipt.amount)
                                }}
                            </td>
                            <td class="fw-bold">
                                {{
                                    formattedStripeReceiptAmount(
                                        receipt.amount / 3
                                    )
                                }}
                            </td>
                            <td class="font-monospace small">
                                <a :href="receipt.url" target="_blank">View</a>
                            </td>
                            <td>
                                <span
                                    v-if="receipt.is_partner_compensated == 1"
                                    class="badge badge-success"
                                    >Paid</span
                                >
                                <span v-else class="badge badge-warning"
                                    >Pending</span
                                >
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
.heading {
    color: #333;
    margin-bottom: 1.5rem;
}

.badge-success {
    background-color: #28a745;
}

.badge-warning {
    background-color: #ffc107;
    color: #212529;
}

.badge-danger {
    background-color: #dc3545;
}

.badge-secondary {
    background-color: #6c757d;
}

.table th {
    border-top: none;
}

.font-monospace {
    font-family: 'Courier New', monospace;
}

.card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.table-responsive {
    border-radius: 0.375rem;
    overflow: hidden;
}

.table-hover tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.075);
}
</style>
