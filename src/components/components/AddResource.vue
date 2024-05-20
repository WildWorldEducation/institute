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
        // calculate summer note height base on window height
        let summernoteHeight =
            window.innerHeight -
            document.getElementById('banner').clientHeight -
            document.getElementById('page-tile').clientHeight;

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
                    this.$router.push('/skills/' + this.skillId);
                });
        }
    }
};
</script>

<template>
    <div id="banner">
        <img src="/images/banners/general-banner.png" class="image-fluid" />
    </div>
    <div class="container mt-3">
        <div class="page-tile" id="page-tile">Add Learning Resource</div>
        <div class="d-flex flex-column">
            <div class="mb-3 mt-3 text-area-div">
                <textarea id="summernote" name="editordata"></textarea>
            </div>
            <div
                b-on-hover
                title="add this resource to it associated skill"
                class="d-flex flex-row-reverse"
            >
                <button class="btn green-btn" @click="Submit()">Submit</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
#banner {
    width: 100%;
    height: fit-content;
}

.image-fluid {
    width: 100% !important;
    height: auto;
}

.page-tile {
    color: #a48be6;
    font-size: 35px;
    font-weight: 600;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    line-height: 24px;
    display: flex;
    align-items: center;
    height: auto;
    width: fit-content;
}

.green-btn:hover {
    background-color: #3eb3a3;
}
</style>
