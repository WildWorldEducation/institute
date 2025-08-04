<script>
import { RouterLink } from 'vue-router';
import { useSkillsStore } from '../../../stores/SkillsStore.js';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            skillsStore,
            userDetailsStore
        };
    },
    data() {
        return {
            skillUrl: this.$route.params.skillUrl,
            skill: {},
            learningObjectives: [],
            isLoading: true,
            showDeleteModal: false,
            objectiveToDelete: null
        };
    },
    async created() {
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }

        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillUrl == this.skillsStore.skillsList[i].URL) {
                this.skill = this.skillsStore.skillsList[i];
            }
        }
        await this.getLearningObjectives();
    },
    methods: {
        async getLearningObjectives() {
            this.isLoading = true;
            try {
                const response = await fetch(
                    '/skill-learning-objectives/' + this.skill.id + '/list'
                );
                const data = await response.json();
                this.learningObjectives = data;
            } catch (error) {
                console.error('Error fetching learning objectives:', error);
            } finally {
                this.isLoading = false;
            }
        },
        async deleteLearningObjective(objectiveId) {
            try {
                const response = await fetch(
                    `/skill-learning-objectives/${this.skill.id}/${objectiveId}`,
                    {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    }
                );

                const data = await response.json();

                if (response.ok && data.success) {
                    // Refresh the learning objectives list
                    await this.getLearningObjectives();
                } else {
                    console.error(
                        'Error deleting learning objective:',
                        data.message || 'Unknown error'
                    );
                    alert(
                        'Failed to delete learning objective. Please try again.'
                    );
                }
            } catch (error) {
                console.error('Error deleting learning objective:', error);
                alert(
                    'An error occurred while deleting the learning objective. Please try again.'
                );
            }
        }
    }
};
</script>

