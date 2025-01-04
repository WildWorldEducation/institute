<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import { useUsersStore } from '../../stores/UsersStore';
import SkillEditComparison from '../components/edit-comparisons/SkillEditComparison.vue';
import MCQuestionEditComparison from '../components/edit-comparisons/MCQuestionEditComparison.vue';
import EssayQuestionEditComparison from '../components/edit-comparisons/EssayQuestionEditComparison.vue';
import ImageQuestionEditComparison from '../components/edit-comparisons/ImageQuestionEditComparison.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const usersStore = useUsersStore();
        return {
            userDetailsStore,
            usersStore
        };
    },
    data() {
        return {
            type: null,
            disableBtn: false,
            userThatSubmittedEdit: {
                id: this.$route.params.userId,
                username: null,
                reputationScore: null
            },

            showReputationModal: false
        };
    },
    components: {
        SkillEditComparison,
        MCQuestionEditComparison,
        EssayQuestionEditComparison,
        ImageQuestionEditComparison
    },
    async created() {
        await this.getUserThatSubmittedEditDetails();
        console.log(this.userThatSubmittedEdit);
        // Show the correct component.
        this.type = this.$route.query.type;
    },
    methods: {
        async getUserThatSubmittedEditDetails() {
            if (this.usersStore.users.length == 0)
                await this.usersStore.getUsers();
            // Get the student's details.
            for (let i = 0; i < this.usersStore.users.length; i++) {
                if (
                    this.userThatSubmittedEdit.id == this.usersStore.users[i].id
                ) {
                    this.userThatSubmittedEdit.username =
                        this.usersStore.users[i].username;
                    this.userThatSubmittedEdit.reputationScore =
                        this.usersStore.users[i].reputation_score;
                }
            }
        },
        increaseUserReputation() {
            this.showReputationModal = false;
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            };

            var url =
                '/users/increase-reputation/' +
                this.userDetailsStore.userId +
                '/' +
                this.userThatSubmittedEdit.id;

            fetch(url, requestOptions).then(() => {
                this.$refs.child.saveEdit();
            });
        }
    }
};
</script>

<template>
    <div class="container-fluid">
        <SkillEditComparison ref="child" v-if="type == 'skill'" />
        <MCQuestionEditComparison ref="child" v-if="type == 'mcquestion'" />
        <EssayQuestionEditComparison
            ref="child"
            v-if="type == 'essayquestion'"
        />
        <ImageQuestionEditComparison
            ref="child"
            v-if="type == 'imagequestion'"
        />
        <div class="d-flex justify-content-end gap-2">
            <button
                :disabled="disableBtn"
                :class="['btn', disableBtn ? 'disable-btn' : 'red-btn']"
                @click="$refs.child.dismissEdit()"
            >
                Dismiss Edit
            </button>
            <button
                :disabled="disableBtn"
                :class="['btn', disableBtn ? 'disable-btn' : 'primary-btn']"
                @click="$refs.child.edit()"
            >
                Edit
            </button>
            <button
                :disabled="disableBtn"
                :class="['btn', disableBtn ? 'disable-btn' : 'green-btn']"
                @click="showReputationModal = true"
            >
                Save Edit
            </button>
        </div>
        <p>&nbsp;</p>
    </div>

    <!-- Reputation modal -->
    <div v-if="showReputationModal" class="modal">
        <div class="modal-content">
            <div>
                <p>
                    Give {{ userThatSubmittedEdit.username }} a reputation
                    point?
                </p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="increaseUserReputation()"
                    >
                        yes
                    </button>
                    <button
                        class="btn primary-btn"
                        @click="$refs.child.saveEdit()"
                    >
                        no
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
:deep(.green-btn) {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    height: 44px;
}

:deep(.green-btn:hover) {
    background-color: #31a797;
}

:deep(.compare-container-tile) {
    color: var(--primary-color);
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 22px;
}

.disable-btn {
    background-color: #707281;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    height: 44px;
}

/* Modal */
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
}

.modal-message {
    font-size: 20px;
    font-weight: 500;
    color: #667085;
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    /* Modal Content/Box */
    .modal-content {
        width: 90%;
        margin-top: 5%;
    }
}
</style>
