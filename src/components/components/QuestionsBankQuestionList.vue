<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';

export default {
    props: ['isMultipleChoice', 'isEssay'],
    setup() {
        const userDetailsStore = useUserDetailsStore();

        return {
            userDetailsStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.id,
            mcQuestions: [],
            essayQuestions: [],
            imageQuestions: [],
            // Because we handle delete for each type of question in two separate function
            // So we will have two different modal
            showMCModal: false,
            showEssayModal: false,
            showImageModal: false,
            // Flag to store question ID
            questionID: null
        };
    },
    computed: {},
    created() {
        this.getMCQuestions();
        this.getEssayQuestions();
        this.getImageQuestions();
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
        getImageQuestions() {
            fetch('/skills/' + this.skillId + '/image-questions/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.imageQuestions = data;
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
        },
        async deleteImageQuestion(id) {
            const result = fetch('/questions/image/' + id, {
                method: 'DELETE'
            });

            if (result.error) {
                console.log(result.error);
            } else {
                // Refresh the question list.
                this.getImageQuestions();
            }
        }
    }
};
</script>

<template>
    <div class="container-fluid">
        <div class="row">
            <div
                id="multiple-choice-column"
                class="col-12 col-md-10 col-lg-6 ps-0 pe-0 pe-lg-4"
            >
                <h2 class="question-type">Multiple Choice</h2>
                <table
                    v-if="isMultipleChoice"
                    class="skilltree-table table-bordered"
                >
                    <tr v-for="question in mcQuestions">
                        <td>
                            {{ question.name }}
                        </td>
                        <td class="question-data-cell">
                            {{ question.question }}
                        </td>
                        <td>
                            <router-link
                                :to="'/mc-questions/edit/' + question.id"
                                class="btn purple-btn p-2"
                                role="button"
                                :title="'Edit ' + question.name"
                                ><svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="15"
                                    height="15"
                                    fill="white"
                                >
                                    <path
                                        d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"
                                    />
                                </svg>
                            </router-link>
                        </td>
                        <td v-if="userDetailsStore.role == 'admin'">
                            <button
                                type="button"
                                @click="
                                    questionID = question.id;
                                    showMCModal = true;
                                "
                                class="btn btn red-btn p-2"
                                :title="'Delete ' + question.name"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="15"
                                    height="15"
                                    fill="white"
                                >
                                    <path
                                        d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                                    />
                                </svg>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div
                class="col-12 col-md-10 col-lg-6 ps-0 pe-0 ps-lg-4 mt-4 mt-lg-0"
            >
                <h2 class="question-type">Essay</h2>
                <table v-if="isEssay" class="skilltree-table table-bordered">
                    <tr v-for="question in essayQuestions">
                        <td>
                            {{ question.name }}
                        </td>
                        <td class="question-data-cell">
                            {{ question.question }}
                        </td>
                        <td>
                            <router-link
                                :to="'/essay-questions/edit/' + question.id"
                                class="btn purple-btn p-2"
                                role="button"
                                :title="'Edit ' + question.name"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="15"
                                    height="15"
                                    fill="white"
                                >
                                    <path
                                        d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"
                                    />
                                </svg>
                            </router-link>
                        </td>
                        <td v-if="userDetailsStore.role == 'admin'">
                            <button
                                type="button"
                                @click="
                                    questionID = question.id;
                                    showEssayModal = true;
                                "
                                class="btn red-btn p-2"
                                :title="'Delete ' + question.name"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="15"
                                    height="15"
                                    fill="white"
                                >
                                    <path
                                        d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                                    />
                                </svg>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="row">
            <div class="col-12 col-md-10 col-lg-6 ps-0 pe-0 pe-lg-4">
                <h2 class="question-type">Image</h2>
                <table v-if="isEssay" class="skilltree-table table-bordered">
                    <tr v-for="question in imageQuestions">
                        <td>
                            {{ question.name }}
                        </td>
                        <td class="question-data-cell">
                            {{ question.question }}
                        </td>
                        <td>
                            <router-link
                                :to="'/image-questions/edit/' + question.id"
                                class="btn purple-btn p-2"
                                role="button"
                                :title="'Edit ' + question.name"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="15"
                                    height="15"
                                    fill="white"
                                >
                                    <path
                                        d="M410.3 231l11.3-11.3-33.9-33.9-62.1-62.1L291.7 89.8l-11.3 11.3-22.6 22.6L58.6 322.9c-10.4 10.4-18 23.3-22.2 37.4L1 480.7c-2.5 8.4-.2 17.5 6.1 23.7s15.3 8.5 23.7 6.1l120.3-35.4c14.1-4.2 27-11.8 37.4-22.2L387.7 253.7 410.3 231zM160 399.4l-9.1 22.7c-4 3.1-8.5 5.4-13.3 6.9L59.4 452l23-78.1c1.4-4.9 3.8-9.4 6.9-13.3l22.7-9.1v32c0 8.8 7.2 16 16 16h32zM362.7 18.7L348.3 33.2 325.7 55.8 314.3 67.1l33.9 33.9 62.1 62.1 33.9 33.9 11.3-11.3 22.6-22.6 14.5-14.5c25-25 25-65.5 0-90.5L453.3 18.7c-25-25-65.5-25-90.5 0zm-47.4 168l-144 144c-6.2 6.2-16.4 6.2-22.6 0s-6.2-16.4 0-22.6l144-144c6.2-6.2 16.4-6.2 22.6 0s6.2 16.4 0 22.6z"
                                    />
                                </svg>
                            </router-link>
                        </td>
                        <td v-if="userDetailsStore.role == 'admin'">
                            <button
                                type="button"
                                @click="
                                    questionID = question.id;
                                    showImageModal = true;
                                "
                                class="btn red-btn p-2"
                                :title="'Delete ' + question.name"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="15"
                                    height="15"
                                    fill="white"
                                >
                                    <path
                                        d="M170.5 51.6L151.5 80h145l-19-28.4c-1.5-2.2-4-3.6-6.7-3.6H177.1c-2.7 0-5.2 1.3-6.7 3.6zm147-26.6L354.2 80H368h48 8c13.3 0 24 10.7 24 24s-10.7 24-24 24h-8V432c0 44.2-35.8 80-80 80H112c-44.2 0-80-35.8-80-80V128H24c-13.3 0-24-10.7-24-24S10.7 80 24 80h8H80 93.8l36.7-55.1C140.9 9.4 158.4 0 177.1 0h93.7c18.7 0 36.2 9.4 46.6 24.9zM80 128V432c0 17.7 14.3 32 32 32H336c17.7 0 32-14.3 32-32V128H80zm80 64V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16zm80 0V400c0 8.8-7.2 16-16 16s-16-7.2-16-16V192c0-8.8 7.2-16 16-16s16 7.2 16 16z"
                                    />
                                </svg>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <div v-if="showMCModal">
            <div id="myModal" class="modal">
                <!-- Modal content -->
                <div class="modal-content">
                    <p>Are you sure you want to delete this question ?</p>
                    <div style="display: flex; gap: 10px; justify-content: end">
                        <button
                            type="button"
                            class="btn red-btn"
                            @click="
                                showMCModal = false;
                                deleteMCQuestion(questionID);
                            "
                        >
                            Yes
                        </button>
                        <button
                            type="button"
                            class="btn green-btn"
                            @click="showMCModal = false"
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showEssayModal">
            <div id="myModal" class="modal">
                <!-- Modal content -->
                <div class="modal-content">
                    <p>Are you sure you want to delete this question ?</p>
                    <div style="display: flex; gap: 10px; justify-content: end">
                        <button
                            type="button"
                            class="btn red-btn"
                            @click="
                                showEssayModal = false;
                                deleteEssayQuestion(questionID);
                            "
                        >
                            Yes
                        </button>
                        <button
                            type="button"
                            class="btn green-btn"
                            @click="showEssayModal = false"
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="showImageModal">
            <div id="myModal" class="modal">
                <!-- Modal content -->
                <div class="modal-content">
                    <p>Are you sure you want to delete this question ?</p>
                    <div style="display: flex; gap: 10px; justify-content: end">
                        <button
                            type="button"
                            class="btn red-btn"
                            @click="
                                showImageModal = false;
                                deleteImageQuestion(questionID);
                            "
                        >
                            Yes
                        </button>
                        <button
                            type="button"
                            class="btn green-btn"
                            @click="showImageModal = false"
                        >
                            No
                        </button>
                    </div>
                </div>
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

.question-data-cell {
    width: 90% !important;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.red-btn:hover {
    background-color: #cc3535;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.green-btn > svg {
    margin-left: 15px;
}

.green-btn:hover {
    background-color: #2ca695;
}
.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.purple-btn:hover {
    background-color: #8f7bd6;
    color: white;
}

/* The Warning Modal */
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
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 300px;
    /* Could be more or less, depending on screen size */
    display: flex;
    justify-content: end;
}
/* | End Of Warning Model Styling | */
</style>
