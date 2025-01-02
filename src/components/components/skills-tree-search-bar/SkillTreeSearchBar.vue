<script>
import { useSkillsStore } from '../../../stores/SkillsStore';
import { useSkillTreeStore } from '../../../stores/SkillTreeStore';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import LoadingSpinner from '../share-components/LoadingSpinner.vue';
import AiExplainToolTip from './tooltips/AiExplainToolTip.vue';
import AiSearchSuggestToolTip from './tooltips/AiSearchSuggestToolTip.vue';
import LoginWarningToolTip from './tooltips/LoginWarningToolTip.vue';
import TurnOffAiModeToolTip from './tooltips/TurnOffAiModeToolTip.vue';
import TurnOnAiModeToolTip from './tooltips/TurnOnAiModeToolTip.vue';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const skillTreeStore = useSkillTreeStore();
        const userStore = useUserDetailsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            skillsStore,
            userStore,
            userDetailsStore,
            skillTreeStore
        };
    },
    props: ['findNode', 'clearResults', 'skillTreeNode'],
    data: () => {
        return {
            resultsSkills: [],
            aiMode: false,
            searchText: '',
            chooseResult: null,
            waitForSever: false,
            showAiToolTip: false,
            showSuggestAiSearchToolTip: false,
            toolTipStillShowing: false,
            nameList: [],
            isLogin: false,
            focusIndex: -1
        };
    },
    async created() {
        if (this.userDetailsStore.role === 'admin') {
            this.nameList = await this.skillsStore.getNameList();
        } else if (
            this.userDetailsStore.role === 'instructor' ||
            this.userDetailsStore.role === 'editor'
        ) {
            this.nameList = await this.skillsStore.getFilteredNameList();
        } else if (this.userDetailsStore.role === 'student') {
            await this.skillTreeStore.getStudentSkills(
                this.userDetailsStore.userId
            );
            const nodes = {
                children: this.skillTreeStore.studentSkills,
                skillName: 'my skills'
            };

            this.nameList = this.skillTreeStore.convertNodesToArray(nodes);
        }

        this.skillTreeStore.searchResultNodes = this.nameList;

        if (this.userStore.userId) {
            this.isLogin = true;
        }
    },

    methods: {
        getKeyWordResults(searchText) {
            let results = [];
            // search only first work match if search text is less than three
            if (searchText.length < 3) {
                this.searchFirstWord(results, searchText);
            }
            // search for all word in skill name string if search text is greater than three
            else {
                this.searchWholeString(results, searchText);
            }
            this.resultsSkills = this.highlightingResult(results);

            if (
                this.resultsSkills.length === 0 &&
                !this.toolTipStillShowing &&
                searchText.length > 0
            ) {
                this.handleShowAISuggestion();
            }
        },
        handleShowAISuggestion() {
            this.toolTipStillShowing = true;
            setTimeout(() => {
                this.showSuggestAiSearchToolTip = true;
                setTimeout(() => {
                    this.showSuggestAiSearchToolTip = false;
                }, 5000);
            }, 300);
            setTimeout(() => {
                this.toolTipStillShowing = false;
            }, 10000);
        },
        searchFirstWord(results, searchText) {
            this.nameList.forEach((element) => {
                if (
                    element.name
                        .toLowerCase()
                        .substring(0, searchText.length) === searchText
                ) {
                    results.push(element);
                }
            });
        },
        searchWholeString(results, searchText) {
            this.nameList.forEach((element) => {
                if (element.name.toLowerCase().includes(searchText)) {
                    results.push(element);
                }
            });
        },
        highlightingResult(results) {
            // we highlight the part that match search text
            const highlightedResult = results.map((result) => {
                const matchedRegex = new RegExp(`(${this.searchText})`, 'gi');
                const newText = result.name.replace(
                    matchedRegex,
                    '<span class="hightLight">$1</span>'
                );
                return { ...result, highlightedResult: newText };
            });
            return highlightedResult;
        },
        highlightContextResult(results) {
            // we highlight the part that match search text
            const highlightedResult = results.map((result) => {
                const matchedRegex = new RegExp(`(${this.searchText})`, 'gi');
                const newText = result.skill_name.replace(
                    matchedRegex,
                    '<span class="hightLight">$1</span>'
                );
                return {
                    ...result,
                    highlightedResult: newText,
                    name: result.skill_name
                };
            });
            return highlightedResult;
        },
        async getContextResults(searchText) {
            this.waitForSever = true;
            const url = `/skills//find-with-context`;
            const requestOption = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    input: searchText
                })
            };
            const res = await fetch(url, requestOption);
            const ResResults = await res.json();
            // Filter out the result if user is not admin
            const matchedResult = ResResults.filter((skill) => {
                return this.nameList.some((element) => {
                    return (
                        element.name.toLowerCase() ===
                        skill.skill_name.toLowerCase()
                    );
                });
            });

            this.resultsSkills = this.highlightContextResult(matchedResult);

            this.waitForSever = false;
        },
        handleSearchTextChange(searchText) {
            if (!this.aiMode) {
                this.getKeyWordResults(searchText.toLowerCase());
            } else if (this.isLogin) {
                this.checkTextForAi(searchText.toLowerCase());
            }
        },

        async handleChooseResult(result) {
            this.resultsSkills = [];
            this.searchText = result.name;
            this.chooseResult = result;
            this.waitForSever = true;
            await this.findNode(result.name);
            this.waitForSever = false;
        },
        checkTextForAi(searchText) {
            // only context search if user end a word
            if (searchText.length > 3 && !this.waitForSever) {
                this.getContextResults(searchText);
            }
        },
        handleRobotIconClick() {
            this.aiMode = !this.aiMode;

            if (this.aiMode) {
                this.checkTextForAi(this.searchText);
            }
        },

        handleInputEnterPress() {
            // If user is in result row
            if (this.focusIndex >= 0) {
                this.chooseUser = true;
                this.handleChooseResult(this.resultsSkills[this.focusIndex]);
                this.focusIndex = 0;
                return;
            }
            // If user are focus on input text we switch mode
            this.aiMode = !this.aiMode;
            if (this.aiMode) {
                this.checkTextForAi(this.searchText);
            }
        },
        handleKeyDownPress() {
            if (this.focusIndex > this.resultsSkills.length) {
                return false;
            }
            this.focusIndex = this.focusIndex + 1;
            if (this.focusIndex <= this.resultsSkills.length) {
                this.$refs.results[this.focusIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        },
        handleKeyUpPress() {
            if (this.focusIndex <= -1) {
                return false;
            }
            this.focusIndex = this.focusIndex - 1;
            if (this.focusIndex > -1) {
                this.$refs.results[this.focusIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }
    },
    components: {
        LoadingSpinner,
        AiExplainToolTip,
        AiSearchSuggestToolTip,
        TurnOffAiModeToolTip,
        TurnOnAiModeToolTip,
        LoginWarningToolTip
    },

    watch: {
        // We use watcher instead of compute because we made API call
        searchText: {
            handler(newVal) {
                if (!this.isLogin) {
                    this.showAiToolTip = true;
                    setTimeout(() => {
                        this.showAiToolTip = false;
                    }, 2000);
                    return false;
                }
                if (this.chooseResult) {
                    this.chooseResult = null;
                } else {
                    this.handleSearchTextChange(newVal);
                }
                if (newVal.length === 0) {
                    this.resultsSkills = [];
                    this.showSuggestAiSearchToolTip = false;
                    this.showAiToolTip = false;
                    this.clearResults();
                }
            }
        }
    }
};
</script>

<template>
    <!-- Search Feature -->
    <div :class="['search-bar', resultsSkills.length > 0 && 'have-results']">
        <div class="d-flex align-items-center p-1">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width="15"
                height="15"
                fill="#5f6368"
                class="me-2"
            >
                <path
                    d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                />
            </svg>
            <input
                id="skill-tree-search-text"
                type="text"
                class="skill-tree-input"
                placeholder="Search"
                v-model="searchText"
                @keyup.enter="handleInputEnterPress"
                @keyup.arrow-down="handleKeyDownPress"
                @keyup.arrow-up="handleKeyUpPress"
                autocomplete="off"
            />
            <button
                class="robot-icon"
                @click="handleRobotIconClick()"
                @mouseover="showAiToolTip = true"
                @mouseleave="showAiToolTip = false"
            >
                <svg
                    v-if="!waitForSever"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 640 512"
                    height="20"
                    width="20"
                    :fill="aiMode ? '#0f172a' : '#cbd5e1'"
                >
                    <path
                        d="M320 0c17.7 0 32 14.3 32 32l0 64 120 0c39.8 0 72 32.2 72 72l0 272c0 39.8-32.2 72-72 72l-304 0c-39.8 0-72-32.2-72-72l0-272c0-39.8 32.2-72 72-72l120 0 0-64c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224l16 0 0 192-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0-192 16 0z"
                    />
                </svg>
                <div class="loading-spinner-div">
                    <LoadingSpinner
                        v-if="waitForSever"
                        height="22px"
                        width="22px"
                        borderWidth="3px"
                    />
                </div>
            </button>
        </div>
        <div v-if="isLogin" class="position-relative">
            <TurnOnAiModeToolTip v-if="showAiToolTip && !aiMode" />
            <TurnOffAiModeToolTip v-if="showAiToolTip && aiMode" />
            <AiSearchSuggestToolTip v-if="showSuggestAiSearchToolTip" />
        </div>
        <div v-else class="position-relative">
            <LoginWarningToolTip v-if="showAiToolTip" />
        </div>
        <div class="position-relative">
            <div v-if="resultsSkills.length" class="search-results">
                <button
                    v-for="(result, index) in resultsSkills"
                    ref="results"
                    @click="handleChooseResult(result)"
                    class="result-row"
                    :class="index === focusIndex && 'focus-result'"
                    v-html="result.highlightedResult"
                ></button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.search-bar {
    display: flex;
    flex-direction: column;
    border: 3px solid #8c6ce4;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 15px rgba(140, 108, 228, 0.5);
    animation: pulse 2s infinite;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

@keyframes pulse {
    0%,
    100% {
        box-shadow: 0 4px 15px rgba(140, 108, 228, 0.5);
    }
    50% {
        box-shadow: 0 6px 20px rgba(140, 108, 228, 0.8);
    }
}

/* .search-bar:hover {
    transform: scale(1.02);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
} */

.have-results {
    border-bottom: 0px !important ;
    border-bottom-left-radius: 0px;
    border-bottom-right-radius: 0px;
}

.skill-tree-input {
    outline: none;
    border: 0px;
    width: 100%;
    margin-top: 2px;
}

.search-results {
    display: flex;
    flex-direction: column;
    position: absolute;
    top: 0;
    left: -1px;
    border-bottom-left-radius: 8px;
    border-bottom-right-radius: 8px;
    border-bottom: 1px solid black;
    border-right: 1px solid black;
    border-left: 1px solid black;
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

.focus-result {
    border-left: 4px solid #8c6ce4;
    background-color: #f3f5f6;
    color: black;
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
/* @media (min-width: 481px) and (max-width: 1024px) {
    .search-bar {
        width: 90%;
    }
} */

/* Phone view style */
@media (max-width: 480px) {
    .search-bar {
        margin-left: auto;
        margin-right: auto;
        max-width: 260px;
    }
}
</style>
