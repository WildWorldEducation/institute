<script>
import router from '../../router';
// Import the stores.
import { useUserDetailsStore } from '../../stores/UserDetailsStore';
import { useUsersStore } from '../../stores/UsersStore';
// import cropper component and it styles
import { Cropper, Preview } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import 'vue-advanced-cropper/dist/theme.compact.css';
// others component import
import CheckPasswordComplexity from './CheckPasswordComplexity.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const userStore = useUsersStore();
        userStore.getInstructors();
        const showObj = { ...userDetailsStore, avatar: '1' };
        return {
            userDetailsStore,
            userStore
        };
    },
    data() {
        return {
            id: this.userDetailsStore.userId,
            userName: this.userDetailsStore.userName,
            avatar: this.userDetailsStore.avatar,
            email: this.userDetailsStore.email,
            password: this.userDetailsStore.password,
            image: this.userDetailsStore.avatar,
            firstName: this.userDetailsStore.firstName,
            lastName: this.userDetailsStore.lastName,
            instructorID: this.userDetailsStore.instructor.id || '',
            // get current instructor username for custom dropdown
            instructorName: this.userDetailsStore.instructorUsername,
            validate: {
                firstName: false,
                lastName: false,
                email: false,
                emailFormat: false,
                password: false,
                // this validate is fire when image profile upload is not square
                notSquareImg: false,
                // flag to show warning when cancel crop
                notCropped: false,
                passwordComplex: false
            },
            // show/hide password flag
            passwordVisible: false,
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
            showDropDown: false
        };
    },
    components: {
        Cropper,
        Preview,
        CheckPasswordComplexity
    },
    computed: {},
    async mounted() {
        console.log(this.userStore);
    },
    methods: {
        ValidateForm() {
            if (this.firstName == '' || this.firstName == null) {
                this.validate.firstName = true;
            } else if (this.lastName == '' || this.lastName == null) {
                this.validate.lastName = true;
            } else if (this.userName == '' || this.userName == null) {
                this.validate.username = true;
            } else if (this.email == '' || this.email == null) {
                this.validate.email = true;
            } else if (this.validate.passwordComplex) {
                this.Submit();
            }
        },

        ValidateEmail() {
            if (
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email)
            ) {
                this.validate.emailFormat = false;
            } else {
                this.validate.emailFormat = true;
            }
        },

        Submit() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: this.firstName,
                    lastName: this.lastName,
                    username: this.userName,
                    email: this.email,
                    avatar: this.avatar,
                    password: this.password,
                    instructorID: this.instructorID
                })
            };

            var url = '/users/profile/' + this.id + '/edit';
            fetch(url, requestOptions).then(() => {
                if (
                    this.userDetailsStore.role == 'student' &&
                    this.instructorID != ''
                ) {
                    const requestOptions = {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            instructor_id: this.instructorID
                        })
                    };
                    var url =
                        '/users/' +
                        this.userDetailsStore.userId +
                        '/edit/instructor';
                    fetch(url, requestOptions).then(() => {
                        // refresh user list so the users page will show the update data
                        this.userDetailsStore.getUserDetails();
                        this.$router.push('/profile-settings');
                    });
                } else {
                    // refresh user list so the users page will show the update data
                    this.userDetailsStore.getUserDetails();
                    this.$router.push('/profile-settings');
                }
            });
        },

        // For image upload.
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;
            // delete the old image first
            this.image = '';
            this.avatar = this.image;
            this.createImage(files[0]);
        },
        createImage(file) {
            var imageFile = new Image();
            var reader = new FileReader();
            var vm = this;

            reader.onload = (e) => {
                vm.image = e.target.result;
                this.image = e.target.result;
                imageFile.src = e.target.result;
                this.avatar = this.image;
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
            this.avatar = this.image;
        },
        openImage() {
            const input = document.getElementById('image-input');
            input.click();
        },
        // Cropping image methods
        cropImageChange({ coordinates, canvas, image }) {
            this.cropResult = {
                coordinates,
                image
            };

            this.cropCanvas = canvas.toDataURL();
        },
        handleCancelCrop() {
            if (this.validate.notSquareImg) {
                this.validate.notCropped = true;
                setTimeout(() => {
                    this.validate.notCropped = false;
                }, 2000);
            } else {
                this.showCropModal = false;
            }
        },
        handleCropImage() {
            var imageFile = new Image();
            imageFile.src = this.cropCanvas;
            this.avatar = this.cropCanvas;
            this.image = this.cropCanvas;
            this.showCropModal = false;
            // turn off the validate because we alway crop a spare img
            this.validate.notSquareImg = false;
            this.validate.notCropped = false;
        },

        handlePhoneCropper() {
            // Special handle for phone ui
            if (window.innerWidth < 940) {
                const { visibleArea, image } = this.$refs.cropper.getResult();
                const imageRatio = image.height / image.width;
                /**
                 * We want to zoom the image on phone view so it will cover
                 * all the cropper height
                 */
                this.zoomValue =
                    imageRatio > 1
                        ? visibleArea.height / image.height
                        : visibleArea.width / image.width;
                this.lastZoomValue = this.zoomValue;

                imageRatio < 1 && this.$refs.cropper.zoom(this.zoomValue);
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
    <div class="container mt-3">
        <h1 id="page-tile" class="my-3 ms-0 ms-md-3 ms-lg-0 mt-5">
            Edit Profile
        </h1>
        <div class="row mt-4">
            <!-- Avatar section -->
            <div class="col-12 col-lg-5">
                <div class="row mx-0 px-md-0 mb-4 mb-lg-0">
                    <div
                        class="d-flex justify-content-center justify-content-md-start ps-lg-0"
                    >
                        <div
                            class="position-relative"
                            style="width: fit-content"
                        >
                            <!-- ** The Plus Icon ** -->
                            <!-- desktop view -->
                            <div
                                id="plus-svg"
                                @click="openImage()"
                                class="d-none d-lg-block"
                                b-tooltip.hover
                                title="add another image"
                            >
                                <!-- The plus Icon On Top Of the avatar -->
                                <svg
                                    class=""
                                    width="53"
                                    height="53"
                                    viewBox="0 0 53 53"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle
                                        cx="26.5"
                                        cy="26.5"
                                        r="26.5"
                                        fill="#D9D9D9"
                                    />
                                    <g clip-path="url(#clip0_372_11959)">
                                        <path
                                            d="M19.7439 45.0784L19.7439 33.2515L7.93354 33.268C7.40615 33.2671 6.90063 33.0572 6.52771 32.6843C6.15479 32.3114 5.94488 31.8059 5.94396 31.2785L5.93291 21.7174C5.93382 21.1901 6.14373 20.6845 6.51665 20.3116C6.88957 19.9387 7.3951 19.7288 7.92249 19.7279L19.7439 19.7334L19.7439 7.90646C19.7411 7.64223 19.7911 7.38009 19.8909 7.13543C19.9907 6.89076 20.1384 6.66849 20.3252 6.48164C20.5121 6.29479 20.7344 6.14713 20.979 6.0473C21.2237 5.94747 21.4858 5.8975 21.75 5.9003L31.2779 5.92241C31.8053 5.92332 32.3108 6.13322 32.6838 6.50615C33.0567 6.87907 33.2666 7.38459 33.2675 7.91198L33.262 19.7334L45.0889 19.7334C45.615 19.7337 46.1195 19.9428 46.4915 20.3148C46.8635 20.6869 47.0726 21.1913 47.073 21.7174L47.0951 31.2453C47.0948 31.7714 46.8856 32.2759 46.5136 32.6479C46.1416 33.0199 45.6371 33.229 45.111 33.2294L33.262 33.2515L33.2786 45.0618C33.2776 45.5892 33.0677 46.0947 32.6948 46.4677C32.3219 46.8406 31.8164 47.0505 31.289 47.0514L21.7501 47.0846C21.4858 47.0874 21.2237 47.0374 20.979 46.9376C20.7344 46.8377 20.5121 46.6901 20.3252 46.5032C20.1384 46.3164 19.9907 46.0941 19.8909 45.8494C19.7911 45.6048 19.7411 45.3426 19.7439 45.0784Z"
                                            fill="white"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_372_11959">
                                            <rect
                                                width="37"
                                                height="37"
                                                fill="white"
                                                transform="translate(8 8)"
                                            />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                            <!-- phone view -->
                            <div
                                id="plus-svg"
                                @click="openImage()"
                                class="d-lg-none"
                                b-tooltip.hover
                                title="add another image"
                            >
                                <!-- The plus Icon On Top Of the avatar -->
                                <svg
                                    class=""
                                    width="43"
                                    height="43"
                                    viewBox="0 0 53 53"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle
                                        cx="26.5"
                                        cy="26.5"
                                        r="26.5"
                                        fill="#D9D9D9"
                                    />
                                    <g clip-path="url(#clip0_372_11959)">
                                        <path
                                            d="M19.7439 45.0784L19.7439 33.2515L7.93354 33.268C7.40615 33.2671 6.90063 33.0572 6.52771 32.6843C6.15479 32.3114 5.94488 31.8059 5.94396 31.2785L5.93291 21.7174C5.93382 21.1901 6.14373 20.6845 6.51665 20.3116C6.88957 19.9387 7.3951 19.7288 7.92249 19.7279L19.7439 19.7334L19.7439 7.90646C19.7411 7.64223 19.7911 7.38009 19.8909 7.13543C19.9907 6.89076 20.1384 6.66849 20.3252 6.48164C20.5121 6.29479 20.7344 6.14713 20.979 6.0473C21.2237 5.94747 21.4858 5.8975 21.75 5.9003L31.2779 5.92241C31.8053 5.92332 32.3108 6.13322 32.6838 6.50615C33.0567 6.87907 33.2666 7.38459 33.2675 7.91198L33.262 19.7334L45.0889 19.7334C45.615 19.7337 46.1195 19.9428 46.4915 20.3148C46.8635 20.6869 47.0726 21.1913 47.073 21.7174L47.0951 31.2453C47.0948 31.7714 46.8856 32.2759 46.5136 32.6479C46.1416 33.0199 45.6371 33.229 45.111 33.2294L33.262 33.2515L33.2786 45.0618C33.2776 45.5892 33.0677 46.0947 32.6948 46.4677C32.3219 46.8406 31.8164 47.0505 31.289 47.0514L21.7501 47.0846C21.4858 47.0874 21.2237 47.0374 20.979 46.9376C20.7344 46.8377 20.5121 46.6901 20.3252 46.5032C20.1384 46.3164 19.9907 46.0941 19.8909 45.8494C19.7911 45.6048 19.7411 45.3426 19.7439 45.0784Z"
                                            fill="white"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_372_11959">
                                            <rect
                                                width="37"
                                                height="37"
                                                fill="white"
                                                transform="translate(8 8)"
                                            />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                            <!-- ** The Crop Icon -->
                            <!-- desktop view -->
                            <div
                                id="crop-icon"
                                b-tooltip.hover
                                title="crop image"
                                class="d-none d-lg-block"
                                @click="showCropModal = true"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="35"
                                    height="35"
                                    fill="white"
                                >
                                    <path
                                        d="M128 32c0-17.7-14.3-32-32-32S64 14.3 64 32V64H32C14.3 64 0 78.3 0 96s14.3 32 32 32H64V384c0 35.3 28.7 64 64 64H352V384H128V32zM384 480c0 17.7 14.3 32 32 32s32-14.3 32-32V448h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H448l0-256c0-35.3-28.7-64-64-64L160 64v64l224 0 0 352z"
                                    />
                                </svg>
                            </div>
                            <!-- phone view -->
                            <div
                                id="crop-icon"
                                b-tooltip.hover
                                title="crop image"
                                class="d-lg-none"
                                @click="showCropModal = true"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="28"
                                    height="28"
                                    fill="white"
                                >
                                    <path
                                        d="M128 32c0-17.7-14.3-32-32-32S64 14.3 64 32V64H32C14.3 64 0 78.3 0 96s14.3 32 32 32H64V384c0 35.3 28.7 64 64 64H352V384H128V32zM384 480c0 17.7 14.3 32 32 32s32-14.3 32-32V448h32c17.7 0 32-14.3 32-32s-14.3-32-32-32H448l0-256c0-35.3-28.7-64-64-64L160 64v64l224 0 0 352z"
                                    />
                                </svg>
                            </div>
                            <img
                                id="img-background"
                                :src="avatar"
                                height="428"
                                width="428"
                                style="background-color: lightgrey"
                                class="d-none d-lg-block"
                            />
                            <img
                                id="img-background"
                                :src="avatar"
                                height="240"
                                width="240"
                                style="background-color: lightgrey"
                                class="d-lg-none"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <!-- User info section -->
            <div class="col-12 px-4 px-md-0 col-lg-4 px-0 px-md-4 px-lg-0">
                <div class="d-flex gap-4">
                    <div class="mb-3">
                        <label for="name" class="form-label">First Name</label>
                        <input
                            id="name"
                            v-model="firstName"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.firstName &&
                                (firstName == '' || firstName == null)
                            "
                            class="form-validate"
                        >
                            please enter a first name !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="name" class="form-label">Last Name</label>
                        <input
                            id="name"
                            v-model="lastName"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.lastName &&
                                (lastName == '' || lastName == null)
                            "
                            class="form-validate"
                        >
                            please enter a last name !
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Username</label>
                    <input
                        v-model="userName"
                        type="text"
                        class="form-control"
                    />
                    <div
                        v-if="
                            validate.userName &&
                            (userName == '' || userName == null)
                        "
                        class="form-validate"
                    >
                        please enter a user name !
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input
                        v-model="email"
                        type="email"
                        class="form-control"
                        @blur="ValidateEmail"
                    />
                    <div
                        v-if="validate.email && (email == '' || email == null)"
                        class="form-validate"
                    >
                        please enter an email !
                    </div>
                    <div v-if="validate.emailFormat" class="form-validate">
                        please enter a valid email !
                    </div>
                </div>
                <!-- Password Section -->
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <div class="password-div">
                        <input
                            v-model="password"
                            :type="passwordVisible ? 'text' : 'password'"
                            placeholder="Password"
                            class="form-control"
                            required
                        />
                        <!-- Show and Hide Password Section -->
                        <div
                            class="eye-icon"
                            b-tooltip.hover
                            :title="
                                passwordVisible
                                    ? 'hide password'
                                    : 'show password'
                            "
                        >
                            <!-- Eye Icon -->
                            <svg
                                v-if="passwordVisible"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 576 512"
                                width="20"
                                height="20"
                                fill="gray"
                                @click="passwordVisible = false"
                            >
                                <path
                                    d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"
                                />
                            </svg>
                            <!-- Eye Slash Icon -->
                            <svg
                                v-else
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 640 512"
                                width="20"
                                height="20"
                                fill="gray"
                                @click="passwordVisible = true"
                            >
                                <path
                                    d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm51.3 163.3l-41.9-33C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5zm-88-69.3L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8z"
                                />
                            </svg>
                        </div>
                    </div>
                    <div
                        v-if="
                            validate.password &&
                            (password == '' || password == null)
                        "
                        class="form-validate"
                    >
                        please enter a password!
                    </div>
                    <CheckPasswordComplexity
                        :formData="{
                            username: userName,
                            password: password,
                            firstName: firstName,
                            lastName: lastName
                        }"
                    />
                </div>
                <div v-if="userDetailsStore.role == 'student'" class="mb-3">
                    <label class="form-label">Instructor</label>
                    <!-- Student can only choose an instructor if they don`t have one -->
                    <div v-if="instructorName" class="custom-select-button">
                        {{ instructorName }}
                    </div>
                    <!-- Custom Dropdown -->
                    <div v-else class="d-flex flex-column">
                        <div
                            :class="[
                                showDropDown
                                    ? 'custom-select-button-focus'
                                    : 'custom-select-button'
                            ]"
                            @click="showDropDown = !showDropDown"
                        >
                            {{ 'Please choose an instructor' }}
                            <span>
                                <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        d="M14.2929 8.70711C14.9229 8.07714 14.4767 7 13.5858 7H6.41421C5.52331 7 5.07714 8.07714 5.70711 8.70711L9.29289 12.2929C9.68342 12.6834 10.3166 12.6834 10.7071 12.2929L14.2929 8.70711Z"
                                        fill="#344054"
                                    />
                                </svg>
                            </span>
                        </div>
                        <div v-if="showDropDown" class="custom-dropdown-base">
                            <div
                                v-for="instructor in userStore.instructors"
                                class="custom-dropdown-option"
                                @click="
                                    instructorID = instructor.id;
                                    instructorName = instructor.username;
                                    showDropDown = false;
                                "
                            >
                                {{ instructor.username }}
                            </div>
                        </div>
                    </div>
                    <!-- End of custom dropdown -->
                </div>
                <div class="d-flex justify-content-between mb-3 mt-5">
                    <router-link class="btn red-btn" to="/profile-settings">
                        Cancel
                    </router-link>
                    <button class="btn purple-btn" @click="ValidateForm()">
                        Submit
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
                        <span class="d-none d-lg-block"> Cancel &nbsp; </span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            fill="white"
                            width="16"
                            height="16"
                        >
                            <path
                                d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"
                            />
                        </svg>
                    </button>
                    <button class="btn green-btn" @click="handleCropImage">
                        <span class="d-none d-lg-block"> Crop &nbsp; </span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            fill="white"
                            width="16"
                            height="16"
                        >
                            <path
                                d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#plus-svg {
    position: absolute;
    right: 15px;
    top: 15px;
}
#plus-svg:hover {
    cursor: pointer;
}

#crop-icon {
    position: absolute;
    right: 15px;
    top: 80px;
    background-color: #d9d9d9;
    border-radius: 50px;
    padding: 10px;
}

#crop-icon:hover {
    cursor: pointer;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.red-btn:hover {
    background-color: #cc3535;
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
    background-color: #9a7ceb;
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

#img-background {
    border-radius: 12px;
}

.password-div {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.eye-icon {
    position: absolute;
    right: 20px;
}

.eye-icon:hover {
    cursor: pointer;
}

#page-tile {
    font-family: 'Poppins' sans-serif;
    font-size: 2.375rem;
    font-weight: 900;
    line-height: 28px;
    letter-spacing: 0em;
    text-align: left;
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

.form-control {
    border: 1px solid #f2f4f7;
    box-shadow: 0px 1px 2px 0px #1018280d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    color: #667085;
}
.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}
/**-------------------------------------  */
/* A lot of CSS to styling two radio box */
.control {
    font-family: 'Poppins' sans-serif;
    display: block;
    position: relative;
    padding-left: 30px;
    margin-bottom: 5px;
    padding-top: 3px;
    cursor: pointer;
}

.control > span {
    font-weight: 500;
    font-size: 0.938rem;
    color: #667085;
    text-align: center;
}
.control input {
    position: absolute;
    z-index: -1;
    opacity: 0;
}
.control_indicator {
    position: absolute;
    top: 2px;
    left: 0;
    height: 29.09px;
    width: 29.09px;
    background: #f9f5ff;
    border: 1.45px solid #9c7eec;
    border-radius: 8.73px;
}
.control:hover input ~ .control_indicator,
.control input:focus ~ .control_indicator {
    background: #e7ddf6;
}

.control input:checked ~ .control_indicator {
    background: #f9f5ff;
}
.control:hover input:not([disabled]):checked ~ .control_indicator,
.control input:checked:focus ~ .control_indicator {
    background: #f9f5ff;
}
.control input:disabled ~ .control_indicator {
    background: #e6e6e6;
    opacity: 0.6;
    pointer-events: none;
}
.control_indicator:after {
    box-sizing: unset;
    content: '';
    position: absolute;
    display: none;
}
.control input:checked ~ .control_indicator:after {
    display: block;
}
.control-checkbox .control_indicator:after {
    left: 4px;
    top: 5px;
    width: 13.58px;
    height: 9.33px;
    border: solid #9c7eec;
    border-width: 0px 0px 2.9px 2.9px;
    transform: rotate(-45deg);
}
.control-checkbox input:disabled ~ .control_indicator:after {
    border-color: #7b7b7b;
}
.control-checkbox .control_indicator::before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 4.5rem;
    height: 4.5rem;
    margin-left: -1.3rem;
    margin-top: -1.3rem;
    background: #9c7eec;
    border-radius: 3rem;
    opacity: 0.6;
    z-index: 99999;
    transform: scale(0);
}

.control-checkbox input + .control_indicator::before {
    animation: s-ripple 250ms ease-out;
}
.control-checkbox input:checked + .control_indicator::before {
    animation-name: s-ripple-dup;
}
/* End of check box styling */

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

/* Style For The Custom Select */
.custom-select-button {
    width: 100%;
    height: auto;
    padding: 6px 14px 6px 14px;
    border-radius: 8px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    border: 1px solid #f2f4f7;
    box-shadow: 0px 1px 2px 0px #1018280d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    display: flex;
}

.custom-select-button-focus {
    width: 100%;
    height: auto;
    padding: 6px 14px 6px 14px;
    border-radius: 8px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    border: 1px solid #9c7eec;
    box-shadow: 0px 0px 0px 4px #bca3ff4d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    display: flex;
}

.custom-select-button:hover {
    cursor: pointer;
    border: 1px solid #9c7eec;
}

.custom-select-button > span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotationBack 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.custom-select-button-focus > span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotation 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
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

.custom-select-button-focus:hover {
    cursor: pointer;
}

.custom-dropdown-base {
    border-radius: 8px;
    border: 1px;
    background: linear-gradient(0deg, #ffffff, #ffffff);
    border: 1px solid #9c7eec;
    box-shadow: 0px 4px 6px -2px #10182808;
    box-shadow: 0px 12px 16px -4px #10182814;
}

.custom-dropdown-option {
    padding: 10px 14px 10px 14px;
    gap: 8px;
    color: #344054;
}

.custom-dropdown-option:hover {
    cursor: pointer;
    background: #bca3ff1a;
}

/* End of CSS style for Custom Select */

/* Mobile */
@media (max-width: 480px) {
    #page-tile {
        text-align: center;
    }
    #img-background {
        margin: auto;
    }

    #plus-svg {
        position: absolute;
        right: 10px;
        top: 10px;
    }

    #crop-icon {
        position: absolute;
        right: 8px;
        top: 60px;
        background-color: #d9d9d9;
        border-radius: 50px;
        padding: 8px;
    }

    /* Cropper Component Style */
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