<template>
    <div class="row px-2 px-lg-2">
        <div class="col d-flex justify-content-between">
            <router-link
                v-if="
                    userDetailsStore.role == 'platform_admin' ||
                    userDetailsStore.role == 'editor'
                "
                class="primary-btn btn"
                :to="'/skills/' + skill.id + '/learning-objectives/add'"
            >
                Add &ThickSpace;
                <!-- Plus sign -->
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M6.34811 20.0423L6.34811 13.6494L-0.0358702 13.6583C-0.320945 13.6579 -0.594203 13.5444 -0.795782 13.3428C-0.997361 13.1412 -1.11082 12.868 -1.11132 12.5829L-1.11729 7.41477C-1.1168 7.1297 -1.00334 6.85644 -0.801757 6.65486C-0.600179 6.45328 -0.326921 6.33982 -0.0418461 6.33933L6.3481 6.34231L6.3481 -0.0506238C6.34659 -0.193451 6.3736 -0.335145 6.42756 -0.467396C6.48152 -0.599646 6.56134 -0.719794 6.66234 -0.820794C6.76334 -0.921794 6.88349 -1.00161 7.01574 -1.05557C7.14799 -1.10953 7.28969 -1.13655 7.43251 -1.13503L12.5827 -1.12308C12.8678 -1.12259 13.141 -1.00913 13.3426 -0.807549C13.5442 -0.60597 13.6577 -0.332713 13.6582 -0.047637L13.6552 6.34231L20.0481 6.34231C20.3325 6.34248 20.6052 6.45552 20.8063 6.65661C21.0074 6.8577 21.1204 7.13039 21.1206 7.41477L21.1325 12.565C21.1324 12.8494 21.0193 13.122 20.8182 13.3231C20.6171 13.5242 20.3444 13.6373 20.0601 13.6374L13.6552 13.6494L13.6641 20.0334C13.6636 20.3184 13.5502 20.5917 13.3486 20.7933C13.147 20.9948 12.8738 21.1083 12.5887 21.1088L7.43252 21.1267C7.28969 21.1282 7.148 21.1012 7.01575 21.0473C6.88349 20.9933 6.76335 20.9135 6.66235 20.8125C6.56135 20.7115 6.48153 20.5913 6.42757 20.4591C6.37361 20.3268 6.34659 20.1851 6.34811 20.0423Z"
                        fill="white"
                    />
                </svg>
            </router-link>
            <!-- Exit Button -->
            <div class="d-flex justify-content-between">
                <RouterLink class="btn red-btn" :to="'/skills/' + skillUrl"
                    >Exit&ThickSpace;
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 512"
                        width="20"
                        height="20"
                        fill="white"
                    >
                        <path
                            d="M208 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM123.7 200.5c1-.4 1.9-.8 2.9-1.2l-16.9 63.5c-5.6 21.1-.1 43.6 14.7 59.7l70.7 77.1 22 88.1c4.3 17.1 21.7 27.6 38.8 23.3s27.6-21.7 23.3-38.8l-23-92.1c-1.9-7.8-5.8-14.9-11.2-20.8l-49.5-54 19.3-65.5 9.6 23c4.4 10.6 12.5 19.3 22.8 24.5l26.7 13.3c15.8 7.9 35 1.5 42.9-14.3s1.5-35-14.3-42.9L281 232.7l-15.3-36.8C248.5 154.8 208.3 128 163.7 128c-22.8 0-45.3 4.8-66.1 14l-8 3.5c-32.9 14.6-58.1 42.4-69.4 76.5l-2.6 7.8c-5.6 16.8 3.5 34.9 20.2 40.5s34.9-3.5 40.5-20.2l2.6-7.8c5.7-17.1 18.3-30.9 34.7-38.2l8-3.5zm-30 135.1L68.7 398 9.4 457.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L116.3 441c4.6-4.6 8.2-10.1 10.6-16.1l14.5-36.2-40.7-44.4c-2.5-2.7-4.8-5.6-7-8.6zM550.6 153.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L530.7 224H384c-17.7 0-32 14.3-32 32s14.3 32 32 32H530.7l-25.4 25.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l80-80c12.5-12.5 12.5-32.8 0-45.3l-80-80z"
                        />
                    </svg>
                </RouterLink>
            </div>
        </div>
    </div>
    <div class="container bg-light rounded p-3">
        <!-- Page Heading  -->
        <h1 class="heading">{{ skill.name }} Learning Objectives</h1>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading learning objectives...</p>
        </div>

        <!-- Learning Objectives table -->
        <div v-else class="container-fluid">
            <div class="row">
                <table class="skilltree-table table-bordered">
                    <thead>
                        <tr>
                            <th class="secondary-heading">#</th>
                            <th class="secondary-heading">
                                Learning Objective
                            </th>
                            <th
                                class="secondary-heading text-start"
                                v-if="
                                    userDetailsStore.role == 'platform_admin' ||
                                    userDetailsStore.role == 'editor'
                                "
                            >
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="learningObjectives.length === 0">
                            <td colspan="3" class="text-center py-4">
                                <p class="text-muted mb-0">
                                    No learning objectives found for this skill.
                                </p>
                            </td>
                        </tr>
                        <tr
                            v-for="(objective, index) in learningObjectives"
                            :key="objective.id"
                        >
                            <th>{{ index + 1 }}</th>
                            <td>{{ objective.objective }}</td>
                            <td
                                v-if="
                                    userDetailsStore.role ===
                                        'platform_admin' ||
                                    userDetailsStore.role === 'editor'
                                "
                                class="d-flex gap-2"
                            >
                                <router-link
                                    :to="`/skills/${skill.id}/learning-objectives/edit/${objective.id}`"
                                    class="btn primary-btn p-2"
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

                                <button
                                    type="button"
                                    class="btn btn red-btn p-2"
                                    @click="
                                        objectiveToDelete = objective;
                                        showDeleteModal = true;
                                    "
                                    :title="'Delete ' + objective.objective"
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
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal">
        <div id="deleteModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <p>Are you sure you want to delete this learning objective?</p>
                <div style="display: flex; justify-content: space-between">
                    <button
                        type="button"
                        class="btn primary-btn"
                        @click="showDeleteModal = false"
                    >
                        No
                    </button>
                    <button
                        type="button"
                        class="btn red-btn"
                        @click="
                            showDeleteModal = false;
                            deleteLearningObjective(objectiveToDelete.id);
                        "
                    >
                        Yes
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
table {
    background-color: white;
    border-radius: 10px;
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
    justify-content: space-between;
    flex-direction: column;
    gap: 20px;
}

.modal-content > div {
    display: flex;
    justify-content: space-between;
}
/* | End Of Warning Model Styling | */
</style>
