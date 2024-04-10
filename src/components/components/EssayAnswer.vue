<script>
export default {
    data() {
        return {
            skillId: this.$route.params.id
        };
    },
    setup() {},
    mounted: function () {
        //  summernote config
        $('#summernote').summernote({
            placeholder: 'write down your answer here',
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
        //methods will be called on parent component to manipulate summernote text
        getAnswer() {
            const code = $('#summernote').summernote('code');
            return code;
        },
        clearAnswer() {
            $('#summernote').summernote('code', '');
        },
        setAnswer(code) {
            $('#summernote').summernote('code', code);
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <div class="row">
            <div class="mb-3">
                <textarea id="summernote" name="answerdata"></textarea>
            </div>
        </div>
    </div>
</template>

<style>
#summernote {
    background-color: white !important;
}

.note-editable {
    background-color: white !important;
}
</style>
