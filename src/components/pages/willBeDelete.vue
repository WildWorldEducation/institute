<script>
import LoadingSpinner from '../components/share-components/LoadingSpinner.vue';
export default {
    data() {
        return {
            countWords: null
        };
    },
    async created() {
        const url = `/skills//find-with-context`;
        const requestOption = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: 'Meteor Shower'
            })
        };
        const res = await fetch(url, requestOption);
        const results = await res.json();
        console.log(results);
        this.countWords = results;
    },
    components: { LoadingSpinner }
};
</script>

<template>
    <div v-if="countWords">
        {{ JSON.stringify(countWords) }}
    </div>
    <div v-else>
        <LoadingSpinner />
    </div>
</template>

<style></style>
