<script>
export default {
    async mounted() {
        console.log('Component mounted');
        fetch('/resources/exa-source').then(async function (response) {
            console.log('fetched');
            const result = await response.json();
            console.log(result);
        });
    },
    methods: {}
};
</script>

<template>
    <div class="container-fluid h-100 p-0">HA HA HA</div>
</template>

<style></style>
