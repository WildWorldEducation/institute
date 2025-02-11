<script lang="ts">
import ThemeDetails from '../components/profile-page/ThemeDetails.vue';
import { useUserDetailsStore } from '../../stores/UserDetailsStore';
import { useSessionDetailsStore } from '../../stores/SessionDetailsStore.js';
import { useUsersStore } from '../../stores/UsersStore';

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
            instructorName: this.userDetailsStore.instructorUsername,
            showDropDown: false,
            isEditing: false
        };
    },
    components: {
        ThemeDetails
    },
    methods: {
        async updateInstructor() {
            if (!this.instructorID) return;

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
                this.userDetailsStore.getUserDetails();
                this.isEditing = false;
            } catch (error) {
                console.error('Error updating instructor:', error);
            }
        },
        cancelEdit() {
            this.isEditing = false;
            this.showDropDown = false;
        }
    }
};
</script>

<template>
    <div class="container legend-div">
        <div class="mt-2 d-flex row gap-2 justify-content-between">
            <div class="form" v-if="userDetailsStore.role === 'student'">
                <!-- Instructor -->
                <div
                    v-if="userDetailsStore.instructorUsername"
                    class="profile-input"
                >
                    <div>
                        <h2 class="secondary-heading h4">Instructor</h2>
                        <div v-if="!isEditing">
                            <input
                                type="text"
                                class="form-control"
                                readonly
                                v-model="userDetailsStore.instructorUsername"
                            />
                            <div class="mt-2">
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
                                >
                                    <option disabled>
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
                                <button
                                    class="btn primary-btn"
                                    @click="updateInstructor"
                                >
                                    Submit
                                </button>
                                <button class="btn red-btn" @click="cancelEdit">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ThemeDetails />
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
</style>
