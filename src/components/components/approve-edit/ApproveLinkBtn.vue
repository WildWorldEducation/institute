<script>
export default {
    setup() {},
    data() {
        return {
            count: 0
        };
    },
    async created() {
        await this.getAwaitingApprovalCount();
    },
    methods: {
        async getAwaitingApprovalCount() {
            const res = await fetch('/waiting-approval/count');
            if (res.ok) {
                this.count = await res.json();
                console.log(count);
            } else {
                console.error('cant get count data');
            }
        }
    }
};
</script>

<template>
    <router-link
        class="btn green-btn position-relative"
        to="/content-edits"
        b-on-hover
        title="See awaiting approve list "
        >Edit Applications
        <span
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
        >
            {{ count }}
            <span class="visually-hidden">number of waiting-approval</span>
        </span>
    </router-link>
</template>

<style>
.page-title {
    color: #a48be7;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
}

.banner-image {
    max-width: 100%;
}

.icon-image {
    max-width: 50%;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    height: auto;
    align-items: center;
    justify-content: center;
    cursor: pointer !important;
}

.green-btn:hover {
    background-color: #3eb3a3;
    color: white;
}

/* Specific phone view css */
@media (max-width: 576px) {
    img {
        display: block;
        margin-left: auto;
        margin-right: auto;
    }

    .icon-image {
        max-width: 100%;
        height: auto;
        margin: auto;
    }
}
</style>
