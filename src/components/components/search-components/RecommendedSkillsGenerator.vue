<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useSessionDetailsStore } from '../../../stores/SessionDetailsStore';
import TutorLoadingSymbol from '../ai-tutor/tutorLoadingSymbol.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const sessionDetailsStore = useSessionDetailsStore();
        // Run the GET request.
        userDetailsStore.getUserDetails();
        return {
            userDetailsStore,
            sessionDetailsStore
        };
    },
    data() {
        return {
            query: '',
            recommendedSkillsOrderedByRelevance: [],
            showRecommendedSkills: false,
            waitForAIresponse: false,
            isMobileCheck: window.innerWidth
        };
    },
    components: { TutorLoadingSymbol },
    mounted() {
        // Allow search to accept Enter key
        // Get the input field
        var input = document.getElementById('searchBar');

        // Execute a function when the user presses a key on the keyboard
        input.addEventListener('keypress', function (event) {
            // If the user presses the "Enter" key on the keyboard
            if (event.key === 'Enter') {
                // Not progress if user do not type in any word
                if (this.query === '' || this.query === null) {
                    return;
                }
                // Cancel the default action, if needed
                event.preventDefault();
                // Trigger the button element with a click
                document.getElementById('searchButton').click();
            }
        });
    },

    methods: {
        // For logged in users
        async getRecommendedSkills() {
            this.waitForAIresponse = true;
            if (this.query === '' || this.query === null) {
                return;
            }
            let url = '/skills/get-recommended-skills';
            const requestOption = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userDetailsStore.userId,
                    cohortId: this.userDetailsStore.cohortId,
                    query: this.query
                })
            };
            const result = await fetch(url, requestOption);
            const readableResult = await result.json();
            this.waitForAIresponse = false;

            if (readableResult.length === 0) {
                alert('can`t find any result that match yours need');
                this.showRecommendedSkills = false;

                return;
            }

            this.recommendedSkillsOrderedByRelevance = readableResult;
            this.showRecommendedSkills = true;
        },
        // For guest users
        async getRecommendedSkillsGuestMode() {
            this.waitForAIresponse = true;
            if (this.query === '' || this.query === null) {
                return;
            }
            let url = '/skills/guest-user/get-recommended-skills';
            const requestOption = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: this.userDetailsStore.userId,
                    cohortId: this.userDetailsStore.cohortId,
                    query: this.query
                })
            };
            const result = await fetch(url, requestOption);
            const readableResult = await result.json();
            this.recommendedSkillsOrderedByRelevance = readableResult;
            this.waitForAIresponse = false;

            if (!this.recommendedSkillsOrderedByRelevance) {
                this.showRecommendedSkills = false;
            }
            this.showRecommendedSkills = true;
        },
        removeRecommendedSkill(index) {
            this.recommendedSkillsOrderedByRelevance.splice(index, 1);
        },
        async createLearningTrack() {
            let url =
                '/learning-tracks/' + this.userDetailsStore.userId + '/create';

            // Just get the skill IDs, to make the API call faster
            let recommendedSkillIds =
                this.recommendedSkillsOrderedByRelevance.map(
                    (skill) => skill.id
                );

            const requestOption = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.query,
                    skills: recommendedSkillIds
                })
            };

            await fetch(url, requestOption);
            alert(
                "Learning track created. You can view it on the 'Learning Tracks' tab."
            );
        }
    },
    watch: {
        recommendedSkillsOrderedByRelevance: {
            handler(newValue) {
                if (newValue.length === 0) {
                    this.showRecommendedSkills = false;
                }
            },
            deep: true
        }
    }
};
</script>

