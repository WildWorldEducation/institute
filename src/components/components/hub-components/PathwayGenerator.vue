<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        // Run the GET request.
        userDetailsStore.getUserDetails();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            query: '',
            recommendedSkillsOrderedByRelevance: [],
            showRecommendedSkills: false
        };
    },
    mounted() {
        // Allow search to accept Enter key
        // Get the input field
        var input = document.getElementById('searchBar');

        // Execute a function when the user presses a key on the keyboard
        input.addEventListener('keypress', function (event) {
            // If the user presses the "Enter" key on the keyboard
            if (event.key === 'Enter') {
                // Cancel the default action, if needed
                event.preventDefault();
                // Trigger the button element with a click
                document.getElementById('searchButton').click();
            }
        });
    },
    methods: {
        async getRecommendedSkills() {
            let url = '/skills/find-skills-for-pathway';
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
            this.recommendedSkillsOrderedByRelevance =
                readableResult.resultsSortedByRelevence;
            this.showRecommendedSkills = true;
        },
        removeRecommendedSkill(index) {
            this.recommendedSkillsOrderedByRelevance.splice(index, 1);
        },
        createLearningTrack() {
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
                class="pathways-input"
                placeholder="What skill or profession do you want to learn?"
                v-model="query"
            />
            <button
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
                    class="secondary-icon"
                >
                    <path
                        d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                    />
                </svg>
            </button>
        </div>
    </div>
    <!-- Recommended Skills by Relevance -->
    <div v-if="showRecommendedSkills">
        <h2 class="secondary-heading h5 bg-white rounded p-2 mt-2">
            Recommended Skills
        </h2>
        <div
            v-for="(
                recommendedSkill, index
            ) in recommendedSkillsOrderedByRelevance"
        >
            <router-link
                :class="{
                    'grade-school': recommendedSkill.level == 'grade_school',
                    'middle-school': recommendedSkill.level == 'middle_school',
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
            <button class="btn red-btn" @click="removeRecommendedSkill(index)">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    height="18"
                    class="tertiary-icon"
                >
                    <!--! Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                    <path
                        d="M135.2 17.7L128 32 32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0-7.2-14.3C307.4 6.8 296.3 0 284.2 0L163.8 0c-12.1 0-23.2 6.8-28.6 17.7zM416 128L32 128 53.2 467c1.6 25.3 22.6 45 47.9 45l245.8 0c25.3 0 46.3-19.7 47.9-45L416 128z"
                    />
                </svg>
            </button>
        </div>
        <button class="btn primary-btn mt-3">Create learning track</button>
    </div>
</template>

<style scoped>
.search-bar {
    display: flex;
    flex-direction: column;
    /* border: 1px solid #dce2f2; */
    border: 1px solid var(--primary-color);
    border-radius: 8px;
    background-color: white;
}

/* Phone view style */
@media (max-width: 480px) {
    .search-bar {
        margin-left: auto;
        margin-right: auto;
    }
}

.pathways-input {
    outline: none;
    border: 0px;
    width: 100%;
    margin-top: 2px;
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
