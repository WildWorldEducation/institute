<script>
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
        // calculate summer note height base on window height
        let summernoteHeight = window.innerHeight - 100;

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
            placeholder:
                'Share a link to a video, website or any other useful info on learning this skill.',
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
        $('.note-editor .note-editable').css('background-color', '#ffffff');
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
                    if (data == 'blocked') {
                        alert('Unfortunately, that source cannot be added.');
                    }
                })
                .then(() => {
                    this.$router.back();
                });
        }
    }
};
</script>

<template>
    <div class="container p-2 bg-light rounded">
        <div class="d-flex flex-column">
            <div class="mb-3 mt-3 text-area-div">
                <textarea id="summernote" name="editordata"></textarea>
            </div>
            <div
                b-on-hover
                title="add this resource to it associated skill"
                class="d-flex flex-row-reverse"
            >
                <button class="btn primary-btn ms-2" @click="Submit()">
                    Submit
                </button>
                <button class="btn red-btn" @click="$router.back()">
                    Cancel
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
