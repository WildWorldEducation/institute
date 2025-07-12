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
            members: []
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
                        this.students[i].unavailable =
                            this.unavailableStudents.some(
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
            fetch(`/cohorts/edit/${this.cohort.id}`, requestOptions).then(
                () => {
                    if (index + 1 < this.students.length) {
                        this.updateCohortMembers(index + 1);
                    } else {
                        alert('Cohort updated');
                        this.getMembers();
                    }
                }
            );
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
    <div id="cohort-information" class="container bg-light rounded p-4">
        <h2>{{ cohort.name }}</h2>
        <div class="btn-link-container">
            <router-link :to="'/cohort/' + cohort.id" class="btn primary-btn">
                Go to Cohort
            </router-link>
        </div>
    </div>
</template>

<style scoped>
#cohort-information {
    border: 1px solid var(--primary-color);
    overflow: hidden;
}

.btn-link-container {
    padding-top: 10px;
}

#cohort-information label {
    font-weight: 600;
}
h2 {
    word-wrap: break-word;
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

@media (max-width: 480px) {
    #cohort-information {
        padding: 20px;
        font-size: 1.2rem;
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
