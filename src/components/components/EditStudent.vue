<script>
import { useUsersStore } from '../../stores/UsersStore';
import { Cropper, Preview } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import 'vue-advanced-cropper/dist/theme.compact.css';

export default {
    setup() {
        const usersStore = useUsersStore();
        return {
            usersStore
        };
    },
    data() {
        return {
            userId: this.$route.params.id,
            user: {},
            // Store original user data to compare changes
            originalUser: {},
            image: '',
            avatar: '',
            // Validate Object flag
            validate: {
                first_name: false,
                last_name: false,
                email: false,
                emailFormat: false,
                // this validate is fire when image profile upload is not square
                notSquareImg: false,
                // flag to show warning when cancel crop
                notCropped: false
            },
            // This is meant to render the error messages we get from the backend.
            errorUsernameMessage: '',
            errorEmailMessage: '',
            // Flag and data of crop image component
            showCropModal: false,
            cropCanvas: '',
            cropResult: {
                coordinates: null,
                image: null
            },
            // Zoom relate state data
            lastZoomValue: 0,
            zoomValue: 0,
            isImageLoading: false
        };
    },
    components: {
        Cropper,
        Preview
    },
    computed: {
        // Check if any form field has been changed
        hasFormChanges() {
            return (
                this.user.first_name !== this.originalUser.first_name ||
                this.user.last_name !== this.originalUser.last_name ||
                this.user.username !== this.originalUser.username ||
                this.user.email !== this.originalUser.email
            );
        }
    },
    async mounted() {
        // Run the GET request.
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
        this.getUser();
    },
    methods: {
        getUser() {
            fetch('/users/show/' + this.userId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.user = data;
                    // Store original data for comparison
                    this.originalUser = { ...data };
                })
                .then(() => {
                    this.image = this.user.avatar;
                });
        },
        ValidateForm() {
            this.validate.username = !this.user.username;
            if (!this.validate.username) {
                this.Submit();
            }
        },
        ValidateEmail() {
            const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (this.user.email && !emailRegex.test(this.user.email)) {
                this.errorEmailMessage = 'Please enter a valid email address!';
                return false; // Return false if the email is invalid
            }
            return true; // Return true if the email is valid
        },
        clearUsernameError() {
            this.errorUsernameMessage = '';
        },
        clearEmailError() {
            this.errorEmailMessage = '';
        },
        async Submit() {
            let reqBody = {};
            if (this.user.first_name) reqBody.firstname = this.user.first_name;
            if (this.user.last_name) reqBody.lastname = this.user.last_name;
            reqBody.username = this.user.username;

            // Validate email first, and if valid, add it to the request
            if (this.user.email && this.ValidateEmail()) {
                reqBody.email = this.user.email;
            } else if (this.user.email && !this.ValidateEmail()) {
                return; // Stop further processing if email is invalid
            }

            if (this.user.avatar) reqBody.avatar = this.user.avatar;

            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody)
            };

            const url = '/users/' + this.userId + '/instructor/edit';

            try {
                const res = await fetch(url, requestOptions);

                if (!res.ok) {
                    const err = await res.json();

                    // Reset error messages
                    this.errorUsernameMessage = '';
                    this.errorEmailMessage = '';

                    // Display errors if returned by the backend
                    if (err.errors) {
                        if (err.errors.username) {
                            this.errorUsernameMessage = err.errors.username;
                        }
                        if (err.errors.email) {
                            this.errorEmailMessage = err.errors.email;
                        }
                    }

                    return; // Stop further actions if there's an error
                }

                await this.usersStore.getUsers();
                // Update original user data after successful submission
                this.originalUser = { ...this.user };
                this.$router.push('/students');
            } catch (error) {
                console.error(error);
            }
        },
        async SubmitAvatar() {
            this.isImageLoading = true;
            if (!this.user.avatar) {
                return;
            }
            // If valid, submit.
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    avatar: this.user.avatar
                })
            };
            var url = '/users/' + this.userId + '/instructor/edit-avatar';
            fetch(url, requestOptions).then(() => {
                this.isImageLoading = false;
            });
        },

        // For image upload.
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;
            this.createImage(files[0]);
        },
        createImage(file) {
            var imageFile = new Image();
            var reader = new FileReader();
            var vm = this;

            reader.onload = (e) => {
                vm.image = e.target.result;
                this.image = e.target.result;
                this.avatar = this.image; // Set avatar to the image for cropping
                imageFile.src = e.target.result;
                this.user.avatar = this.image;
            };

            imageFile.onload = () => {
                if (imageFile.width / imageFile.height !== 1) {
                    this.validate.notSquareImg = true;
                    this.showCropModal = true;
                } else {
                    this.validate.notSquareImg = false;
                }
            };

            reader.readAsDataURL(file);
        },
        removeImage: function (e) {
            this.image = '';
        },
        // Cropping image methods
        cropImageChange({ coordinates, canvas, image }) {
            this.cropResult = {
                coordinates,
                image
            };
            this.cropCanvas = canvas.toDataURL();
        },
        handleCropImage() {
            var imageFile = new Image();
            imageFile.src = this.cropCanvas;
            this.user.avatar = this.cropCanvas;
            this.image = this.cropCanvas;
            this.showCropModal = false;
            // turn off the validate because we alway crop a spare img
            this.validate.notSquareImg = false;
            this.validate.notCropped = false;
        },
        handleCancelCrop() {
            this.showCropModal = false;
            // if (this.validate.notSquareImg) {
            //     this.validate.notCropped = true;
            //     setTimeout(() => {
            //         this.validate.notCropped = false;
            //     }, 2000);
            // } else {
            //     this.showCropModal = false;
            // }
        },
        stencilSize({ boundaries }) {
            return {
                width: Math.min(boundaries.height, boundaries.width) - 48,
                height: Math.min(boundaries.height, boundaries.width) - 48
            };
        },
        handlePhoneCropper() {
            // Special handle for phone ui
            if (window.innerWidth < 940) {
                const { visibleArea, image } = this.$refs.cropper.getResult();
                /**
                 * We want to zoom the image on phone view so it will cover
                 * all the cropper height
                 */

                this.zoomValue = visibleArea.height / image.height;
                this.lastZoomValue = this.zoomValue;
                // Zoom the image if the cropper is open on phone view
                this.$refs.cropper.zoom(this.zoomValue);
            }
        },
        cropperZoomIn() {
            const visibleHeight = this.$refs.cropper.visibleArea.height;
            if (visibleHeight > 30) {
                this.$refs.cropper.zoom(2);
            }
        },
        cropperZoomOut() {
            const visibleHeight = this.$refs.cropper.visibleArea.height;
            if (visibleHeight < 3000) {
                this.$refs.cropper.zoom(0.5);
            }
        }
    }
};
</script>

