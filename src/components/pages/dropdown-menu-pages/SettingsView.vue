<script lang="ts">
import ThemeDetails from '../../components/profile-page/ThemeDetails.vue';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSessionDetailsStore } from '../../../stores/SessionDetailsStore.js';
import { useUsersStore } from '../../../stores/UsersStore';
import { useTenantStore } from '../../../stores/TenantStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const sessionDetailsStore = useSessionDetailsStore();
        const userStore = useUsersStore();
        const tenantStore = useTenantStore();
        userDetailsStore.getUserDetails();
        userStore.getInstructors();
        return {
            userDetailsStore,
            sessionDetailsStore,
            userStore,
            tenantStore
        };
    },
    data() {
        return {
            instructorID: this.userDetailsStore.instructorId,
            selectedInstructorName: '',
            showWarnModal: false,
            isEditing: false,
            isAudioAutoPlay: Boolean(this.userDetailsStore.isAudioAutoPlay),
            canStudentsAccessBilling: null
        };
    },
    components: {
        ThemeDetails
    },
    async mounted() {
        // Initialize isAudioAutoPlay from the user details store
        this.isAudioAutoPlay = Boolean(this.userDetailsStore.isAudioAutoPlay);

        if (this.userDetailsStore.role == 'school_admin')
            // Get settings on the tenant for school admins
            await this.getTenantSettings();
    },
    methods: {
        isInstructorLocked() {
            return (
                this.userDetailsStore.role === 'student' &&
                this.userDetailsStore.instructorId &&
                this.userDetailsStore.instructorId.trim() !== ''
            );
        },
        async updateInstructor(selectedInstructorId) {
            // Prevent update if the student already has an instructor assigned
            if (this.isInstructorLocked()) {
                return;
            }
            try {
                const reqOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instructor_id: selectedInstructorId
                    })
                };
                await fetch(
                    `/users/${this.userDetailsStore.userId}/edit/instructor`,
                    reqOptions
                );
                this.userDetailsStore.getUserDetails(); // Refresh user details after update
                this.isEditing = false; // Close the editing state
                this.showWarnModal = false; // Close the modal
            } catch (error) {
                console.error('Error updating instructor:', error);
            }
        },
        cancelEdit() {
            this.isEditing = false;
        },
        handleInstructorChange(e) {
            this.instructorID = e.target.value;
            this.selectedInstructorName =
                e.target.options[e.target.selectedIndex].text;
        },
        async toggleAutoPlay() {
            // Toggle the auto-play setting
            await this.userDetailsStore.updateAudioAutoPlay(
                this.isAudioAutoPlay
            );
        },
        // School admin role only
        async getTenantSettings() {
            await this.tenantStore.getTenantDetails(
                this.userDetailsStore.tenantId
            );

            if (this.tenantStore.canStudentsAccessBilling == 1) {
                this.canStudentsAccessBilling = true;
            } else {
                this.canStudentsAccessBilling = false;
            }
        },
        async toggleStudentsAccessBilling() {
            try {
                let can_students_access_billing: number;
                if (this.canStudentsAccessBilling == true) {
                    can_students_access_billing = 1;
                } else {
                    can_students_access_billing = 0;
                }
                const reqOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        can_students_access_billing: can_students_access_billing
                    })
                };
                await fetch(
                    `/tenants/${this.userDetailsStore.tenantId}/edit`,
                    reqOptions
                );
            } catch (error) {
                console.error('Error updating instructor:', error);
            }
        }
    },
    watch: {
        'userDetailsStore.isAudioAutoPlay': function (newValue) {
            this.isAudioAutoPlay = Boolean(newValue);
        }
    }
};
</script>

