<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useUsersStore } from '../../../stores/UsersStore';

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
    props: ['updateUserDetails'],
    data() {
        return {
            searchText: '',
            haveResults: false,
            userList: [],
            chooseUser: ''
        };
    },
    async created() {
        if (!this.userDetailsStore.role) {
            this.userDetailsStore.getUserDetails();
        }
        if (
            this.userDetailsStore.role === 'admin' ||
            this.userDetailsStore.role === 'instructor'
        ) {
            if (this.usersStore.users.length < 1) {
                await this.usersStore.getUsers();
            }
            this.userList = this.usersStore.users;
        }
        if (this.userDetailsStore.role === 'editor') {
            if (this.usersStore.editors.length < 1) {
                await this.usersStore.getEditors();
            }
            this.userList = this.usersStore.editors;
        }
        console.log(this.userList);
    },
    methods: {
        findUserFirstChars(searchString) {
            let userResultArray = [];
            console.log(this.userList);
            this.userList.forEach((element) => {
                if (
                    element.username
                        .toLowerCase()
                        .substring(0, searchString.length) === searchString
                ) {
                    userResultArray.push(element);
                }
            });
            console.log(userResultArray);
            return userResultArray;
        },
        findUserWholeString(searchText) {
            let userResultArray = [];
            this.userList.forEach((element) => {
                if (element.username.toLowerCase().includes(searchText)) {
                    userResultArray.push(element);
                }
            });

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
                return this.findUserFirstChars(this.searchText);
            }
            if (this.searchText.length >= 3) {
                return this.findUserWholeString(this.searchText);
            }
        }
    }
};
</script>

<template>
    <!-- Search Feature -->
    <div :class="['search-bar', usersResult.length > 0 && 'have-results']">
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
                id="skill-tree-search-text"
                type="text"
                class="skill-tree-input"
                placeholder="Find Users"
                v-model="searchText"
                v-on:keyup.enter=""
            />
        </div>
        <div class="position-relative">
            <div v-if="usersResult.length" class="search-results">
                <div
                    class="result-row"
                    v-for="user in usersResult"
                    @click="handleChooseResult(user)"
                >
                    {{ user.username }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.search-bar {
    display: flex;
    flex-direction: column;
    border: 1px solid #dce2f2;
    border-radius: 8px;
    width: 450px;
    margin-right: 35px;
    background-color: white;
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
    border-bottom: 1px solid #dce2f2;
    border-right: 1px solid #dce2f2;
    border-left: 1px solid #dce2f2;
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
}

.result-row:hover,
.result-row:focus {
    background-color: #f3f5f6;
    color: black;
}

.result-row:focus {
    border: 1px solid #133b61;
}

.robot-icon {
    margin-left: auto;
    margin-right: 5px;
    background-color: inherit;
    border: none;
}

.robot-icon:hover {
    cursor: pointer;
}

.loading-spinner-div {
    height: fit-content !important;
}

/* Bigger devices ( Tablet ) */
@media (min-width: 481px) and (max-width: 1024px) {
    .search-bar {
        width: 90%;
    }
}

/* Phone view style */
@media (max-width: 480px) {
    .search-bar {
        width: 96%;
        margin-left: auto;
        margin-right: auto;
    }
}
</style>
