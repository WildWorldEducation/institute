<script>
// Import
import router from '../../router';

// Import the store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
    data() {
        return {
            skillId: this.$route.params.id
        };
    },
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    mounted: function () {
        //  summernote config
        $('#summernote').summernote({
            placeholder: '',
            tabsize: 2,
            height: 120,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video']],
                ['view', ['fullscreen', 'codeview', 'help']]
            ],
            maximumImageFileSize: 2048 * 1024, // 2 MB
            callbacks: {
                onImageUploadError: function (msg) {
                    alert('Max image size is 2MB.');
                }
            }
        });
    },
    methods: {
        Submit() {
            var url = '/resources/add/' + this.skillId;
            var resourceData = $('#summernote').summernote('code');

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userDetailsStore.userId,
                    editordata: resourceData
                })
            };
            fetch(url, requestOptions)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    console.log(data);
                })
                .then(() => {
                    this.$router.push('/skills/' + this.skillId);
                });
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <h1>Add Learning Resource</h1>
        <div class="row">
            <div class="mb-3">
                <textarea id="summernote" name="editordata"></textarea>
            </div>
            <button class="btn btn-dark" @click="Submit()">Submit</button>
        </div>
    </div>
</template>

<style scoped></style>
