<script>
import LoadingSpinner from '../components/share-components/LoadingSpinner.vue';
export default {
    data() {
        return {
            countWords: null,
            resultSkills: [],
            userInput: '',
            waitForSever: false
        };
    },
    async created() {},
    methods: {
        async aiFindSkill(inputText) {
            this.waitForSever = true;
            const url = `/skills//find-with-context`;
            const requestOption = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: inputText
                })
            };
            const res = await fetch(url, requestOption);
            const results = await res.json();
            this.resultSkills = results;
            this.waitForSever = false;
        }
    },
    components: { LoadingSpinner }
};
</script>

<template>
    <div class="container">
        <div class="mx-auto mt-5 w-100 d-flex">
            <input type="text" v-model="userInput" />
            <button @click="aiFindSkill(userInput)">Search</button>
        </div>
        <div v-if="waitForSever">
            <LoadingSpinner />
        </div>
        <div v-for="skill in resultSkills">
            <div class="py-2 px-1">
                {{ skill.skill_name }}
            </div>
        </div>
    </div>
</template>

<style></style>
