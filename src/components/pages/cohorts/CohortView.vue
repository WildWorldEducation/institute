<script>
// Import the store.
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import FilterParent from '../../components/filter-system/FilterParent.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohort: {},
            students: [],
            unavailableStudents: [],
            members: [],
            showFilters: true,
            showMembers: true,
            isLoading: false,
            showSuccessModal: false,
            showDeleteModal: false,
            deleteMessage: '',
            hideOkButton: false
        };
    },
    async created() {
        await this.getCohort();
        await this.getMembers();
        await this.getUnavailableStudents();
        if (this.students.length == 0) await this.getStudents();
    },
    components: {
        FilterParent
    },
    computed: {},
    methods: {
        async getCohort() {
            fetch('/cohorts/' + this.cohortId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.cohort = data;
                });
        },
        async getMembers() {
            fetch('/cohorts/' + this.cohortId + '/members')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.members = data;
                });
        },
        async getUnavailableStudents() {
            fetch('/cohorts/unavailable/' + this.cohortId + '/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.unavailableStudents = data;
                });
        },
        async getStudents() {
            fetch(
                '/instructor-students/' + this.userDetailsStore.userId + '/list'
            )
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.students = data;
                    // Show which students are already part of this cohort.
                    for (let i = 0; i < this.students.length; i++) {
                        this.students[i].isMember = false;
                        for (let j = 0; j < this.members.length; j++) {
                            if (this.students[i].id == this.members[j].id) {
                                this.students[i].isMember = true;
                            }
                        }
                    }

                    // Show which students are a part of another cohort, and hence unavailable.
                    for (let i = 0; i < this.students.length; i++) {
                        this.students[i].unavailable = false;
                        for (
                            let j = 0;
                            j < this.unavailableStudents.length;
                            j++
                        ) {
                            if (
                                this.students[i].id ==
                                this.unavailableStudents[j].user_id
                            ) {
                                this.students[i].unavailable = true;
                            }
                        }
                    }
                });
        },
        submit() {
            this.isLoading = true;
            let index = 0;
            this.updateCohortMembers(index);
        },
        async updateCohortMembers(index) {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: this.students[index].id,
                    isMember: this.students[index].isMember
                })
            };
            var url = '/cohorts/edit/' + this.cohortId;
            fetch(url, requestOptions).then(() => {
                if (index + 1 < this.students.length) {
                    index++;
                    this.updateCohortMembers(index);
                } else {
                    this.getMembers();
                    this.isLoading = false;
                    this.showSuccessModal = true;
                    return;
                }
            });
        },
        openDeleteModal() {
            this.showDeleteModal = true;
            this.deleteMessage = 'Are you sure you want to delete this cohort?';
            this.hideOkButton = false;
        },
        async deleteCohort() {
            if (this.members.length > 0) {
                this.deleteMessage =
                    'Please remove all members from this cohort before deleting it.';
                this.hideOkButton = true;
                return;
            }
            try {
                const result = await fetch(`/cohorts/${this.cohortId}`, {
                    method: 'DELETE'
                });
                if (!result.ok) {
                    console.log(result.error);
                }
                this.showDeleteModal = false;
                this.$router.push('/cohorts');
            } catch (err) {
                console.error(err);
            }
        }
    }
};
</script>

