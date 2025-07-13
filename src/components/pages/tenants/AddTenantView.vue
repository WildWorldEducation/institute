<script>
export default {
    data() {
        return {
            tenant: {
                name: ''
            }
        };
    },
    methods: {
        async Submit() {
            try {
                const response = await fetch('/tenants/add', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: this.tenant.name
                    })
                });
                const data = await response.json();

                if (data.tenant === 'name already taken') {
                    alert(data.tenant);
                    return;
                }

                alert('tenant created');
                this.$router.push({ name: 'tenants' });
            } catch (err) {
                console.error('Error creating tenant ', err);
            }
        }
    }
};
</script>

<template>
    <!-- Form -->
    <div class="container rounded bg-light p-3">
        <h1 class="heading">Add Tenant</h1>
        <div class="main-content-container container-fluid p-4">
            <div class="row">
                <div class="col-lg-4">
                    <div class="mb-3">
                        <h2 class="secondary-heading h4">Name</h2>
                        <input
                            v-model="tenant.name"
                            type="text"
                            class="form-control"
                        />
                    </div>
                    <div class="d-flex justify-content-end gap-4">
                        <router-link class="btn red-btn" to="/tenants">
                            Cancel
                        </router-link>
                        <button class="btn primary-btn" @click="Submit()">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
