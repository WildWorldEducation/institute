<script>
import { useSessionDetailsStore } from '../../stores/SessionDetailsStore.js';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';

import SkillTreeSearchBar from '../components/skills-tree-search-bar/SkillTreeSearchBar.vue';
import MyTidyTree from '../components/skilltrees/MyTidyTree.vue';

export default {
    setup() {
        const sessionDetailsStore = useSessionDetailsStore();
        const userDetailsStore = useUserDetailsStore();

        return {
            sessionDetailsStore,
            userDetailsStore
        };
    },
    data() {
        return {
            searchText: '',
            lastChooseResult: '',
            showResult: false,
            showConfirmModal: false,
            // Tutorial tooltips
            isTutorialComplete: false,
            showTutorialTip1: false
        };
    },
    created() {
        for (let i = 0; i < this.userDetailsStore.subjectFilters.length; i++) {
            if (this.userDetailsStore.subjectFilters[i] == 'Language') {
                this.isLanguage = true;
            }
            if (this.userDetailsStore.subjectFilters[i] == 'Mathematics') {
                this.isMathematics = true;
            }
            if (
                this.userDetailsStore.subjectFilters[i] == 'Science & Invention'
            ) {
                this.isScienceAndInvention = true;
            }
            if (this.userDetailsStore.subjectFilters[i] == 'Computer Science') {
                this.isComputerScience = true;
            }
            if (this.userDetailsStore.subjectFilters[i] == 'History') {
                this.isHistory = true;
            }
            if (this.userDetailsStore.subjectFilters[i] == 'Life') {
                this.isLife = true;
            }
            if (this.userDetailsStore.subjectFilters[i] == 'Dangerous Ideas') {
                this.isDangerousIdeas = true;
            }
        }

        this.checkIfTutorialComplete();
    },
    mounted() {
        this.GetGoogleLoginResult();
    },
    components: { MyTidyTree, SkillTreeSearchBar },
    methods: {
        resetPos() {
            this.$refs.childComponent.resetPos();
        },
        async handleChooseResult(resultName) {
            this.lastChooseResult = resultName;
            // Find the node with name
            const node = this.$refs.childComponent.findNodeWithName(resultName);

            if (!node) {
                await this.$refs.childComponent.findHiddenSkill(resultName);
                return false;
            }
            // go to the skill position
            this.$refs.childComponent.goToLocation(node);
        },
        GetGoogleLoginResult() {
            fetch('/google-login-result')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    if (data.account == 'new account')
                        alert('Your account has been created!');
                });
        },
        clearResult() {
            this.$refs.childComponent.resetPos();
        },

        // Tutorial
        async checkIfTutorialComplete() {
            const result = await fetch(
                '/users/check-tutorial-progress/my-tree/' +
                    this.userDetailsStore.userId
            );
            const data = await result.json();
            if (data == 0) {
                this.isTutorialComplete = false;
                this.showTutorialTip1 = true;
            } else if (data == 1) {
                this.isTutorialComplete = true;
            }
        },
        progressTutorial(step) {
            if (step == 1) {
                this.showTutorialTip1 = false;
                this.markTutorialComplete();
            }
        },
        restartTutorial() {
            this.showTutorialTip1 = true;
            this.isTutorialComplete = false;
        },
        markTutorialComplete() {
            let url =
                '/users/mark-tutorial-complete/my-tree/' +
                this.userDetailsStore.userId;
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            };
            fetch(url, requestOptions);
        }
    }
};
</script>

<template>
    <div class="container-fluid position-absolute legend-div">
        <div v-if="sessionDetailsStore.isLoggedIn" class="mobile-legend">
            <div class="search-mobile-row">
                <!-- Search feature -->
                <SkillTreeSearchBar
                    :findNode="handleChooseResult"
                    :clearResults="clearResult"
                />
            </div>
            <div class="d-flex">
                <button class="btn primary-btn" @click="resetPos()">
                    Center
                </button>
            </div>
        </div>
        <div v-if="sessionDetailsStore.isLoggedIn" class="tablet-and-up-legend">
            <div class="d-flex justify-content-between">
                <!-- Search bar, reset, expand all, print buttons -->
                <!-- Search Feature -->
                <SkillTreeSearchBar
                    class="ms-2"
                    :findNode="handleChooseResult"
                    :clearResults="clearResult"
                />
                <div class="d-flex justify-content-end">
                    <!-- Reset Button -->
                    <button class="btn primary-btn me-2" @click="resetPos()">
                        Center
                    </button>
                    <!-- Print Button -->
                    <button
                        class="btn primary-btn me-2"
                        @click="$refs.childComponent.printPDF()"
                    >
                        Print
                    </button>
                    <button class="btn primary-btn" @click="restartTutorial">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 192 512"
                            width="20"
                            height="20"
                            fill="white"
                        >
                            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
        <div v-else class="alert alert-warning" role="alert">
            You cannot interact with the tree until signed in
        </div>
    </div>

    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <MyTidyTree ref="childComponent" />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>

    <!-- Tooltips -->
    <!-- Introduction modal -->
    <div v-if="showTutorialTip1" class="modal">
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>This page shows your skill tree closed.</p>
                <p>
                    Click on the plus signs to open the side panel, then click
                    on the "expand" button to expand the node.
                </p>

                <button class="btn primary-btn" @click="progressTutorial(1)">
                    close
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.switch-btn {
    max-height: 38px;
    margin: auto;
}

.btn:active,
.btn:focus {
    color: var(--primary-contrast-color);
    border: 1px solid black;
}

.legend {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    width: 100%;
}

.legend-div {
    width: 100%;
    z-index: 2;
    top: 70px;
}

/* Modal filters */
.modal .btn {
    width: 200px;
    margin: auto;
}

.have-results {
    border-bottom: 0px !important ;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
}

.skill-tree-input {
    outline: none;
    border: 0px;
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
    /* extremely  weird things when 100% does not match the parent div*/
    width: 100.3%;
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

.mobile-legend {
    display: none;
}

.legend span {
    float: left;
    width: 20px;
    height: 20px;
    margin: 2px;
    border-radius: 50%;
}

.hightLight {
    font-weight: 500;
    color: #9985d1;
    float: none !important;
    width: auto !important;
    height: auto !important;
    margin: 0px !important;
    border-radius: 0px !important;
    border: 0px !important;
}

.bottom-legend-div .btn {
    border: 1px solid black;
    font-weight: 500;
}

.skill-tree-input {
    width: 100%;
}

/* Modals */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 2000;
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

/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    .mobile-legend {
        display: flex;
    }

    .tablet-and-up-legend {
        display: none !important;
    }

    .search-mobile-row {
        margin-left: 0px;
        margin-right: auto;
    }

    /* Modal Content/Box */
    .modal-content {
        width: 90%;
        margin-top: 30%;
    }
}

/* Bigger devices ( Tablet ) */
@media (min-width: 481px) and (max-width: 1024px) {
    .tablet-and-up-legend {
        display: block;
    }
    .legend {
        align-items: center;
    }

    .legend .col {
        display: flex;
    }
    .legend span {
        flex-shrink: 0;
    }
}
/*---*/

.modal-btn {
    width: fit-content;
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
    max-width: fit-content;
}

.green-btn:hover {
    background-color: #3eb3a3;
}
</style>