<template>
    <div class="container p-1">
        <router-link class="btn red-btn mb-1" to="/students">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                height="20"
                width="20"
                fill="white"
            >
                <path
                    d="M134.1 296H436c6.6 0 12-5.4 12-12v-56c0-6.6-5.4-12-12-12H134.1v-46.1c0-21.4-25.9-32.1-41-17L7 239c-9.4 9.4-9.4 24.6 0 33.9l86.1 86.1c15.1 15.1 41 4.4 41-17V296z"
                />
            </svg>
            &nbsp;Back to Students
        </router-link>
        <div class="row">
            <!-- Student avatar -->
            <div class="col-12 col-md-6 mb-3">
                <div class="">
                    <img
                        class="rounded"
                        v-if="!isImageLoading"
                        :src="image"
                        height="350"
                        width="350"
                        style="background-color: lightgrey"
                    />
                    <!-- Loading Animation -->
                    <div
                        v-else
                        class="loading-animation d-flex justify-content-center align-items-center py-4"
                    >
                        <span class="loader"></span>
                    </div>

                    <div class="d-flex gap-1 mt-1">
                        <label class="btn green-btn" for="image-input">
                            Change
                        </label>
                        <button
                            v-if="avatar != ''"
                            class="btn green-btn"
                            @click="showCropModal = true"
                        >
                            Crop &nbsp;
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                width="18"
                                height="18"
                                fill="white"
                            >
                                <path
                                    d="M448 109.3l54.6-54.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L402.7 64 160 64v64l178.7 0L128 338.7V32c0-17.7-14.3-32-32-32S64 14.3 64 32V64H32C14.3 64 0 78.3 0 96s14.3 32 32 32H64V384c0 35.3 28.7 64 64 64H352V384H173.3L384 173.3 384 480c0 17.7 14.3 32 32 32s32-14.3 32-32V448h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H448l0-274.7z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
                <button
                    :disabled="avatar == ''"
                    class="btn primary-btn mt-1"
                    @click="SubmitAvatar()"
                >
                    Update student avatar
                </button>
            </div>

            <!-- Student details -->
            <div class="col-12 col-md-6 mb-2">
                <div class="mb-3">
                    <h2 class="secondary-heading h4">First name</h2>
                    <input
                        v-model="user.first_name"
                        type="text"
                        class="form-control"
                    />
                </div>
                <div class="mb-3">
                    <h2 class="secondary-heading h4">Last name</h2>
                    <input
                        v-model="user.last_name"
                        type="text"
                        class="form-control"
                    />
                </div>
                <div class="mb-3">
                    <h2 class="secondary-heading h4">Username</h2>
                    <input
                        v-model="user.username"
                        type="text"
                        class="form-control"
                        @input="clearUsernameError"
                    />
                    <div
                        v-if="
                            (validate.username &&
                                (user.username == '' ||
                                    user.username == null)) ||
                            errorUsernameMessage
                        "
                        class="form-validate"
                    >
                        {{ errorUsernameMessage || 'Please enter a username!' }}
                    </div>
                </div>
                <div class="mb-2">
                    <h2 class="secondary-heading h4">Email address</h2>
                    <input
                        v-model="user.email"
                        type="email"
                        class="form-control"
                        @input="clearEmailError"
                    />
                    <div v-if="errorEmailMessage" class="form-validate">
                        {{
                            errorEmailMessage ||
                            'Please enter a valid email address!'
                        }}
                    </div>
                </div>

                <div class="">
                    <button
                        class="btn primary-btn"
                        @click="ValidateForm()"
                        :disabled="!hasFormChanges"
                    >
                        Update student details
                    </button>
                </div>
            </div>
        </div>
        <div class="mb-3 row">
            <div class="d-none">
                <input
                    id="image-input"
                    class="form-control"
                    type="file"
                    accept="image/*"
                    @change="onFileChange"
                />
                <p style="font-size: 14px"><em>Maximum file size 15mb</em></p>
            </div>
        </div>
    </div>
    <!-- Crop modal -->
    <div v-if="showCropModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content d-flex flex-column">
                <div id="crop-component" ref="cropComponent">
                    <cropper
                        :src="image"
                        @change="cropImageChange"
                        @ready="handlePhoneCropper"
                        :stencil-props="{
                            movable: true,
                            resizable: true,
                            aspectRatio: 1
                        }"
                        image-restriction="stencil"
                        class="cropper"
                        ref="cropper"
                        :debounce="false"
                    />
                    <!-- Preview Crop Result -->
                    <div id="crop-result">
                        <div class="form-label">Result:</div>
                        <preview
                            :width="120"
                            :height="120"
                            :image="cropResult.image"
                            :coordinates="cropResult.coordinates"
                        />
                    </div>
                </div>
                <!-- Programmatic Zoom -->
                <div id="zoom-range">
                    <span class="mt-1 me-1 zoom-icon" @click="cropperZoomOut">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="20"
                            height="20"
                            fill="gray"
                        >
                            <path
                                d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM136 184c-13.3 0-24 10.7-24 24s10.7 24 24 24H280c13.3 0 24-10.7 24-24s-10.7-24-24-24H136z"
                            />
                        </svg>
                    </span>

                    <span class="mt-1 ms-1 zoom-icon" @click="cropperZoomIn">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="20"
                            height="20"
                            fill="gray"
                        >
                            <path
                                d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM184 296c0 13.3 10.7 24 24 24s24-10.7 24-24V232h64c13.3 0 24-10.7 24-24s-10.7-24-24-24H232V120c0-13.3-10.7-24-24-24s-24 10.7-24 24v64H120c-13.3 0-24 10.7-24 24s10.7 24 24 24h64v64z"
                            />
                        </svg>
                    </span>
                </div>
                <div class="d-flex flex-row justify-content-center mt-2">
                    <div
                        id="warning-line"
                        v-if="validate.notCropped"
                        :class="{ shake: validate.notCropped }"
                    >
                        Please crop your image to square aspect ratio
                    </div>
                </div>
                <div
                    class="d-flex flex-row justify-content-between justify-content-lg-end gap-2 mt-5 pb-2 pb-lg-0"
                >
                    <button class="btn red-btn" @click="handleCancelCrop">
                        <span class="d-none d-lg-block">Cancel</span>
                    </button>
                    <button class="btn green-btn" @click="handleCropImage">
                        <span class="d-none d-lg-block">Crop</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Loading animation */
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--primary-color);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: loading-rotation 1s linear infinite;
}
@keyframes loading-rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
.loading-animation {
    min-height: 100%;
}
/* ------------------- */

