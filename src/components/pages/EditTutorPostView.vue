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
        async getTutorPost() {
            await fetch('/tutor-posts/show/' + this.tutorPostId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => (this.tutorPost = data));

                $('#summernote').summernote(
                    {
                        maximumImageFileSize: 2048 * 1024, // 2 MB
                        callbacks: {
                            onImageUploadError: function (msg) {
                                alert("Max image size is 2MB.")
                            }
                        }
                    }
                ).summernote('code', this.tutorPost.description);
        },
        Submit() {
            var resourceData = $('#summernote').summernote("code");
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: resourceData
                })
            };

            var url = '/tutor-posts/edit/' + this.tutorPostId;
            fetch(url, requestOptions).then(() => {
                // Delete flag if exist
                let dismissFlagId = this.$route.query.dismissFlagId;
                if(dismissFlagId){
                    fetch('/content-flags/' + dismissFlagId, {
                        method: 'DELETE'
                    }).finally(()=>{
                        this.$router.back();
                    });
                }else{
                    this.$router.back();
                }
            });
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <h2>Edit Tutor Post</h2>
        <div class="row">
            <div class="mb-3">
                <textarea id="summernote" name="editordata"></textarea>
            </div>
            <div class="mb-3 d-flex justify-content-end gap-4">
                <a class="btn red-btn" @click="$router.go(-1)"> Cancel </a>
                <button @click="Submit()" class="btn purple-btn">Submit</button>
            </div>
        </div>
    </div>
</template>

<style>
h2 {
    color: #a48be6;
    font-size: 30px;
    font-weight: 700;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.red-btn:hover {
    background-color: #cc3535;
    color: white;
}

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
