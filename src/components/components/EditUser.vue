<script>
// Import the stores.
import { useUsersStore } from '../../stores/UsersStore';
import { useInstructorStudentsStore } from '../../stores/InstructorStudentsStore';
import { Cropper, Preview } from 'vue-advanced-cropper';
import 'vue-advanced-cropper/dist/style.css';
import 'vue-advanced-cropper/dist/theme.compact.css';

export default {
    setup() {
        const usersStore = useUsersStore();
        const instructorStudentsStore = useInstructorStudentsStore();

        return {
            usersStore,
            instructorStudentsStore
        };
    },
    data() {
        return {
            userId: this.$route.params.id,
            user: {},
            image: '',
            instructors: [],
            // Select input bind model
            instructorId: 0,
            instructorName: '',
            // dropdown showing flag
            showRoleDropDown: false,
            showInstructorDropDown: false,
            // Validate Object flag
            validate: {
                first_name: false,
                last_name: false,
                email: false,
                emailFormat: false,
                password: false,
                // this validate is fire when image profile upload is not square
                notSquareImg: false,
                // flag to show warning when cancel crop
                notCropped: false
            },
            // Flag and data of crop image component
            showCropModal: false,
            cropCanvas: '',
            cropResult: {
                coordinates: null,
                image: null
            },
            // Zoom relate state data
            lastZoomValue: 0,
            zoomValue: 0
        };
    },
    components: {
        Cropper,
        Preview
    },
    async mounted() {
        // Run the GET request.
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();

        // Get the instructor student list, if not yet loaded.
        if (this.instructorStudentsStore.instructorStudentsList.length == 0) {
            await this.instructorStudentsStore.getInstructorStudentsList();
        }

        this.getInstructors();
        // get student Instructor name
        if (this.instructorId !== 0) {
            const result = this.instructors.find(
                (instructor) => instructor.id === this.instructorId
            );
            this.instructorName = result.username;
        }
    },
    methods: {
        getUser() {
            fetch('/users/show/' + this.userId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => (this.user = data))
                .then(() => {
                    this.image = this.user.avatar;
                });
        },
        async getInstructors() {
            // Get an array of all instructors.
            for (let i = 0; i < this.usersStore.users.length; i++) {
                if (this.usersStore.users[i].role == 'instructor') {
                    this.instructors.push(this.usersStore.users[i]);
                }
            }
            // To prepopulate the 'instructor' field.
            for (
                let i = 0;
                i < this.instructorStudentsStore.instructorStudentsList.length;
                i++
            ) {
                if (
                    this.instructorStudentsStore.instructorStudentsList[i]
                        .student_id == this.userId
                ) {
                    this.instructorId =
                        this.instructorStudentsStore.instructorStudentsList[
                            i
                        ].instructor_id;
                }
            }

            // Call this after the above, so that instructor field loaded correctly.
            this.getUser();
        },
        ValidateForm() {
            if (this.user.first_name == '' || this.user.first_name == null) {
                this.validate.first_name = true;
            } else if (
                this.user.last_name == '' ||
                this.user.last_name == null
            ) {
                this.validate.last_name = true;
            } else if (this.user.username == '' || this.user.username == null) {
                this.validate.username = true;
            } else if (this.user.email == '' || this.user.email == null) {
                this.validate.email = true;
            } else {
                this.Submit();
            }
        },
        ValidateEmail() {
            if (
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(
                    this.user.email
                )
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
                    firstname: this.user.first_name,
                    lastname: this.user.last_name,
                    username: this.user.username,
                    email: this.user.email,
                    avatar: this.user.avatar,
                    role: this.user.role,
                    password: this.user.password
                })
            };

            var url = '/users/' + this.userId + '/edit';
            fetch(url, requestOptions)
                .then(() => {
                    if (this.user.role == 'student') {
                        const requestOptions = {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                instructor_id: this.instructorId
                            })
                        };
                        var url = '/users/' + this.userId + '/edit/instructor';
                        fetch(url, requestOptions);
                    }
                })
                .then(() => {
                    // refresh user list so the users page will show the update data
                    this.usersStore.getUsers();
                    this.$router.push('/users');
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
            this.user.avatar = this.image;
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
            if (this.validate.notSquareImg) {
                this.validate.notCropped = true;
                setTimeout(() => {
                    this.validate.notCropped = false;
                }, 2000);
            } else {
                this.showCropModal = false;
            }
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
    <div class="container mt-3 pb-5">
        <h1 class="h1-stroke">Edit User</h1>

        <div class="container-fluid main-content-container p-4 mt-5">
            <div class="row">
                <div class="col-lg-4 mt-3">
                    <div class="mb-3 row">
                        <label class="form-label">Avatar</label>
                        <div v-if="!image">
                            <input
                                id="choose-avatar"
                                type="file"
                                accept="image/*"
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
                                    :src="image"
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
                                <button
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
                    </div>
                </div>
                <div class="col-lg-4 mt-3">
                    <div class="mb-3">
                        <label for="firstname" class="form-label"
                            >First name {{ firstName }}</label
                        >
                        <input
                            v-model="user.first_name"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.first_name &&
                                (user.first_name == '' ||
                                    user.first_name == null)
                            "
                            class="form-validate"
                        >
                            please enter a first name !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="lastname" class="form-label"
                            >Last name</label
                        >
                        <input
                            v-model="user.last_name"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.last_name &&
                                (user.last_name == '' || user.last_name == null)
                            "
                            class="form-validate"
                        >
                            please enter a last name !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Username</label>
                        <input
                            v-model="user.username"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.username &&
                                (user.username == '' || user.username == null)
                            "
                            class="form-validate"
                        >
                            please enter a user name !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Email address</label>
                        <input
                            v-model="user.email"
                            type="email"
                            class="form-control"
                            @blur="ValidateEmail"
                        />
                        <div
                            v-if="
                                validate.email &&
                                (user.email == '' || user.email == null)
                            "
                            class="form-validate"
                        >
                            please enter an email !
                        </div>
                        <div v-if="validate.emailFormat" class="form-validate">
                            please enter a valid email !
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Role</label>
                        <!-- Custom Dropdown -->
                        <div class="d-flex flex-column">
                            <div
                                :class="[
                                    showRoleDropDown
                                        ? 'custom-select-button-focus'
                                        : 'custom-select-button'
                                ]"
                                @click="showRoleDropDown = !showRoleDropDown"
                            >
                                {{ user.role }}
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
                            <div
                                v-if="showRoleDropDown"
                                class="custom-dropdown-base"
                            >
                                <div
                                    class="custom-dropdown-option"
                                    @click="
                                        user.role = 'student';
                                        showRoleDropDown = false;
                                    "
                                >
                                    student
                                </div>
                                <div
                                    class="custom-dropdown-option"
                                    @click="
                                        user.role = 'instructor';
                                        showRoleDropDown = false;
                                    "
                                >
                                    instructor
                                </div>
                                <div
                                    class="custom-dropdown-option"
                                    @click="
                                        user.role = 'editor';
                                        showRoleDropDown = false;
                                    "
                                >
                                    editor
                                </div>
                                <div
                                    class="custom-dropdown-option"
                                    @click="
                                        user.role = 'admin';
                                        showRoleDropDown = false;
                                    "
                                >
                                    admin
                                </div>
                            </div>
                        </div>
                        <!-- End of custom dropdown -->
                    </div>
                    <div v-if="user.role == 'student'" class="mb-3">
                        <label class="form-label">Instructor</label>
                        <div class="d-flex flex-column">
                            <div
                                :class="[
                                    showInstructorDropDown
                                        ? 'custom-select-button-focus'
                                        : 'custom-select-button'
                                ]"
                                @click="
                                    showInstructorDropDown =
                                        !showInstructorDropDown
                                "
                            >
                                {{ instructorName }}
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
                            <div
                                v-if="showInstructorDropDown"
                                class="custom-dropdown-base"
                            >
                                <div
                                    v-for="instructor in instructors"
                                    class="custom-dropdown-option"
                                    @click="
                                        instructorId = instructor.id;
                                        instructorName = instructor.username;
                                        showInstructorDropDown = false;
                                    "
                                >
                                    {{ instructor.username }}
                                </div>
                            </div>
                        </div>
                        <!-- End of custom dropdown -->
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Password</label>
                        <input
                            v-model="user.password"
                            type="text"
                            class="form-control"
                        />
                        <div
                            v-if="
                                validate.password &&
                                (user.password == '' || user.password == null)
                            "
                            class="form-validate"
                        >
                            please enter a password !
                        </div>
                    </div>
                    <div class="d-flex justify-content-end gap-4">
                        <router-link class="btn red-btn" to="/users">
                            Cancel
                        </router-link>
                        <button class="btn primary-btn" @click="ValidateForm()">
                            Submit
                        </button>
                    </div>
                </div>
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
