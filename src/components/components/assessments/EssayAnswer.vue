<script>
export default {
    data() {
        return {
            skillId: this.$route.params.id,
            essayAnswer: ''
        };
    },
    setup() {},
    methods: {
        //methods will be called on parent component to manipulate text
        getAnswer() {
            return this.essayAnswer;
        },
        clearAnswer() {
            this.essayAnswer = '';
        },
        setAnswer(text) {
            this.essayAnswer = text;
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <div class="row">
            <div class="mb-3">
                <textarea
                    v-model="essayAnswer"
                    class="form-control"
                    id="exampleFormControlTextarea1"
                    rows="3"
                ></textarea>
            </div>
        </div>
    </div>
</template>

<style></style>
