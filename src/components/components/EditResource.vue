<script>
import router from "../../router";

export default {
    setup() {

    },
    data() {
        return {
            resourceId: this.$route.params.id,
        };
    },
    async created() {
        // Get the existing post.
        const response = await fetch('/resources/show/' + this.resourceId);
        const data = await response.json();
        // Only allow images up to 2MB.
        $('#summernote').summernote(
            {
                maximumImageFileSize: 2048 * 1024, // 2 MB
                callbacks: {
                    onImageUploadError: function (msg) {
                        alert("Max image size is 2MB.")
                    }
                }
            }
        ).summernote('code', data.content);
    },
    methods: {
        Submit() {
            var url = "/resources/edit/" + this.resourceId;
            var resourceData = $('#summernote').summernote("code");

            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ editordata: resourceData })
            };
            fetch(url, requestOptions)
                .then(() => {
                    this.$router.go(-1);
                });
        }
    }
}
</script> 

<template>
    <div class="container mt-3">
        <h1>Edit Learning Resource </h1>
        <div class="row">
            <div class="mb-3">
                <textarea id="summernote" name="editordata"></textarea>
            </div>
            <button class="btn btn-dark" @click="Submit()">Submit</button>
        </div>
    </div>
</template>


<style scoped></style> 