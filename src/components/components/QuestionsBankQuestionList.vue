<script>
export default {
    props: ['isMultipleChoice', 'isEssay'],
    setup() {},
    data() {
        return {
            skillId: this.$route.params.id,
            mcQuestions: [],
            essayQuestions: []
        };
    },
    computed: {},
    created() {
        this.getMCQuestions();
        this.getEssayQuestions();
    },
    methods: {
        getMCQuestions() {
            fetch('/skills/' + this.skillId + '/mc-questions/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.mcQuestions = data;
                });
        },
        getEssayQuestions() {
            fetch('/skills/' + this.skillId + '/essay-questions/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.essayQuestions = data;
                });
        },
        async deleteMCQuestion(id) {
            const result = fetch('/questions/mc/' + id, {
                method: 'DELETE'
            });

            if (result.error) {
                console.log(result.error);
            } else {
                // Refresh the question list.
                this.getMCQuestions();
            }
        },
        async deleteEssayQuestion(id) {
            const result = fetch('/questions/essay/' + id, {
                method: 'DELETE'
            });

            if (result.error) {
                console.log(result.error);
            } else {
                // Refresh the question list.
                this.getEssayQuestions();
            }
        }
    }
};
</script>

<template>
    <div class="container-fluid">
        <div class="row">
            <div id="multiple-choice-column" class="col-md-6 p-0 m-0">
                <h2 class="question-type">Multiple Choice</h2>
                <table
                    v-if="isMultipleChoice"
                    class="skilltree-table table-bordered"
                >
                    <tr v-for="question in mcQuestions">
                        <td>
                            {{ question.name }}
                        </td>

                        <td>
                            <router-link
                                :to="'/mc-questions/edit/' + question.id"
                                class="btn btn-dark me-2 ci-btn"
                                role="button"
                                >Edit</router-link
                            >
                        </td>
                        <td>
                            <button
                                type="button"
                                @click="deleteMCQuestion(question.id)"
                                class="btn btn-danger delete-btn me-2 ci-btn"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="col-md-6 p-0 m-0">
                <h2 class="question-type">Essay</h2>
                <table v-if="isEssay" class="skilltree-table table-bordered">
                    <tr v-for="question in essayQuestions">
                        <td>
                            {{ question.name }}
                        </td>

                        <td>
                            <router-link
                                :to="'/essay-questions/edit/' + question.id"
                                class="btn btn-dark me-2 ci-btn"
                                role="button"
                                >Edit</router-link
                            >
                        </td>
                        <td>
                            <button
                                type="button"
                                @click="deleteEssayQuestion(question.id)"
                                class="btn btn-danger delete-btn me-2 ci-btn"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
</template>

<style scoped>
.question-type {
    /* Text */

    font-family: 'Poppins';
    font-style: normal;
    font-weight: 900;
    font-size: 28px;
    line-height: 28px;
    /* or 100% */
    display: flex;
    align-items: center;
    color: #8f7bd6;
}
</style>
