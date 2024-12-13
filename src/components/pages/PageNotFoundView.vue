<script>
export default {
    setup() {},
    data() {
        return {};
    },
    components: {},
    computed: {},
    methods: {}
};
</script>

<template>
    <div
        class="d-flex flex-column my-4 align-items-center bg-light rounded p-3"
    >
        <h1 class="text-center heading">Sorry, this page does not exist!</h1>
        <router-link class="btn primary-btn my-3 back-btn" :to="{ name: 'hub' }"
            >Back to Hub</router-link
        >
    </div>
</template>

<style scoped>
.back-btn {
    width: 200px;
    display: inline-flex;
    justify-content: center;
}
</style>
