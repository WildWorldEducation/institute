<script>
export default {
    setup() {},
    data() {
        return {
            resourceId: this.$route.params.id,
            // To check if content has changed, to unlock submit button.
            newContent: '',
            originalContent: ''
        };
    },
    async created() {
        // Get the existing post.
        const response = await fetch('/resources/show/' + this.resourceId);
        const data = await response.json();
        // Only allow images up to 2MB.
        $('#summernote')
            .summernote({
                maximumImageFileSize: 2048 * 1024, // 2 MB
                callbacks: {
                    onImageUploadError: function (msg) {
                        alert('Max image size is 2MB.');
                    },
                    // To determine if content has changed, to unlock the "Submit" button.
                    onChange: (contents) => {
                        this.newContent = contents;
                    }
                }
            })
            .summernote('code', data.content);
        $('.note-editor .note-editable').css('background-color', '#ffffff');
        this.originalContent = data.content;
    },
    methods: {
        Submit() {
            var url = '/resources/edit/' + this.resourceId;
            var resourceData = $('#summernote').summernote('code');

            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ editordata: resourceData })
            };
            fetch(url, requestOptions).then(() => {
                // Delete flag if exist
                let dismissFlagId = this.$route.query.dismissFlagId;
                if (dismissFlagId) {
                    fetch('/content-flags/' + dismissFlagId, {
                        method: 'DELETE'
                    }).finally(() => {
                        this.$router.back();
                    });
                } else {
                    this.$router.back();
                }
            });
        }
    },
    computed: {
        isFormChanged() {
            return this.originalContent !== this.newContent;
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <h1>Edit Learning Resource</h1>
        <div class="row">
            <div class="mb-3">
                <textarea id="summernote" name="editordata"></textarea>
            </div>
        </div>
        <button
                class="btn btn-dark"
                :disabled="!isFormChanged"
                @click="Submit()"
            >
                Submit
            </button>
    </div>
</template>

<style scoped></style>
