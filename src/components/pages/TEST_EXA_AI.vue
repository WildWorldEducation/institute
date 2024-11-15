<script>
export default {
    data() {
        return {
            searchText: ''
        };
    },
    async mounted() {
        console.log('Component mounted');
        const res = await fetch('/resources/exa-source');
        console.log(res);
        const result = await res.json();
        this.searchText = result;
    },
    methods: {}
};
</script>

<template>
    <div class="container-fluid h-100 p-auto">
        {{ JSON.stringify(searchText) }}
    </div>
</template>

<style></style>
