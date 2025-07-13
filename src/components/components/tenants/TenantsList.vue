<script>
export default {
    setup() {
        return {};
    },
    data() {
        return {
            // Local tracking of which item is selected to ensure accurate UI rendering
            selectedItemId: null
        };
    },
    created() {
        // Initialize from the store
        //this.selectedItemId = this.usersStore.selectedUserId;
    },
    methods: {
        selectTenant(tenant) {
            // Set local value first for immediate UI response
            this.selectedItemId = tenant.id;
        }
    }
};
</script>

<template>
    <div class="container mt-1">
        <div v-for="tenant in $parent.tenants" :key="tenant.id">
            <div class="d-flex bg-light rounded p-2">
                <img
                    class="user-avatars"
                    v-if="user.avatar != null"
                    :src="user.avatar"
                />
                <button
                    :class="
                        user.id === selectedItemId
                            ? 'isSelected'
                            : 'user-buttons'
                    "
                    @click="selectUser(user)"
                >
                    {{ user.username }}
                </button>
            </div>
            <hr class="border border-1 opacity-0 w-75 d-none d-md-block" />
            <hr class="border border-1 opacity-0 w-100 d-block d-md-none" />
        </div>

        <!-- Add Tenant Link -->
        <RouterLink
            to="/users/add-student"
            class="d-block mb-4 btn primary-btn"
        >
            Add tenant
        </RouterLink>
    </div>
</template>

<style scoped>
.user-buttons {
    font-family: 'Poppins', sans-serif;
    width: 283px;
    height: 80px;
    border-radius: 8px;
    border: 1px solid var(--primary-color);
    background-color: #c8d7da;
    color: black;
    overflow: hidden;
    padding: 16px, 28px, 16px, 28px;
    font-size: 1.25rem;
    font-weight: 400;
}

.user-buttons:hover {
    background-color: var(--primary-color);
    color: var(--primary-contrast-color);
}

/* The style when the user button is currently choose to show information */
.isSelected {
    font-family: 'Poppins', sans-serif;
    width: 283px;
    height: 80px;
    border-radius: 8px;
    border: 1px solid var(--primary-color);
    background-color: var(--primary-color);
    overflow: hidden;
    color: white;
    padding: 16px, 28px, 16px, 28px;
    font-size: 1.25rem;
    font-weight: 400;
}
</style>
