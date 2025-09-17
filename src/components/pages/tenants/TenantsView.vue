<script>
import TenantList from '../../components/tenants/TenantsList.vue';
import TenantDetails from '../../components/tenants/TenantDetails.vue';

export default {
    setup() {
        return {};
    },
    data() {
        return {
            selectedTenant: {
                name: null,
                id: null
            },
            newTenant: {
                name: null
            },
            tenants: [],
            // Flag to show user details when in phone view
            showDetails: false,
            currentTenantId: ''
        };
    },
    components: { TenantList, TenantDetails },
    async created() {
        this.getTenants();
    },
    methods: {
        async getTenants() {
            const result = await fetch('/tenants/list');
            const data = await result.json();
            this.tenants = data; 
            this.selectedTenant = this.tenants[0]           
        },
        // Updated method to handle both initial setup and user selections
        async updateTenantDetails(selectedTenant) {
            if (!selectedUser) return;

            // Update local state
            this.selectedTenant.id = selectedTenant.id;
            this.selectedTenant.name = selectedTenant.first_name;
        }
    }
};
</script>

<template>
    <div class="container-fluid">
        <div class="row position-relative">
            <div class="col-lg-4 col-md-5">
                <TenantList ref="tenantsListRef" />
            </div>
            <!-- Tenant detail view for PC and Tablet View -->
            <div class="col-lg-8 col-md-7 d-none d-md-block">
                <div class="row user-form-data-row">
                    <TenantDetails
                        v-if="tenants.length > 0"
                        :tenantId="selectedTenant.id"
                    />
                    <div v-else>
                        <h1 class="text-muted py-5">
                            There are no tenants yet.
                        </h1>
                    </div>
                </div>
            </div>
            <!-- User detail view specific for phone -->
            <div
                v-if="showDetails"
                class="col-md-7 d-block d-md-none"
                id="user-detail-section"
            >
                <div class="row">
                    <TenantDetails :tenantId="selectedTenant.id" />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Mobile */
@media (max-width: 480px) {
    #user-detail-section {
        position: fixed;
        top: 0px;
        left: 50%;
        transform: translate(-50%, 0);
        width: 95%;
        height: 95%;
    }
}

/* Tablets */
@media (min-width: 481px) and (max-width: 1024px) {
    .user-form-data-row {
        margin-right: 0px;
    }
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
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    /* Modal Content/Box */
    .modal-content {
        width: 90%;
        margin-top: 30%;
    }
}
</style>
