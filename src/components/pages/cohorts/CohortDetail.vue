<script>
import FilterParent from '../../components/filter-system/FilterParent.vue';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            showFilters: false,
            showMembers: false,
            students: [],
            unavailableStudents: [],
            members: [],
        };
    },
    async created() {
        await this.getMembers();
        await this.getUnavailableStudents();
        if (this.students.length == 0) await this.getStudents();
    },
    components: {
        FilterParent
    },
    props: {
        cohort: {
            type: Object,
            required: true
        }
    },
    methods: {
        async getMembers() {
            fetch(`/cohorts/${this.cohort.id}/members`)
                .then((response) => response.json())
                .then((data) => {
                    this.members = data;
                });
        },
        async getUnavailableStudents() {
            fetch(`/cohorts/unavailable/${this.cohort.id}/list`)
                .then((response) => response.json())
                .then((data) => {
                    this.unavailableStudents = data;
                });
        },
        async getStudents() {
            fetch(`/instructor-students/${this.userDetailsStore.userId}/list`)
                .then((response) => response.json())
                .then((data) => {
                    this.students = data;
                    // Show which students are already part of this cohort.
                    for (let i = 0; i < this.students.length; i++) {
                        this.students[i].isMember = this.members.some(
                            (member) => member.id === this.students[i].id
                        );
                        // Show which students are part of another cohort.
                        this.students[i].unavailable = this.unavailableStudents.some(
                            (unavailable) =>
                                unavailable.user_id === this.students[i].id
                        );
                    }
                });
        },
        submit() {
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
            fetch(`/cohorts/edit/${this.cohort.id}`, requestOptions).then(() => {
                if (index + 1 < this.students.length) {
                    this.updateCohortMembers(index + 1);
                } else {
                    alert('Cohort updated');
                    this.getMembers();
                }
            });
        },
        async deleteCohort() {
            if (confirm('Are you sure you want to delete this cohort?')) {
                if (this.members.length > 0) {
                    alert(
                        'Please remove all members from this cohort before deleting it.'
                    );
                } else {
                    const result = await fetch(`/cohorts/${this.cohort.id}`, {
                        method: 'DELETE'
                    });

                    if (result.error) {
                        console.error(result.error);
                    }

                    this.$router.push('/cohorts');
                }
            }
        }
    }
};
</script>

<template>
    <div class="cohort-detail">
        <h2>{{ cohort.name }}</h2>
        <div>
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
                        <h2 class="secondary-heading h4">Available Students</h2>
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
        <router-link :to="'/cohort/' + cohort.id" class="btn primary-btn">
            Go to Cohort
        </router-link>
    </div>
</template>

<style scoped>
.cohort-detail {
    display: flex;
    flex-direction: column;
    gap: 20px;
    border: 1px solid #ccc;
    height: 100%;
    padding: 16px;
    border-radius: 8px;
    background-color: #f9f9f9;
}
h2{
    word-wrap: break-word;
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


@media (max-width: 480px) {
    .cohort-detail {
        padding: 20px;
        font-size: 1.2rem;
        margin: 10px;
        word-wrap: break-word;
        word-break: break-word;
    }

    h2 {
        font-size: 1.5rem;
        margin-bottom: 10px;
        word-wrap: break-word;
    }

    p {
        font-size: 1rem;
        margin-bottom: 10px;
    }

    ul {
        padding-left: 20px;
        margin-top: 10px;
    }

    ul li {
        font-size: 1rem;
        margin-bottom: 8px;
    }

    .btn {
        font-size: 1rem;
        padding: 12px 20px;
        display: block;
    }
}
</style>
