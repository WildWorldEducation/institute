<script>
import router from '../../router';

export default {
    data() {
        return {
            skillId: this.$route.params.skillId,
            description: null
        };
    },
    setup() {},
    mounted: function () {
        // calculate summer note height base on window height
        let summernoteHeight =
            window.innerHeight -
            document.getElementById('banner').clientHeight -
            document.getElementById('header-tile').clientHeight -
            50;

        // return difference height base on window width ( manual responsive )
        /** == Phone Screen == **/
        if (window.innerWidth < 481) {
            summernoteHeight = summernoteHeight - 310;
        } else if (window.innerWidth >= 481 && window.innerWidth < 1024) {
            /** == Tablet Screen == **/
            summernoteHeight = summernoteHeight - 300;
        } else {
            /** == PC Screen == **/
            summernoteHeight = summernoteHeight - 450;
        }

        //  summernote config
        $('#summernote').summernote({
            placeholder: '',
            height: summernoteHeight,
            tabsize: 2,
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
        async Submit() {
            var url = '/tutor-posts/add/' + this.skillId;
            var resourceData = $('#summernote').summernote('code');
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    description: resourceData
                })
            };
            await fetch(url, requestOptions).then(() => {
                router.back();
            });
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
                    <div class="mb-3">
                        <label for="first_name" class="form-label"
                            >Describe your tutoring style and experience with
                            the subject</label
                        >
                        <div class="mb-3 mt-3 text-area-div">
                            <textarea
                                id="summernote"
                                name="editordata"
                            ></textarea>
                        </div>
                        <div v-if="1 == 2" class="form-validate">
                            please complete this section!
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-4">
                        <router-link
                            class="btn red-btn"
                            :to="'/skills/' + skillId"
                        >
                            Cancel
                        </router-link>
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
