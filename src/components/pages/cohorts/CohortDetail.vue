<script>
export default {
    data() {
        return {
            showMembers: false
        };
    },
    // async created() {
    //     await this.getMembers();
    // },
    props: {
        cohort: {
            type: Object,
            required: true
        }
    },
    methods: {
        // async getMembers() {
        //     fetch('/cohorts/' + this.cohortId + '/members')
        //         .then(function (response) {
        //             return response.json();
        //         })
        //         .then((data) => {
        //             this.members = data;
        //             console.log("Fetched members data:", this.members);
        //         });
        // }
    }
};
</script>

<template>
    <div class="cohort-detail">
        <h2>{{ cohort.name }}</h2>
        <div>
            <div class="d-flex flex-column">
                <div class="d-flex flex-row justify-content-between">
                    <div>
                        <div class="d-flex">
                            <h2 class="heading h3">Available Students</h2>
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
            </div>
        </div>
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