<template>
    <div class="container legend-div">
        <div class="mt-2 d-flex row gap-4 justify-content-between">
            <!-- Students only -->
            <div class="form" v-if="userDetailsStore.role === 'student'">
                <!-- Instructor -->
                <div class="profile-input">
                    <div>
                        <h2 class="secondary-heading h4 white-heading">
                            Instructor
                        </h2>
                        <div v-if="!isEditing">
                            <input
                                type="text"
                                class="form-control"
                                readonly
                                :value="
                                    userDetailsStore.instructorUsername ||
                                    'No instructor chosen'
                                "
                            />
                            <div class="mt-2" v-if="!isInstructorLocked()">
                                <button
                                    class="btn primary-btn"
                                    @click="isEditing = true"
                                >
                                    Edit
                                </button>
                            </div>
                        </div>
                        <div v-else>
                            <div class="profile-input">
                                <select
                                    v-model="instructorID"
                                    class="form-select"
                                    @change="handleInstructorChange"
                                >
                                    <option value="" selected disabled>
                                        Please choose an instructor
                                    </option>
                                    <option
                                        v-for="instructor in userStore.instructors"
                                        :key="instructor.id"
                                        :value="instructor.id"
                                    >
                                        {{ instructor.username }}
                                    </option>
                                </select>
                            </div>
                            <div class="mt-2 d-flex gap-2">
                                <button class="btn red-btn" @click="cancelEdit">
                                    Cancel
                                </button>
                                <button
                                    class="btn primary-btn"
                                    @click="showWarnModal = true"
                                >
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ThemeDetails />
            <!-- Students only -- Auto-Play Setting -->
            <div
                class="profile-input"
                v-if="userDetailsStore.role === 'student'"
            >
                <h2 class="secondary-heading h4 mb-3 white-heading">
                    AI Assistant Settings
                </h2>
                <div class="setting-container d-flex align-items-center">
                    <!-- Custom Toggle Switch -->
                    <div class="toggle-switch-container me-3">
                        <label class="toggle-switch">
                            <input
                                type="checkbox"
                                v-model="isAudioAutoPlay"
                                @change="toggleAutoPlay"
                                class="toggle-input"
                            />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="d-flex align-items-center">
                        <span class="setting-label">
                            Auto-play AI tutor speech
                        </span>
                    </div>
                </div>
            </div>
            <!-- School admins only -->
            <div v-if="userDetailsStore.role === 'school_admin'">
                <div class="setting-container d-flex align-items-center">
                    <!-- Custom Toggle Switch -->
                    <div class="toggle-switch-container me-3">
                        <label class="toggle-switch">
                            <input
                                type="checkbox"
                                v-model="canStudentsAccessBilling"
                                @change="toggleStudentsAccessBilling"
                                class="toggle-input"
                            />
                            <span class="toggle-slider"></span>
                        </label>
                    </div>

                    <div class="d-flex align-items-center">
                        <span class="setting-label">
                            Allow students to access billing page
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- Modal to show student if they are sure with they decision -->
    <div v-if="showWarnModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="warn-content d-flex flex-column">
                <div class="d-flex flex-row">
                    <div class="me-3">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="35"
                            height="35"
                            fill="#eed888"
                        >
                            <path
                                d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
                            />
                        </svg>
                    </div>
                    <div>
                        You can only choose your instructor once. Are you sure
                        you want &nbsp;
                        <span id="instructor-name-text">
                            {{ selectedInstructorName }}
                        </span>
                        &nbsp; to be your instructor.
                    </div>
                </div>
                <div class="d-flex flex-row-reverse gap-2">
                    <button
                        class="btn primary-btn"
                        @click="updateInstructor(instructorID)"
                    >
                        Yes
                    </button>
                    <button class="btn red-btn" @click="showWarnModal = false">
                        No
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.legend-div {
    width: 100%;
    z-index: 2;
    top: 80px;
}

.profile-input {
    width: '100%';
    max-width: 300px;
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

/* Custom toggle switch styling */
.toggle-switch-container {
    display: inline-block;
}

.toggle-switch {
    position: relative;
    display: inline-block;
    width: 60px;
    height: 30px;
    margin: 0;
}

.toggle-switch .toggle-input {
    opacity: 0;
    width: 0;
    height: 0;
}

.toggle-slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;
}

.toggle-slider:before {
    position: absolute;
    content: '';
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
}

.toggle-input:checked + .toggle-slider {
    background-color: #1f57c3; /* Default theme color */
}

.toggle-input:checked + .toggle-slider:before {
    transform: translateX(30px);
}

/* Theme-specific toggle colors */
.instructor-theme .toggle-input:checked + .toggle-slider {
    background-color: #31315f; /* Instructor theme color */
}

.editor-theme .toggle-input:checked + .toggle-slider {
    background-color: #7f1e1e; /* Editor theme color */
}
.editor-theme .setting-label {
    color: white;
}

#instructor-name-text {
    font-style: italic;
    color: #1f57c3;
    background-color: #f9f9f9;
    border-radius: 15px;
    padding: 5px 15px;
}

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

.warn-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 670px;
    /* Could be more or less, depending on screen size */
}

.modal-message {
    font-size: 20px;
    font-weight: 500;
    color: #667085;
}
</style>
