<script>
export default {
    data() {
        return {
            tutorPostId: this.$route.params.tutorPostId,
            tutorPost: {},
            validateDescription: true,
            validateContact: true
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

            $('#summernote-description')
                .summernote({
                    disableDragAndDrop: true,
                    placeholder:
                        'Describe your tutoring style and experience with the subject.',
                    tabsize: 2,
                    toolbar: [
                        ['style', ['style']],
                        ['font', ['bold', 'underline', 'clear']],
                        ['para', ['ul']],
                        ['view', ['fullscreen', 'codeview']]
                    ]
                })
                .summernote('code', this.tutorPost.description);

            $('#summernote-contact-preference')
                .summernote({
                    disableDragAndDrop: true,
                    placeholder:
                        'How would you like to be contacted (eg: an email address, mobile number or calendar booking link)?',
                    tabsize: 2,
                    toolbar: [
                        ['font', ['bold', 'underline', 'clear']],
                        ['para', ['ul']],
                        ['insert', ['link']],
                        ['view', ['fullscreen', 'codeview']]
                    ]
                })
                .summernote('code', this.tutorPost.contact_preference);

            $('.note-editor .note-editable').css('background-color', '#ffffff');
        },
        Submit() {
            let description = $('#summernote-description').summernote('code');
            let contact_preference = $(
                '#summernote-contact-preference'
            ).summernote('code');

            if (description.length < 25) {
                this.validateDescription = false;
            } else {
                this.validateDescription = true;
            }

            if (contact_preference.length < 25) {
                this.validateContact = false;
            } else {
                this.validateContact = true;
            }

            if (!this.validateContact || !this.validateDescription) {
                return;
            }

            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: description,
                    contact_preference: contact_preference
                })
            };

            var url = '/tutor-posts/edit/' + this.tutorPostId;
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
    }
};
</script>

<template>
    <div class="container p-2 bg-light rounded">
        <h1 class="heading">Edit Tutor Post</h1>
        <div class="row">
            <div class="mb-3">
                <textarea
                    id="summernote-description"
                    name="editordata"
                ></textarea>
                <div v-if="validateDescription == false" class="form-validate">
                    Please provide at least 25 characters.
                </div>
            </div>

            <div class="mb-3">
                <textarea
                    id="summernote-contact-preference"
                    name="editordata2"
                ></textarea>
                <div v-if="validateContact == false" class="form-validate">
                    Please provide at least 25 characters.
                </div>
            </div>
            <div class="mb-3 d-flex justify-content-end gap-4">
                <a class="btn red-btn" @click="$router.go(-1)"> Cancel </a>
                <button @click="Submit()" class="btn primary-btn">
                    Submit
                </button>
            </div>
        </div>
    </div>
</template>

<style>
h2 {
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
</style>