<template>
    <!-- Search Feature -->
    <div class="search-bar">
        <div class="d-flex align-items-center p-1">
            <input
                id="searchBar"
                type="text"
                class="recommended-skills-input"
                :placeholder="
                    isMobileCheck < 576
                        ? 'Search...'
                        : 'Which skill or profession do you want to learn about?'
                "
                v-model="query"
            />
            <button
                v-if="sessionDetailsStore.isLoggedIn"
                id="searchButton"
                @click="getRecommendedSkills"
                class="btn primary-btn rounded p-2"
            >
                <!-- Magnifying glass icon -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="16"
                    height="16"
                    class="tertiary-icon"
                >
                    <path
                        d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                    />
                </svg>
            </button>
            <button
                v-else
                id="searchButton"
                @click="getRecommendedSkillsGuestMode"
                class="btn primary-btn rounded p-2"
            >
                <!-- Magnifying glass icon -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    width="16"
                    height="16"
                    class="tertiary-icon"
                >
                    <path
                        d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                    />
                </svg>
            </button>
        </div>
    </div>
    <!-- Tutor loading animation -->
    <div class="ai-tutor-processing mt-1" v-if="waitForAIresponse">
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 512"
            width="18"
            height="18"
            fill="black"
        >
            <path
                d="M320 0c17.7 0 32 14.3 32 32l0 64 120 0c39.8 0 72 32.2 72 72l0 272c0 39.8-32.2 72-72 72l-304 0c-39.8 0-72-32.2-72-72l0-272c0-39.8 32.2-72 72-72l120 0 0-64c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224l16 0 0 192-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0-192 16 0z"
            />
        </svg>
        Thinking
        <TutorLoadingSymbol />
    </div>

    <!-- Recommended Skills by Relevance -->
    <div v-if="showRecommendedSkills">
        <h2 class="secondary-heading h5 bg-white rounded p-2 mt-2">
            Recommended Skills
        </h2>
        <div
            :class="{ 'd-flex flex-wrap': !sessionDetailsStore.isLoggedIn }"
            class="recommended-skills-wrapper"
        >
            <div
                v-for="(
                    recommendedSkill, index
                ) in recommendedSkillsOrderedByRelevance"
                class="d-flex flex-row align-items-end"
            >
                <router-link
                    v-if="sessionDetailsStore.isLoggedIn"
                    :class="{
                        'grade-school':
                            recommendedSkill.level == 'grade_school',
                        'middle-school':
                            recommendedSkill.level == 'middle_school',
                        'high-school': recommendedSkill.level == 'high_school',
                        college: recommendedSkill.level == 'college',
                        phd: recommendedSkill.level == 'phd'
                    }"
                    class="skill-link btn m-1"
                    :to="`/skills/${recommendedSkill.url}`"
                    target="_blank"
                >
                    {{ recommendedSkill.name }}
                </router-link>
                <router-link
                    v-else
                    class="skill-link btn m-1 skill-btn"
                    :to="`/skills/${recommendedSkill.url}`"
                    target="_blank"
                >
                    {{ recommendedSkill.name }}
                </router-link>
                <!-- Delete button -->
                <button
                    b-tooltip.hover
                    tile="remove skill from learning track"
                    class="red-btn small-btn"
                    @click="removeRecommendedSkill(index)"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                        fill="white"
                        height="11"
                        width="11"
                    >
                        <path
                            d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                        />
                    </svg>
                </button>
            </div>
        </div>
        <!-- Create learning track button -->
        <!-- <button
            v-if="sessionDetailsStore.isLoggedIn"
            class="btn primary-btn mt-3"
            @click="createLearningTrack"
        >
            Create learning track
        </button> -->
    </div>
</template>

<style scoped>
.skill-btn {
    border: 1px solid black;
    background-color: #5f31dd;
    color: white;
}

/* Change the default input recommendation background */
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px white inset !important;
}

.small-btn {
    height: 20px !important;
    width: 20px !important;
    margin-bottom: 3px;
    border: none;
    border-radius: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.search-bar {
    display: flex;
    flex-direction: column;
    /* border: 1px solid #dce2f2; */
    border: 1px solid var(--primary-color);
    border-radius: 8px;
    background-color: white;
}

.ai-tutor-processing {
    display: flex;
    width: fit-content;
    flex-direction: row;
    align-items: center;
    gap: 5px;
    border-radius: 25px;
    border: 1px solid #acacac;
    padding: 5px 10px;
    margin-bottom: 15px;
}

/* Phone view style */
@media (max-width: 480px) {
    .search-bar {
        margin-left: auto;
        margin-right: auto;
    }
}

.recommended-skills-input {
    outline: none;
    border: 0px;
    width: 100%;
    margin-top: 2px;
    background-color: inherit !important;
}

/* Search bar placeholder */
::placeholder {
    color: black;
    opacity: 1; /* Firefox */
}

::-ms-input-placeholder {
    /* Edge 12 -18 */
    color: black;
}

.skill-link:hover {
    border: 1px solid black;
}

/* Level colors */
.grade-school {
    background-color: #40e0d0;
}
.middle-school {
    background-color: #33a133;
    color: white;
}
.high-school {
    background-color: #ffd700;
}
.college {
    background-color: #ffa500;
}
.phd {
    background-color: #ff0000;
    color: white;
}
</style>
