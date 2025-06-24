<script>
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
        return {
            userDetailsStore,
            userStore
        };
    },
    data() {
        return {
            id: this.userDetailsStore.userId,
            userName: this.userDetailsStore.userName,
            avatar: '',
            email: this.userDetailsStore.email,
            image: this.userDetailsStore.avatar,
            firstName: this.userDetailsStore.firstName,
            lastName: this.userDetailsStore.lastName,
            instructorID: this.userDetailsStore.instructorId,
            isGoogleAuth: this.userDetailsStore.isGoogleAuth,
            // Store original values for comparison
            originalValues: {
                firstName: this.userDetailsStore.firstName,
                lastName: this.userDetailsStore.lastName,
                userName: this.userDetailsStore.userName,
                email: this.userDetailsStore.email
            },
            validate: {
                firstName: false,
                lastName: false,
                username: false,
                email: false,
                emailFormat: false,
                // this is fired when image profile upload is not square
                notSquareImg: false,
                // flag to show warning when cancel crop
                notCropped: false
            },
            // Password change section
            showPasswordSection: false,
            passwordData: {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            },
            passwordValidate: {
                currentPassword: false,
                newPassword: false,
                confirmPassword: false,
                passwordMatch: false,
                passwordComplex: false
            },
            passwordVisible: {
                current: false,
                new: false,
                confirm: false
            },
            passwordChangeMessage: '',
            passwordChangeSuccess: false,
            isUpdatingPassword: false,
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
            showWarnModal: false,
            isImageLoading: false
        };
    },
    components: {
        Cropper,
        Preview,
        CheckPasswordComplexity
    },
    computed: {
        // Check if user details have changed
        hasDetailsChanged() {
            return (
                this.firstName !== this.originalValues.firstName ||
                this.lastName !== this.originalValues.lastName ||
                this.userName !== this.originalValues.userName ||
                this.email !== this.originalValues.email
            );
        },
        // Check if passwords match
        passwordsMatch() {
            return (
                this.passwordData.newPassword ===
                this.passwordData.confirmPassword
            );
        },
        // Check if password form is valid
        isPasswordFormValid() {
            const hasAllFields =
                this.passwordData.currentPassword &&
                this.passwordData.newPassword &&
                this.passwordData.confirmPassword;

            const passwordsMatch = this.passwordsMatch;

            // Basic password complexity check as fallback
            const hasMinLength = this.passwordData.newPassword.length >= 8;

            return hasAllFields && passwordsMatch && hasMinLength;
        }
    },
    watch: {
        // Watch for password confirmation changes
        'passwordData.confirmPassword'() {
            this.validatePasswordMatch();
        },
        'passwordData.newPassword'() {
            this.validatePasswordMatch();
        }
    },
    async created() {
        // Get user details on component creation
        await this.userDetailsStore.getUserDetails();
        // Update original values after getting fresh data
        this.updateOriginalValues();
    },
    methods: {
        updateOriginalValues() {
            this.originalValues = {
                firstName: this.userDetailsStore.firstName,
                lastName: this.userDetailsStore.lastName,
                userName: this.userDetailsStore.userName,
                email: this.userDetailsStore.email
            };
        },
        ValidateForm() {
            if (this.userName == '' || this.userName == null) {
                this.validate.username = true;
            } else if (this.email == '' || this.email == null) {
                this.validate.email = true;
            }
            this.Submit();
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
            // If valid, submit.
            if (
                !this.validate.username &&
                !this.validate.email &&
                !this.validate.emailFormat
            ) {
                const requestOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        firstName: this.firstName,
                        lastName: this.lastName,
                        username: this.userName,
                        email: this.email
                    })
                };
                var url = '/users/profile/' + this.id + '/edit';
                fetch(url, requestOptions).then(() => {
                    // refresh user list so the users page will show the update data
                    this.userDetailsStore.getUserDetails();
                    // Update original values after successful update
                    this.updateOriginalValues();
                    this.$router.push('/profile');
                });
            }
        },
        // Password change methods
        togglePasswordSection() {
            this.showPasswordSection = !this.showPasswordSection;
            if (!this.showPasswordSection) {
                this.resetPasswordForm();
                // Clear messages when cancelling
                this.passwordChangeMessage = '';
                this.passwordChangeSuccess = false;
            }
        },
        resetPasswordForm() {
            this.passwordData = {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
            this.passwordValidate = {
                currentPassword: false,
                newPassword: false,
                confirmPassword: false,
                passwordMatch: false,
                passwordComplex: false
            };
            this.passwordVisible = {
                current: false,
                new: false,
                confirm: false
            };
            this.isUpdatingPassword = false;
            // Only clear messages when explicitly cancelling, not on successful update
        },
        validatePasswordMatch() {
            if (
                this.passwordData.confirmPassword &&
                this.passwordData.newPassword
            ) {
                this.passwordValidate.passwordMatch = this.passwordsMatch;
            }
        },
        validatePasswordForm() {
            let isValid = true;

            // Reset validation
            this.passwordValidate.currentPassword = false;
            this.passwordValidate.newPassword = false;
            this.passwordValidate.confirmPassword = false;

            // Validate current password
            if (!this.passwordData.currentPassword) {
                this.passwordValidate.currentPassword = true;
                isValid = false;
            }

            // Validate new password
            if (!this.passwordData.newPassword) {
                this.passwordValidate.newPassword = true;
                isValid = false;
            }

            // Validate confirm password
            if (!this.passwordData.confirmPassword) {
                this.passwordValidate.confirmPassword = true;
                isValid = false;
            }

            // Check if passwords match
            if (!this.passwordsMatch) {
                this.passwordValidate.passwordMatch = false;
                isValid = false;
            }

            // For the form submission validation, we'll check complexity in the component
            return isValid;
        },
        async handlePasswordUpdate() {
            if (!this.validatePasswordForm()) {
                return;
            }

            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: this.passwordData.currentPassword,
                    newPassword: this.passwordData.newPassword
                })
            };

            try {
                const response = await fetch(
                    '/users/profile/' + this.id + '/edit-password',
                    requestOptions
                );
                const data = await response.json();

                if (response.ok) {
                    this.passwordChangeSuccess = true;
                    this.passwordChangeMessage =
                        'Password updated successfully!';
                    this.resetPasswordForm();
                    this.showPasswordSection = false;

                    // Hide success message after 3 seconds
                    setTimeout(() => {
                        this.passwordChangeMessage = '';
                        this.passwordChangeSuccess = false;
                    }, 3000);
                } else {
                    this.passwordChangeSuccess = false;
                    this.passwordChangeMessage =
                        data.error || 'Failed to update password';
                }
            } catch (error) {
                this.passwordChangeSuccess = false;
                this.passwordChangeMessage =
                    'An error occurred while updating password';
                // DO NOT log the error details as they may contain sensitive data
                console.error('Password update failed');
            }
        },
        togglePasswordVisibility(field) {
            this.passwordVisible[field] = !this.passwordVisible[field];
        },
        SubmitAvatar() {
            if (!this.avatar) {
                console.log(this.avatar);
                return;
            }
            // If valid, submit.
            if (!this.validate.notSquareImg) {
                this.isImageLoading = true;
                const requestOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        avatar: this.avatar
                    })
                };
                var url = '/users/profile/' + this.id + '/edit-avatar';
                fetch(url, requestOptions).then(() => {
                    this.isImageLoading = false;
                    // refresh user details so the users page will show the updated data
                    this.userDetailsStore.getUserDetails();
                });
            } else {
                this.showWarnModal = true;
            }
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
            this.showCropModal = false;
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
    <div class="container bg-light rounded">
        <!-- Back button -->
        <router-link class="btn red-btn mt-1" to="/profile">
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
            Back to Profile
        </router-link>

        <div class="row mt-1">
            <!-- Avatar section -->
            <div class="col-12 col-md-6 mb-2">
                <div class="row mx-0 px-md-0 mb-4 mb-lg-0">
                    <div
                        class="d-flex justify-content-center justify-content-md-start ps-lg-0"
                    >
                        <div
                            v-if="!isImageLoading"
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
                                v-if="avatar && validate.notSquareImg"
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
                                v-if="avatar && validate.notSquareImg"
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
                                :src="image"
                                height="428"
                                width="428"
                                style="background-color: lightgrey"
                                class="d-none d-lg-block"
                            />
                            <img
                                id="img-background"
                                :src="image"
                                height="240"
                                width="240"
                                style="background-color: lightgrey"
                                class="d-lg-none"
                            />
                        </div>
                        <!-- Loading Animation -->
                        <div
                            v-else
                            class="loading-animation d-flex justify-content-center align-items-center py-4"
                        >
                            <span class="loader"></span>
                        </div>
                    </div>
                </div>
                <button
                    :disabled="!avatar"
                    class="btn primary-btn mt-1"
                    @click="SubmitAvatar()"
                >
                    Update avatar
                </button>
                <hr class="hr-border" />
            </div>

            <!-- User info section -->
            <div class="col-12 col-md-6">
                <div class="d-flex gap-4">
                    <!-- First Name -->
                    <div class="mb-3">
                        <h2 class="secondary-heading h4">First Name</h2>
                        <input
                            v-model="firstName"
                            type="text"
                            class="form-control"
                        />
                    </div>
                    <!-- Last Name -->
                    <div class="mb-3">
                        <h2 class="secondary-heading h4">Last Name</h2>
                        <input
                            v-model="lastName"
                            type="text"
                            class="form-control"
                        />
                    </div>
                </div>
                <!-- Username -->
                <div class="mb-3">
                    <h2 class="secondary-heading h4">Username</h2>
                    <input
                        v-model="userName"
                        type="text"
                        class="form-control"
                    />
                    <div
                        v-if="
                            validate.username &&
                            (userName == '' || userName == null)
                        "
                        class="form-validate"
                    >
                        please enter a user name !
                    </div>
                </div>
                <div class="mb-3">
                    <h2 class="secondary-heading h4">Email</h2>
                    <input
                        v-model="email"
                        type="email"
                        class="form-control"
                        @blur="ValidateEmail"
                        :readonly="isGoogleAuth"
                    />
                    <div
                        v-if="validate.email && (email == '' || email == null)"
                        class="form-validate"
                    >
                        please enter an email !
                    </div>
                    <div v-else-if="validate.emailFormat" class="form-validate">
                        please enter a valid email !
                    </div>
                </div>
                <button
                    class="btn primary-btn"
                    @click="ValidateForm()"
                    :disabled="!hasDetailsChanged"
                >
                    Update details
                </button>

                <hr class="mt-4 mb-4" />

                <!-- Success/Error Message for Password (moved here so it's always visible) -->
                <div
                    v-if="passwordChangeMessage"
                    :class="[
                        'alert',
                        passwordChangeSuccess
                            ? 'alert-success'
                            : 'alert-danger',
                        'mb-3'
                    ]"
                >
                    {{ passwordChangeMessage }}
                </div>

                <!-- Password Section -->
                <div class="password-section">
                    <div
                        class="d-flex align-items-center justify-content-between mb-3"
                    >
                        <h2 class="secondary-heading h4 mb-0">Password</h2>
                        <button
                            class="btn cancel-btn btn-sm"
                            @click="togglePasswordSection()"
                        >
                            {{
                                showPasswordSection
                                    ? 'Cancel'
                                    : 'Change Password'
                            }}
                        </button>
                    </div>

                    <!-- Password Change Form (Hidden by default) -->
                    <div
                        v-if="showPasswordSection"
                        class="password-change-form"
                    >
                        <!-- Current Password -->
                        <div class="mb-3">
                            <label class="form-label">Current Password</label>
                            <div class="password-div">
                                <input
                                    v-model="passwordData.currentPassword"
                                    :type="
                                        passwordVisible.current
                                            ? 'text'
                                            : 'password'
                                    "
                                    placeholder="Enter current password"
                                    class="form-control"
                                    :class="{
                                        'is-invalid':
                                            passwordValidate.currentPassword
                                    }"
                                />
                                <div
                                    class="eye-icon"
                                    b-tooltip.hover
                                    :title="
                                        passwordVisible.current
                                            ? 'hide password'
                                            : 'show password'
                                    "
                                    @click="togglePasswordVisibility('current')"
                                >
                                    <!-- Eye Icon -->
                                    <svg
                                        v-if="passwordVisible.current"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 576 512"
                                        width="20"
                                        height="20"
                                        fill="gray"
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
                                    >
                                        <path
                                            d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm51.3 163.3l-41.9-33C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5zm-88-69.3L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div
                                v-if="passwordValidate.currentPassword"
                                class="form-validate"
                            >
                                Please enter your current password
                            </div>
                        </div>

                        <!-- New Password -->
                        <div class="mb-3">
                            <label class="form-label">New Password</label>
                            <div class="password-div">
                                <input
                                    v-model="passwordData.newPassword"
                                    :type="
                                        passwordVisible.new
                                            ? 'text'
                                            : 'password'
                                    "
                                    placeholder="Enter new password"
                                    class="form-control"
                                    :class="{
                                        'is-invalid':
                                            passwordValidate.newPassword
                                    }"
                                />
                                <div
                                    class="eye-icon"
                                    b-tooltip.hover
                                    :title="
                                        passwordVisible.new
                                            ? 'hide password'
                                            : 'show password'
                                    "
                                    @click="togglePasswordVisibility('new')"
                                >
                                    <!-- Eye Icon -->
                                    <svg
                                        v-if="passwordVisible.new"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 576 512"
                                        width="20"
                                        height="20"
                                        fill="gray"
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
                                    >
                                        <path
                                            d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm51.3 163.3l-41.9-33C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5zm-88-69.3L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div
                                v-if="passwordValidate.newPassword"
                                class="form-validate"
                            >
                                Please enter a new password
                            </div>
                            <!-- Password Complexity Check -->
                            <CheckPasswordComplexity
                                :formData="{
                                    username: userName,
                                    password: passwordData.newPassword,
                                    firstName: firstName,
                                    lastName: lastName,
                                    email: email
                                }"
                            />
                        </div>

                        <!-- Confirm New Password -->
                        <div class="mb-3">
                            <label class="form-label"
                                >Confirm New Password</label
                            >
                            <div class="password-div">
                                <input
                                    v-model="passwordData.confirmPassword"
                                    :type="
                                        passwordVisible.confirm
                                            ? 'text'
                                            : 'password'
                                    "
                                    placeholder="Confirm new password"
                                    class="form-control"
                                    :class="{
                                        'is-invalid':
                                            passwordValidate.confirmPassword ||
                                            (!passwordsMatch &&
                                                passwordData.confirmPassword)
                                    }"
                                />
                                <div
                                    class="eye-icon"
                                    b-tooltip.hover
                                    :title="
                                        passwordVisible.confirm
                                            ? 'hide password'
                                            : 'show password'
                                    "
                                    @click="togglePasswordVisibility('confirm')"
                                >
                                    <!-- Eye Icon -->
                                    <svg
                                        v-if="passwordVisible.confirm"
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 576 512"
                                        width="20"
                                        height="20"
                                        fill="gray"
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
                                    >
                                        <path
                                            d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm51.3 163.3l-41.9-33C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5zm-88-69.3L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8z"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div
                                v-if="passwordValidate.confirmPassword"
                                class="form-validate"
                            >
                                Please confirm your new password
                            </div>
                            <div
                                v-if="
                                    !passwordsMatch &&
                                    passwordData.confirmPassword
                                "
                                class="form-validate"
                            >
                                Passwords do not match
                            </div>
                        </div>

                        <!-- Update Password Button -->
                        <div class="d-flex justify-content-end">
                            <button
                                class="btn primary-btn"
                                @click="handlePasswordUpdate()"
                                :disabled="
                                    !isPasswordFormValid || isUpdatingPassword
                                "
                            >
                                <span v-if="isUpdatingPassword">
                                    Updating...
                                </span>
                                <span v-else> Update Password </span>
                            </button>
                        </div>
                    </div>
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
    <!-- Modal show image crop feature -->
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
                        <span class="">Cancel</span>
                    </button>
                    <button class="btn green-btn" @click="handleCropImage">
                        <span class="">Crop</span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
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

