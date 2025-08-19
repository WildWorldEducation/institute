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
            partnerId: this.$route.params.partnerId,
            referredUserId: this.$route.params.referredUserId,
            receipts: [],
            student: null,
            loading: true
        };
    },
    async created() {
        console.log(this.$route.params.partnerId);
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

        getReferral() {
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

        formatCurrency(amount) {
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD'
            }).format(amount);
        },

        formatDate(dateString) {
            const options = {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };
            return new Date(dateString).toLocaleDateString('en-US', options);
        },

        getStatusClass(status) {
            const statusClasses = {
                completed: 'badge-success',
                pending: 'badge-warning',
                failed: 'badge-danger',
                refunded: 'badge-secondary'
            };
            return statusClasses[status] || 'badge-secondary';
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
        <!-- Back button -->
        <div class="mb-3">
            <button @click="goBack" class="btn btn-outline-secondary">
                ← Back to Referrals
            </button>
        </div>

        <!-- Student name as page heading -->
        <h1 class="heading" v-if="student">
            {{ student.username }}
        </h1>
        <h1 class="heading" v-else>Student ID: {{ referredUserId }}</h1>

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
                        <h5 class="card-title">Student Summary</h5>
                        <p class="card-text">
                            <strong>Username:</strong> {{ student.username
                            }}<br />
                            <strong>Email:</strong> {{ student.email || 'N/A'
                            }}<br />
                            <strong>Total Payments:</strong>
                            {{ formatCurrency(getTotalPayments()) }}<br />
                            <strong>Number of Transactions:</strong>
                            {{ receipts.length }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Payments list -->
        <div v-if="!loading">
            <h3>Payment History</h3>

            <div v-if="receipts.length === 0" class="alert alert-info">
                No payments found for this student.
            </div>

            <div v-else class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-dark">
                        <tr>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Payment Method</th>
                            <th>Transaction ID</th>
                            <th v-if="receipts.some((r) => r.status)">
                                Status
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="receipt in receipts" :key="receipt.id">
                            <td>
                                {{
                                    formatDate(
                                        receipt.created_at ||
                                            receipt.payment_date
                                    )
                                }}
                            </td>
                            <td>
                                {{
                                    receipt.description ||
                                    receipt.course_name ||
                                    'Payment'
                                }}
                            </td>
                            <td class="fw-bold">
                                {{ formatCurrency(receipt.amount) }}
                            </td>
                            <td>{{ receipt.payment_method || 'N/A' }}</td>
                            <td class="font-monospace small">
                                {{ receipt.transaction_id || receipt.id }}
                            </td>
                            <td v-if="receipts.some((r) => r.status)">
                                <span
                                    v-if="receipt.status"
                                    class="badge"
                                    :class="getStatusClass(receipt.status)"
                                >
                                    {{
                                        receipt.status.charAt(0).toUpperCase() +
                                        receipt.status.slice(1)
                                    }}
                                </span>
                                <span v-else class="badge badge-success"
                                    >Completed</span
                                >
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Payment summary -->
            <div v-if="receipts.length > 0" class="row mt-4">
                <div class="col-md-6 offset-md-6">
                    <div class="card">
                        <div class="card-body">
                            <h6 class="card-title">Payment Summary</h6>
                            <div class="d-flex justify-content-between">
                                <span>Total Payments:</span>
                                <strong>{{
                                    formatCurrency(getTotalPayments())
                                }}</strong>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Total Transactions:</span>
                                <strong>{{ receipts.length }}</strong>
                            </div>
                        </div>
                    </div>
                </div>
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
