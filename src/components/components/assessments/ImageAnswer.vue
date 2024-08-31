<script>
export default {
    data() {
        return {
            skillId: this.$route.params.id,
            imageAnswer: ''
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
            this.imageAnswer = '';
        },
        setAnswer(answer) {
            this.imageAnswer = answer;
        },
        // For image upload.
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (files[0].size > 15728640) {
                alert('image is too big');
                return;
            }
            if (!files.length) return;
            this.createImage(files[0]);
        },
        createImage(file) {
            var imageFile = new Image();
            var reader = new FileReader();
            var vm = this;

            reader.onload = (e) => {
                vm.image = e.target.result;
                this.imageAnswer = e.target.result;
                imageFile.src = e.target.result;
            };

            reader.readAsDataURL(file);
        },
        removeImage: function (e) {
            this.imageAnswer = '';
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
                        <div v-if="!imageAnswer">
                            <input
                                id="choose-avatar"
                                type="file"
                                accept="image/jpeg, image/png, image/jpg, image/webp"
                                @change="onFileChange"
                                hidden
                            />
                            <label class="btn green-btn" for="choose-avatar"
                                >Add&nbsp;&nbsp;
                                <!-- Plus sign -->
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M6.34811 20.0423L6.34811 13.6494L-0.0358702 13.6583C-0.320945 13.6579 -0.594203 13.5444 -0.795782 13.3428C-0.997361 13.1412 -1.11082 12.868 -1.11132 12.5829L-1.11729 7.41477C-1.1168 7.1297 -1.00334 6.85644 -0.801757 6.65486C-0.600179 6.45328 -0.326921 6.33982 -0.0418461 6.33933L6.3481 6.34231L6.3481 -0.0506238C6.34659 -0.193451 6.3736 -0.335145 6.42756 -0.467396C6.48152 -0.599646 6.56134 -0.719794 6.66234 -0.820794C6.76334 -0.921794 6.88349 -1.00161 7.01574 -1.05557C7.14799 -1.10953 7.28969 -1.13655 7.43251 -1.13503L12.5827 -1.12308C12.8678 -1.12259 13.141 -1.00913 13.3426 -0.807549C13.5442 -0.60597 13.6577 -0.332713 13.6582 -0.047637L13.6552 6.34231L20.0481 6.34231C20.3325 6.34248 20.6052 6.45552 20.8063 6.65661C21.0074 6.8577 21.1204 7.13039 21.1206 7.41477L21.1325 12.565C21.1324 12.8494 21.0193 13.122 20.8182 13.3231C20.6171 13.5242 20.3444 13.6373 20.0601 13.6374L13.6552 13.6494L13.6641 20.0334C13.6636 20.3184 13.5502 20.5917 13.3486 20.7933C13.147 20.9948 12.8738 21.1083 12.5887 21.1088L7.43252 21.1267C7.28969 21.1282 7.148 21.1012 7.01575 21.0473C6.88349 20.9933 6.76335 20.9135 6.66235 20.8125C6.56135 20.7115 6.48153 20.5913 6.42757 20.4591C6.37361 20.3268 6.34659 20.1851 6.34811 20.0423Z"
                                        fill="white"
                                    />
                                </svg>
                            </label>
                            <p style="font-size: 14px">
                                <em>Maximum file size 15mb</em>
                            </p>
                        </div>
                        <div v-else>
                            <p>
                                <img
                                    :src="imageAnswer"
                                    height="300"
                                    width="300"
                                    style="background-color: lightgrey"
                                />
                            </p>
                            <div class="d-flex flex-row gap-2">
                                <button
                                    class="btn red-btn"
                                    @click="removeImage"
                                >
                                    Remove &nbsp;
                                    <!-- X icon -->
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 448 512"
                                        fill="white"
                                        width="16"
                                        height="16"
                                    >
                                        <path
                                            d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style></style>
