<script>
export default {
    data() {
        return {
            skillId: this.$route.params.id,
            imageAnswer: [],
            answerType: 'upload'
        };
    },
    props: ['numImagesRequired'],
    setup() {},
    mounted() {},

    methods: {
        //methods will be called on parent component to manipulate answer
        getAnswer() {
            return this.imageAnswer;
        },
        clearAnswer() {
            this.imageAnswer = [];
        },
        setAnswer(answer) {
            this.imageAnswer = answer;
        },
        // For image upload.
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (files.length > 0) {
                for (var i = 0; i < files.length; i++) {
                    var reader = new FileReader();
                    reader.readAsDataURL(files[i]);
                }
            }
            if (!files.length) return;

            for (let i = 0; i < files.length; i++) {
                console.log(files[i].size);
                if (files[i].size > 700000) {
                    alert('image is too big');
                    return;
                }
                this.createImage(files[i], i);
            }
        },
        createImage(file, i) {
            var imageFile = new Image();
            var reader = new FileReader();
            var vm = this;

            reader.onload = (e) => {
                vm.image = e.target.result;
                this.imageAnswer.push(e.target.result);
                imageFile.src = e.target.result;
                console.log(this.imageAnswer);
            };

            reader.readAsDataURL(file);
        },
        removeImages: function (e) {
            this.imageAnswer = [];
            console.log(this.imageAnswer);
        }
    }
};
</script>

<template>
    <div class="mb-3">
        <!-- Choose answer type -->
        <div>
            <p>
                <input
                    type="radio"
                    id="upload"
                    value="upload"
                    v-model="answerType"
                />
                <label for="upload">upload</label>
                <br />
                <input
                    type="radio"
                    id="link"
                    value="link"
                    v-model="answerType"
                />
                <label for="link">link</label>
            </p>
        </div>
        <div class="main-content-container container-fluid">
            <div class="row">
                <div class="col-lg-4">
                    <!-- Upload -->
                    <div class="mb-3 row" v-if="answerType == 'upload'">
                        <input
                            type="file"
                            id="file-input"
                            accept="image/jpeg, image/png, image/jpg, image/webp"
                            @change="onFileChange"
                        />

                        <p style="font-size: 14px">
                            <em>Maximum file size 700kb</em>
                        </p>
                    </div>
                    <div v-else>
                        <input
                            class="form-control mb-2"
                            v-for="(image, index) in numImagesRequired"
                            v-model="imageAnswer[index]"
                            placeholder="add image link"
                        />
                    </div>
                    <!-- Images previews -->
                    <div
                        class="preview"
                        v-for="(image, index) in imageAnswer.length"
                    >
                        <img :src="imageAnswer[index]" />
                    </div>
                </div>
            </div>
            <button
                class="btn red-btn mt-3"
                v-if="imageAnswer.length > 0"
                @click="removeImages"
            >
                Start again
            </button>
        </div>
    </div>
</template>

<style>
.preview img {
    width: 300px;
    height: auto;
}

/* Button Styling */
.red-btn {
    background-color: #dd2822;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.red-btn:hover {
    background-color: rgb(201, 18, 18);
}
</style>
