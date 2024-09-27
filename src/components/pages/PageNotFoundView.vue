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
    <div class="d-flex flex-column my-4 align-items-center">
        <h3 class="text-center text-xs">Sorry, this page does not exist!</h3>
        <router-link class="btn purple-btn my-3 back-btn" :to="{ name: 'hub' }"
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
