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
            members: [],
            showFilters: false
        };
    },
    async created() {
        await this.getCohort();
        await this.getStudents();
        await this.getCohortMembers();
    },
    components: {
        FilterParent
    },
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
        async getStudents() {
            fetch(
                '/instructor-students/' + this.userDetailsStore.userId + '/list'
            )
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.students = data;
                    console.log(this.students);
                });
        },
        async updateCohortMembers() {
            // fetch('/cohorts/' + this.cohortId + '/members')
            //     .then(function (response) {
            //         return response.json();
            //     })
            //     .then((data) => {
            //         this.members = data;
            //     });
        }
    }
};
</script>

<template>
    <div class="container">
        <h1>Cohorts: {{ cohort.name }}</h1>
        <h2>Members</h2>
        <ul>
            <li v-for="student in students">
                {{ student.username }}
                <input type="checkbox" :value="student.id" v-model="members" />
            </li>
        </ul>

        <!-- Filters -->
        <div class="d-flex flex-column">
            <div class="d-flex flex-row justify-content-between">
                <div
                    class="log-type"
                    @click="showFilters = !showFilters"
                    b-on-hover
                    :title="showFilters ? 'collapse' : 'expand'"
                >
                    <div class="d-flex">
                        <h2>Filters</h2>
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
</style>
