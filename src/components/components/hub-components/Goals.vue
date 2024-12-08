<script>
export default {
    data() {
        return {};
    },
    props: ['userId'],
    async created() {},
    computed: {},
    methods: {}
};
</script>

<template>
    <h2 class="secondary-heading h4">Goals</h2>
    <router-link class="btn primary-btn" to="/goals/add">Add goal</router-link>
</template>

<style scoped>
/* Scrollbar */
::-webkit-scrollbar {
    width: 12px;
}

::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
}
</style>
