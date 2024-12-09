<script>
export default {
    data() {
        return {};
    },
    methods: {
        Submit() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            };
            var url = '';
            fetch(url, requestOptions)
                .then(() => {})
                .then(() => {
                    this.$router.go(-1);
                });
        }
    }
};
</script>

<template>
    <div class="container p-3 bg-light rounded">
        <h1 class="heading">Goal Progress</h1>

        <div class="container-fluid p-4"></div>
    </div>
</template>

<style></style>
