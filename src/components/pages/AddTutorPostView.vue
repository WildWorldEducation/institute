<script>
import router from '../../router';

export default {
    data() {
        return {
            skillId: this.$route.params.skillId,
            description: null,
            validateDescription: true,
            validateContact: true
        };
    },
    mounted: function () {
        // Calculate summer note height base on window height
        let summernoteHeight;
        /** == Phone Screen == **/
        if (window.innerWidth < 481) {
            summernoteHeight = 100;
        } else if (window.innerWidth >= 481 && window.innerWidth < 1024) {
            /** == Tablet Screen == **/
            summernoteHeight = 100;
        } else {
            /** == PC Screen == **/
            summernoteHeight = 58;
        }

        //  Summernote config.
        $('#summernote-description').summernote({
            placeholder: '',
            height: summernoteHeight,
            tabsize: 2,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['view', ['fullscreen', 'codeview', 'help']]
            ],
            maximumImageFileSize: 2048 * 1024, // 2 MB
            callbacks: {
                onImageUploadError: function () {
                    alert('Max image size is 2MB.');
                }
            }
        });

        $('#summernote-contact-preference').summernote({
            placeholder: '',
            height: summernoteHeight,
            tabsize: 2,
            toolbar: [
                ['font', ['bold', 'underline', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['view', ['fullscreen', 'codeview', 'help']]
            ],
            maximumImageFileSize: 2048 * 1024, // 2 MB
            callbacks: {
                onImageUploadError: function () {
                    alert('Max image size is 2MB.');
                }
            }
        });
    },
    methods: {
        async Submit() {
            const url = '/tutor-posts/add/' + this.skillId;
            const description = $('#summernote-description').summernote('code');
            const contactPreference = $(
                '#summernote-contact-preference'
            ).summernote('code');

            console.log(typeof description);
            console.log(description.length);

            if (description.length < 25) {
                this.validateDescription = false;
            }

            if (contactPreference.length < 25) {
                this.contactPreference = false;
            }

            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: description,
                    contactPreference: contactPreference
                })
            };
            // await fetch(url, requestOptions).then(() => {
            //     router.back();
            // });
        }
    }
};
</script>

<template>
    <div id="banner">
        <img
            v-bind:src="'/images/banners/students-banner.png'"
            class="img-fluid"
        />
    </div>
    <div class="container mt-3 pb-3">
        <div class="row">
            <div class="col-10 d-flex align-items-end">
                <h2 id="header-tile">Offer to Tutor</h2>
            </div>
        </div>
        <div class="main-content-container container-fluid p-2">
            <div class="row">
                <div class="col">
                    <div class="mb-4">
                        <label
                            >Describe your tutoring style and experience with
                            the subject.</label
                        >
                        <div class="mb-3 mt-3 text-area-div">
                            <textarea
                                id="summernote-description"
                                name="editordata"
                            ></textarea>
                        </div>
                        <div
                            v-if="validateDescription == false"
                            class="form-validate"
                        >
                            please complete this section!
                        </div>
                    </div>
                    <div class="mb-3">
                        <label
                            >How would you like to be contacted (eg: an email
                            address, mobile number or calendar booking link)?
                        </label>
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
                            please complete this section!
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-4">
                        <button class="btn red-btn" @click="$router.go(-1)">
                            Cancel
                        </button>
                        <button class="btn purple-btn" @click="Submit()">
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
    background-color: #8666ca;
    color: white;
}
</style>
