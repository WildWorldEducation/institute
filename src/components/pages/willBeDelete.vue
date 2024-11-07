<script>
export default {
    data() {
        return {
            countWords: null
        };
    },
    async created() {
        const url = `/skills/find-with-context`;
        const requestOption = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: 'Verb'
            })
        };
        const res = await fetch(url, requestOption);
        const results = await res.json();
        console.log(results);
        this.countWords = results;
    }
};
</script>

<template>
    {{ JSON.stringify(countWords) }}
</template>

<style></style>
