<script>
export default {
    data() {
        return {
            skillId: this.$route.params.skillId,
            description: null,
            validateDescription: true,
            validateContact: true
        };
    },

    mounted() {
        // Calculate summer note height base on window height
        let summernoteHeight;
        /** == Phone Screen == **/
        if (window.innerWidth < 481) {
            summernoteHeight = 200;
        } else if (window.innerWidth >= 481 && window.innerWidth < 1024) {
            /** == Tablet Screen == **/
            summernoteHeight = 100;
        } else {
            /** == PC Screen == **/
            summernoteHeight = 75;
        }

        //  Summernote config.
        $('#summernote-description').summernote({
            disableDragAndDrop: true,
            placeholder:
                'Describe your tutoring style and experience with the subject.',
            height: summernoteHeight,
            tabsize: 2,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['para', ['ul']],
                ['view', ['fullscreen', 'codeview']]
            ]
        });

        $('#summernote-contact-preference').summernote({
            disableDragAndDrop: true,
            placeholder:
                'How would you like to be contacted (eg: an email address, mobile number or calendar booking link)?',
            height: summernoteHeight,
            tabsize: 2,
            toolbar: [
                ['font', ['bold', 'underline', 'clear']],
                ['para', ['ul']],
                ['insert', ['link']],
                ['view', ['fullscreen', 'codeview']]
            ]
        });
        $('.note-editor .note-editable').css('background-color', '#ffffff');
    },
    methods: {
        async Submit() {
            const url = '/tutor-posts/add/' + this.skillId;
            const description = $('#summernote-description').summernote('code');
            const contactPreference = $(
                '#summernote-contact-preference'
            ).summernote('code');

            if (description.length < 25) {
                this.validateDescription = false;
            } else {
                this.validateDescription = true;
            }

            if (contactPreference.length < 25) {
                this.validateContact = false;
            } else {
                this.validateContact = true;
            }

            if (!this.validateContact || !this.validateDescription) {
                return;
            }

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: description,
                    contactPreference: contactPreference
                })
            };
            await fetch(url, requestOptions).then(() => {
                this.$router.back();
            });
        }
    }
};
</script>

<template>
    <div class="container p-2 bg-light rounded">
        <div class="main-content-container container-fluid p-2">
            <div class="row">
                <div class="col">
                    <div class="mb-4">
                        <div class="mb-3 mt-1 text-area-div">
                            <textarea
                                id="summernote-description"
                                name="editordata"
                            ></textarea>
                        </div>
                        <div
                            v-if="validateDescription == false"
                            class="form-validate"
                        >
                            Please provide at least 25 characters.
                        </div>
                    </div>
                    <div class="mb-3">
                        <div class="mb-3 mt-3 text-area-div">
                            <textarea
                                id="summernote-contact-preference"
                                name="editordata2"
                            ></textarea>
                        </div>
                        <div
                            v-if="validateContact == false"
                            class="form-validate"
                        >
                            Please provide at least 25 characters.
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-4">
                        <button class="btn red-btn" @click="$router.go(-1)">
                            Cancel
                        </button>
                        <button class="btn primary-btn" @click="Submit()">
                            Submit
                        </button>
                    </div>
                </div>
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

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}
</style>
