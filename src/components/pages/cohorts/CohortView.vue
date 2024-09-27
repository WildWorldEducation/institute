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
            showFilters: false,
            showMembers: false
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
            let index = 0;
            this.updateCohortMembers(index);
        },
        updateCohortMembers(index) {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    studentId: this.students[index].id,
                    isMember: this.students[index].isMember
                })
            };
            var url = '/cohorts/edit/' + this.cohortId;
            fetch(url, requestOptions).then((response) => {
                if (index + 1 < this.students.length) {
                    index++;
                    this.updateCohortMembers(index);
                } else {
                    alert('Cohort updated');
                    return;
                }
            });
        }
    }
};
</script>

<template>
    <div class="container">
        <h1 class="heading">Cohorts: {{ cohort.name }}</h1>
        <!-- Filters -->
        <div class="d-flex flex-column">
            <div class="d-flex flex-row justify-content-between">
                <div
                    class="log-type"
                    @click="showMembers = !showMembers"
                    b-on-hover
                    :title="showMembers ? 'collapse' : 'expand'"
                >
                    <div class="d-flex">
                        <h2 class="heading">Available Students</h2>
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
                    <p><em>students can only be in one cohort at a time</em></p>
                </div>
            </div>
        </div>
        <div v-if="showMembers">
            <ul>
                <li v-for="student in students">
                    {{ student.username }}
                    <input
                        type="checkbox"
                        :value="student.id"
                        v-model="student.isMember"
                        :disabled="student.unavailable ? true : false"
                    />
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
                        <h2 class="heading">Filters</h2>
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
</template>

<style scoped>
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

.heading {
    color: #a48be7;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
}
</style>