/* Loading animation */
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--primary-color);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}
@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
.loading-animation {
    position: relative;
    min-height: 100%;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
}

/* Password Section Styles */
.password-section {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    background-color: #f9fafb;
}

.password-change-form {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    margin-top: 16px;
    border: 1px solid #e5e7eb;
}

/* Enhanced Alert styles with better visual feedback */
.alert {
    padding: 16px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-weight: 500;
    border: 2px solid;
    display: flex;
    align-items: center;
    gap: 8px;
}

.alert-success {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border-color: #10b981;
    color: #065f46;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.alert-danger {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border-color: #ef4444;
    color: #991b1b;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}

/* Theme-aware cancel button */
.cancel-btn {
    background-color: transparent;
    color: var(--primary-color, #007bff);
    border: 2px solid var(--primary-color, #007bff);
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    transition: all 0.3s ease;
    border-radius: 6px;
    padding: 8px 16px;
}

.cancel-btn:hover {
    background-color: var(--primary-color, #007bff);
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.cancel-btn:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* Enhanced primary button */
.primary-btn {
    background-color: var(--primary-color, #007bff);
    border-color: var(--primary-color, #007bff);
    transition: all 0.3s ease;
}

.primary-btn:hover {
    background-color: var(--primary-color-dark, #0056b3);
    border-color: var(--primary-color-dark, #0056b3);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
}

.primary-btn:disabled {
    background-color: #6c757d;
    border-color: #6c757d;
    transform: none;
    box-shadow: none;
}

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

#instructor-name-text {
    font-style: italic;
    color: #1f57c3;
    background-color: #f9f9f9;
    border-radius: 15px;
    padding: 5px 15px;
}

#img-background {
    border-radius: 12px;
    max-width: 350px;
    max-height: 350px;
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

.form-control {
    border: 1px solid #f2f4f7;
    box-shadow: 0px 1px 2px 0px #1018280d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    color: black;
}

.form-control.is-invalid {
    border-color: #dc3545;
}

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
    margin-top: 4px;
}

.form-label {
    font-weight: 500;
    margin-bottom: 6px;
    color: #374151;
}

/* Modal Styles */
.modal {
    display: block;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(255, 255, 255, 0.459);
    background-color: rgba(0, 0, 0, 0.4);
}

.modal-content {
    background-color: #fefefe;
    margin: 5% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    height: 75%;
}

.warn-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 670px;
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

/* Shake animation for warning line */
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

/** Tablet */
@media (min-width: 786px) {
    .hr-border {
        display: none;
    }
}
</style>