#header-tile {
    color: #667085;
    font-family: 'Poppins' sans-serif;
    font-size: 2.375rem;
    font-weight: 900;
    line-height: 41px;
    letter-spacing: 0em;
    text-align: left;
    margin-top: auto;
    margin-bottom: 0px;
}

#header-icon {
    margin-left: 10px;
    width: 108px;
    height: 61px;
}

.main-content-container {
    background-color: #e4ecf4;
    border-radius: 12px;
}

.form-label {
    color: #344054;
    font-family: 'Poppins' sans-serif;
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0em;
    text-align: left;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    display: flex;
    align-items: center;
    height: auto;
    width: fit-content;
}

.green-btn:hover {
    background-color: #3eb3a3;
}

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}

/* The animation key frame */
@keyframes rotation {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(180deg);
    }
}

@keyframes rotationBack {
    from {
        transform: rotate(180deg);
    }
    to {
        transform: rotate(0deg);
    }
}

/* Styling for crop modal */
/* The Warning Modal */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 1;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgba(255, 255, 255, 0.459);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

.modal-content {
    background-color: #fefefe;
    margin: 5% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    /* Could be more or less, depending on screen size */
    width: 80%;
    height: 75%;
}

.modal-message {
    font-size: 20px;
    font-weight: 500;
    color: #667085;
}

