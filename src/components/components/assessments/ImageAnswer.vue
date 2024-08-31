<script>
export default {
    data() {
        return {
            skillId: this.$route.params.id,
            imageAnswer: []
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
                if (files[i].size > 15728640) {
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
        <div class="main-content-container container-fluid">
            <div class="row">
                <div class="col-lg-4">
                    <div class="mb-3 row">
                        <!-- <div v-if="!imageAnswer"> -->

                        <input
                            type="file"
                            id="file-input"
                            accept="image/jpeg, image/png, image/jpg, image/webp"
                            @change="onFileChange"
                        />

                        <p style="font-size: 14px">
                            <em>Maximum file size 15mb</em>
                        </p>
                    </div>
                    <div
                        class="preview"
                        v-for="(image, index) in imageAnswer.length"
                    >
                        <img :src="imageAnswer[index]" />
                    </div>
                </div>
            </div>
            <button @click="removeImages">Start again</button>
        </div>
    </div>
</template>

<style>
.preview img {
    width: 300px;
    height: auto;
}
</style>