<template>
    <div class="container cohort-page bg-light rounded p-1">
        <span class="d-flex justify-content-between"
            ><h1 class="heading">{{ cohort.name }}</h1>
            <button class="btn red-btn" @click="openDeleteModal">
                Delete
            </button></span
        >
        <!-- Members -->
        <div v-if="isLoading == false">
            <div class="d-flex flex-column">
                <div class="d-flex flex-row justify-content-between">
                    <div
                        class="log-type"
                        @click="showMembers = !showMembers"
                        b-on-hover
                        :title="showMembers ? 'collapse' : 'expand'"
                    >
                        <div class="d-flex">
                            <h2 class="secondary-heading h4">
                                Available Students
                            </h2>
                            <!-- Arrow Icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 320 512"
                                width="22"
                                height="22"
                                fill="#667085"
                                :class="[
                                    showMembers
                                        ? 'arrow-point-down mb-2'
                                        : 'arrow-point-up '
                                ]"
                            >
                                <path
                                    d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"
                                />
                            </svg>
                        </div>
                        <p>
                            <em
                                >Please note that a student can only be in one
                                cohort.</em
                            >
                        </p>
                    </div>
                </div>
            </div>
            <div v-if="showMembers">
                <ul style="list-style: none">
                    <li v-for="student in students">
                        <!-- <input
                        type="checkbox"
                        :value="student.id"
                        v-model="student.isMember"
                        :disabled="student.unavailable ? true : false"
                    /> -->
                        <div class="form-check">
                            <label class="control control-checkbox">
                                <input
                                    type="checkbox"
                                    :value="student.id"
                                    v-model="student.isMember"
                                    :disabled="
                                        student.unavailable ? true : false
                                    "
                                />
                                <div class="control_indicator"></div>
                            </label>
                            <span class="students">{{ student.username }}</span>
                        </div>
                    </li>
                </ul>
                <button class="green-btn btn" @click="submit">Submit</button>
            </div>

            <!-- Filters -->
            <div class="d-flex flex-column mt-4">
                <div class="d-flex flex-row justify-content-between">
                    <div
                        class="log-type"
                        @click="showFilters = !showFilters"
                        b-on-hover
                        :title="showFilters ? 'collapse' : 'expand'"
                    >
                        <div class="d-flex">
                            <h2 class="secondary-heading h4">Filters</h2>
                            <!-- Arrow Icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 320 512"
                                width="22"
                                height="22"
                                fill="#667085"
                                :class="[
                                    showFilters
                                        ? 'arrow-point-down mb-2'
                                        : 'arrow-point-up '
                                ]"
                            >
                                <path
                                    d="M182.6 137.4c-12.5-12.5-32.8-12.5-45.3 0l-128 128c-9.2 9.2-11.9 22.9-6.9 34.9s16.6 19.8 29.6 19.8H288c12.9 0 24.6-7.8 29.6-19.8s2.2-25.7-6.9-34.9l-128-128z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <Transition name="dropdown">
                <div v-if="showFilters">
                    <FilterParent />
                </div>
            </Transition>
        </div>

        <!-- Loading animation -->
        <div
            v-if="isLoading == true"
            class="loading-animation d-flex justify-content-center align-items-center py-4"
        >
            <span class="loader"></span>
        </div>
        <!-- Success Modal -->
        <div v-if="showSuccessModal" class="modal">
            <div class="modal-content bg-light">
                <p>Cohort updated</p>
                <button
                    class="btn primary-btn"
                    @click="showSuccessModal = false"
                >
                    close
                </button>
            </div>
        </div>
        <!-- Pending delete Modal -->
        <div v-if="showDeleteModal" class="modal">
            <div class="modal-content bg-light">
                <p>{{ deleteMessage }}</p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn red-btn"
                        @click="showDeleteModal = false"
                    >
                        Close
                    </button>
                    <button
                        class="btn primary-btn"
                        :style="{ display: hideOkButton ? 'none' : 'block' }"
                        @click="deleteCohort"
                    >
                        Ok
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Modals */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 2000;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    /* Modal Content/Box */
    .modal-content {
        width: 90%;
        margin-top: 30%;
    }
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

/* Loading animation */
.loading-animation {
    min-height: 100%;
    position: fixed;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
}
/* End of loading animation */

.cohort-page {
    height: 100%;
    position: relative;
}
/* +-+-+ Rotate Arrow Animation +-+-+  */
.arrow-point-down {
    animation: rotation 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

.arrow-point-up {
    animation: rotationBack 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

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

/* +-+-+ Rotate Arrow Animation +-+-+  */
@keyframes slide {
    0% {
        opacity: 0;
        transform: scaleY(0);
    }

    100% {
        opacity: 1;
        transform: scaleY(1);
    }
}

.dropdown-enter-active {
    transform-origin: top center;
    animation: slide 0.5s;
}
.dropdown-leave-active {
    transform-origin: top center;
    animation: slide 0.5s reverse;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    height: auto;
    align-items: center;
    justify-content: center;
}

.green-btn:hover {
    background-color: #3eb3a3;
    color: white;
}

/**-------------------------------------  */
/* A lot of CSS to styling two check box */
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

.plus-svg:hover {
    cursor: pointer;
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

/* ------------------------------------------------------------- */
.form-check {
    margin: 0px;
    padding: 0px;
}

.students {
    margin-left: 35px;
}
</style>
