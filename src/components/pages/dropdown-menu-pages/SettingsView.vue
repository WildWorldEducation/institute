<script lang="ts">
import ThemeDetails from '../../components/profile-page/ThemeDetails.vue';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSessionDetailsStore } from '../../../stores/SessionDetailsStore.js';
import { useUsersStore } from '../../../stores/UsersStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const sessionDetailsStore = useSessionDetailsStore();
        const userStore = useUsersStore();
        userDetailsStore.getUserDetails();
        userStore.getInstructors();
        return {
            userDetailsStore,
            sessionDetailsStore,
            userStore
        };
    },
    data() {
        return {
            instructorID: this.userDetailsStore.instructorId,
            selectedInstructorName: '',
            showWarnModal: false,
            isEditing: false
        };
    },
    components: {
        ThemeDetails
    },
    methods: {
        isInstructorLocked() {
            return (
                this.userDetailsStore.role === 'student' &&
                this.instructorID != null &&
                this.instructorID !== ''
            );
        },
        async updateInstructor() {
            // Prevent update if the student already has an instructor assigned
            if (this.isInstructorLocked()) {
                return;
            }
            try {
                const reqOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        instructor_id: this.instructorID
                    })
                };
                await fetch(
                    `/users/${this.userDetailsStore.userId}/edit/instructor`,
                    reqOptions
                );
                this.userDetailsStore.getUserDetails(); // Refresh user details after update
                this.isEditing = false; // Close the editing state
            } catch (error) {
                console.error('Error updating instructor:', error);
            }
        },
        cancelEdit() {
            this.isEditing = false;
        }
    }
};
</script>

<template>
    <div class="container legend-div">
        <div class="mt-2 d-flex row gap-4 justify-content-between">
            <div class="form" v-if="userDetailsStore.role === 'student'">
                <!-- Instructor -->
                <div class="profile-input">
                    <div>
                        <h2 class="secondary-heading h4">Instructor</h2>
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
                                    @change="
                                        selectedInstructorName =
                                            $event.target.options[
                                                $event.target.selectedIndex
                                            ].text
                                    "
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
                    <div
                        type="button"
                        class="btn primary-btn"
                        @click="updateInstructor"
                    >
                        Yes
                    </div>
                    <div class="btn red-btn" @click="showWarnModal = false">
                        No
                    </div>
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
