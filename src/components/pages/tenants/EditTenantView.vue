<script>
import { useTenantStore } from '../../../stores/TenantStore';

export default {
    setup() {
        const tenantStore = useTenantStore();
        return { tenantStore };
    },
    data() {
        return {
            tenantId: this.$route.params.tenantId,
            tenant: {}
        };
    },

    async mounted() {
        this.getTenant();
    },
    methods: {
        getTenant() {
            fetch('/tenants/show/' + this.tenantId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.tenant = data;
                });
        },
        async ValidateForm() {
            if (this.tenant.name != '') {
                await this.tenantStore.editTenant(this.tenantId, this.tenant);
            }
            this.$router.push('/tenants');
        }
    }
};
</script>

<template>
    <div class="container p-1">
        <router-link class="btn red-btn mb-1" to="/tenants">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                height="20"
                width="20"
                fill="white"
            >
                <path
                    d="M134.1 296H436c6.6 0 12-5.4 12-12v-56c0-6.6-5.4-12-12-12H134.1v-46.1c0-21.4-25.9-32.1-41-17L7 239c-9.4 9.4-9.4 24.6 0 33.9l86.1 86.1c15.1 15.1 41 4.4 41-17V296z"
                />
            </svg>
            &nbsp;Back to tenants
        </router-link>
        <div class="row">
            <!-- Tenant details -->
            <div class="col-12 col-md-6 mb-2">
                <div class="mb-3">
                    <h2 class="secondary-heading h4">Name</h2>
                    <input
                        v-model="tenant.name"
                        type="text"
                        class="form-control"
                    />
                </div>

                <div class="">
                    <button class="btn primary-btn" @click="ValidateForm()">
                        Update tenant details
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
