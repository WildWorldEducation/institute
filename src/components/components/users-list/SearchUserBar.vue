<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useUsersStore } from '../../../stores/UsersStore';
import FailsModal from '../share-components/FailsModal.vue';

import LoadingSpinner from '../share-components/LoadingSpinner.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userDetailsStore = useUserDetailsStore();

        // Run the GET request.
        if (usersStore.users.length < 1) usersStore.getUsers();
        return {
            usersStore,
            userDetailsStore
        };
    },
    props: ['updateUserDetails', 'updateUserId'],
    components: {
        LoadingSpinner,
        FailsModal
    },
    data() {
        return {
            searchText: '',
            haveResults: false,
            userList: [],
            chooseUser: '',
            loading: false,
            showFailsModal: false,
            focusIndex: -1,
            modalMessage: ''
        };
    },
    async created() {
        if (!this.userDetailsStore.role) {
            this.userDetailsStore.getUserDetails();
        }
        if (this.userDetailsStore.role === 'admin') {
            if (this.usersStore.users.length < 1) {
                await this.usersStore.getUsers();
            }
            this.userList = this.usersStore.users;
        }

        if (this.userDetailsStore.role === 'instructor') {
            await this.usersStore.getStudentsOfUser(
                this.userDetailsStore.userId
            );
            this.userList = this.usersStore.studentsOfInstructor;
        }
        if (this.userDetailsStore.role === 'editor') {
            if (this.usersStore.editors.length < 1) {
                await this.usersStore.getEditors();
            }
            this.userList = this.usersStore.editors;
        }
        this.focusIndex = -1;
    },
    methods: {
        findUserFirstChars(searchString) {
            let userResultArray = [];

            this.userList.forEach((element) => {
                if (
                    element.username
                        .toLowerCase()
                        .substring(0, searchString.length) === searchString
                ) {
                    userResultArray.push(element);
                }
            });

            this.loading = false;
            return userResultArray;
        },
        findUserWholeString(searchText) {
            let userResultArray = [];
            this.userList.forEach((element) => {
                if (element.username.toLowerCase().includes(searchText)) {
                    userResultArray.push(element);
                }
            });

            this.loading = false;
            return userResultArray;
        },
        handleChooseResult(user) {
            this.searchText = user.username;
            this.chooseUser = user.username;
            const returnUserObject = {
                ...user,
                firstName: user.first_name,
                lastName: user.last_name
            };
            this.updateUserDetails(returnUserObject);

            this.updateUserId(user.id);
        },
        handleInputEnterPress() {
            // find user by arrow key
            if (this.focusIndex >= 0) {
                this.chooseUser = true;
                this.handleChooseResult(this.usersResult[this.focusIndex]);
                this.focusIndex = 0;
                return;
            }
            // find user by search text in result
            const result = this.userList.find((user) => {
                return (
                    user.username.toLowerCase() ===
                    this.searchText.toLowerCase()
                );
            });

            if (!result) {
                this.modalMessage = 'Username doesn`t exist';
                this.showFailsModal = true;
                return;
            }
            this.chooseUser = true;
            this.handleChooseResult(result);
            this.updateUserId(result.id);
        },
        handleFailsOkClick() {
            this.showFailsModal = false;
        },
        handleKeyDownPress() {
            // stop increase if we are at the last result
            if (this.focusIndex === this.usersResult.length) {
                return;
            }
            this.focusIndex = this.focusIndex + 1;
            this.$refs.results[this.focusIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        },
        handleKeyUpPress() {
            // stop decrease if we are at the minus 1 index
            if (this.focusIndex === -1) {
                return;
            }
            this.focusIndex = this.focusIndex - 1;
            this.$refs.results[this.focusIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }
    },
    computed: {
        usersResult() {
            if (this.chooseUser === this.searchText) {
                return [];
            }
            if (this.searchText.length === 0) {
                return [];
            }
            if (this.searchText.length < 3) {
                this.loading = true;
                return this.findUserFirstChars(this.searchText);
            }
            if (this.searchText.length >= 3) {
                this.loading = true;
                return this.findUserWholeString(this.searchText);
            }
        }
    }
};
</script>

<template>
    <!-- Search Feature -->
    <div
        :class="[
            'search-bar',
            usersResult.length > 0 && 'have-results',
            userDetailsStore.role === 'editor' && 'editor-search-bar'
        ]"
    >
        <div class="d-flex align-items-center p-1 my-auto">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width="15"
                height="15"
                fill="#5f6368"
                class="me-2 ms-2"
            >
                <path
                    d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                />
            </svg>
            <input
                autocomplete="off"
                id="skill-tree-search-text"
                type="text"
                class="skill-tree-input"
                placeholder="Find Users"
                v-model="searchText"
                @keyup.enter="handleInputEnterPress"
                @keyup.arrow-down="handleKeyDownPress"
                @keyup.arrow-up="handleKeyUpPress"
            />
        </div>
        <div class="position-relative">
            <div
                id="result-div"
                v-if="usersResult.length && !loading"
                class="search-results"
            >
                <button
                    v-for="(user, index) in usersResult"
                    ref="results"
                    class="result-row"
                    :class="index === focusIndex && 'focus-result'"
                    @click="handleChooseResult(user)"
                >
                    {{ user.username }}
                </button>
            </div>

            <div v-if="loading" class="search-results">
                <LoadingSpinner width="25px" height="25px" />
            </div>
        </div>
    </div>
    <FailsModal
        v-if="showFailsModal"
        :message="modalMessage"
        :handleOkClick="handleFailsOkClick"
    />
</template>

<style scoped>
.search-bar {
    display: flex;
    flex-direction: column;
    border: 1px solid #8c6ce4;
    border-radius: 8px;
    width: 450px;
    margin-right: 45px;
    background-color: white;
}

.editor-search-bar {
    margin-right: 5%;
}

.have-results {
    border-bottom: 0px !important ;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
}

.skill-tree-input {
    outline: none;
    border: 0px;
    width: 100%;
}

.search-results {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: -1px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    border-bottom: 1px solid #8c6ce4;
    border-right: 1px solid #8c6ce4;
    border-left: 1px solid #8c6ce4;
    background-color: white;
    max-height: 400px;
    overflow-y: auto;
    z-index: 1000;
    width: 100.5%;
}

.result-row {
    padding: 4px;
    cursor: pointer;
    color: #6e6e6e;
    background-color: inherit;
    border: 0px;
    text-align: left;
    outline: none;
}

.result-row:hover,
.result-row:focus {
    background-color: #f3f5f6;
    color: black;
}

.result-row:focus {
    border: 1px solid #133b61;
}

.focus-result {
    border-left: 4px solid #8c6ce4;
    background-color: #f3f5f6;
    color: black;
}

.loading-spinner-div {
    height: fit-content !important;
}

/* Bigger devices ( Tablet ) */
@media (min-width: 481px) and (max-width: 1024px) {
    .search-bar {
        width: 45%;
        margin-left: auto;
        margin-right: 3%;
    }

    .editor-search-bar {
        margin-left: auto;
        margin-right: 6%;
    }
}

/* Phone view style */
@media (max-width: 480px) {
    .search-bar {
        width: 70%;
        margin-left: auto;
        margin-right: 0px;
    }

    .editor-search-bar {
        margin-right: auto;
    }
}
</style>
