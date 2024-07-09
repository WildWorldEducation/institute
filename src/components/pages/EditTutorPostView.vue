<script>
export default {
    data() {
        return {
            tutorPostId: this.$route.params.tutorPostId,
            tutorPost: {}
        };
    },
    created() {
        this.getTutorPost();
    },
    methods: {
        getTutorPost() {
            fetch('/tutors/show/' + this.tutorPostId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => (this.tutorPost = data));
        },
        Submit() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.question.name,
                    question: this.question.question
                })
            };

            var url = '/questions/essay/' + this.questionId + '/edit';
            fetch(url, requestOptions).then(() => {
                this.$router.back();
            });
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <h1>Edit Tutor Post</h1>
        <div class="row">
            <div class="mb-3">
                <textarea
                    v-model="tutorPost.description"
                    rows="3"
                    class="form-control"
                >
                </textarea>
            </div>
            <div class="mb-3 d-flex justify-content-end">
                <button @click="Submit()" class="btn purple-btn">Submit</button>
            </div>
        </div>
    </div>
</template>

<style>
.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.purple-btn:hover {
    background-color: #7f56d9;
    color: white;
}

.purple-btn:focus {
    background-color: #7f56d9;
    color: white;
}
</style>