/* Cropper Style */
#crop-component {
    position: relative;
    width: 100%;
    height: 100%;
}

.cropper :deep(.vue-advanced-cropper__background) {
    background: white;
    z-index: 0;
    width: 100%;
    height: 100%;
}

.cropper :deep(.vue-advanced-cropper__foreground) {
    background: #667085;
    z-index: 0;
    border-radius: 12px;
    width: 100%;
    height: 100%;
}

#crop-result {
    top: 10px;
    right: 10px;
    position: absolute;
    z-index: 10 !important;
}

.cropper {
    position: absolute;
    top: 10px;
    z-index: 0;
    width: 100%;
    height: 100%;
    border-radius: 12px;
}

#warning-text {
    color: rgb(160, 28, 28);
}

#zoom-range {
    width: 60%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    margin-left: auto;
    margin-right: auto;
}

.zoom-icon:hover {
    cursor: pointer;
}

#warning-line {
    color: rgb(218, 180, 13);
}

/* Shake animation for waring line */
.shake {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

@keyframes shake {
    10%,
    90% {
        transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
        transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
        transform: translate3d(4px, 0, 0);
    }
}

/* ======== End Of Desktop Styling =========*/

/* Mobile */
@media (max-width: 480px) {
    .modal-content {
        width: 100%;
        height: 100%;
        padding: 3px;
        margin: 0% auto;
        background-color: white;
    }
    .cropper {
        position: static;
        height: 90%;
        width: 100%;
    }

    .cropper :deep(.vue-advanced-cropper__foreground) {
        background: white;
    }
}

/** Tablet */
@media (min-width: 481px) and (max-width: 991px) {
    .modal-content {
        margin: 15% 0%;
        width: 100%;
    }
}
</style>
