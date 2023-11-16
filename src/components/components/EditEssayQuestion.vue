<script>
import router from "../../router";

export default {
    data() {
        return {
            questionId: this.$route.params.id,
            question: {}
        };
    },
    created() {
        this.getQuestion()
    },
    methods: {
        getQuestion() {
            fetch('/questions/essay/show/' + this.questionId)
                .then(function (response) {
                    return response.json();
                }).then(data => this.question = data)
        },
        Submit() {
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        name: this.question.name,
                        question: this.question.question,
                    })
            };

            var url = '/questions/essay/' + this.questionId + '/edit';
            fetch(url, requestOptions)
                .then(() => {
                    this.$router.back()
                });
        },
    }
}
</script> 

<template>
    <div class="container mt-3">
        <h1>Edit Question</h1>
        <div class="mb-3">
            <label class="form-label">Name</label>
            <input v-model="question.name" type="text" class="form-control">
        </div>
        <div class="mb-3">
            <label class="form-label">Question</label>
            <input v-model="question.question" type="text" class="form-control">
        </div>
        <div class="mb-3">
            <button @click="Submit()" class="btn btn-dark">Submit</button>
        </div>
    </div>
</template>


<style scoped></style> 