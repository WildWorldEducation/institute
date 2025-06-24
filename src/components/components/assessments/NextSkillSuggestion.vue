<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            nextSkillsInBranch: [],
            showNextSkillsInBranch: false,
            isLoading: true,
            hasLoaded: false
        };
    },
    mounted() {
        if (!this.hasLoaded) {
            this.getNextSkills();
        }
    },
    methods: {
        async getNextSkills() {
            // Prevent multiple API calls
            if (this.hasLoaded) {
                return;
            }
            const skillId = this.$route.params.id;
            if (!skillId) {
                console.error('No skill ID found in route params');
                this.isLoading = false;
                return;
            }
            try {
                this.isLoading = true;
                const result = await fetch(
                    `/user-skills/get-next-accessible-in-branch/${this.userDetailsStore.userId}/${skillId}`
                );
                if (!result.ok) {
                    throw new Error(`HTTP error! status: ${result.status}`);
                }
                this.nextSkillsInBranch = await result.json();
                console.log(
                    `Found ${this.nextSkillsInBranch.length} next skills in branch`
                );
            } catch (error) {
                console.error('Error fetching next skills:', error);
            } finally {
                this.isLoading = false;
                this.showNextSkillsInBranch = true;
                this.hasLoaded = true;
            }
        }
    }
};
</script>

<template>
    <div>
        <h2 class="secondary-heading h4">Continue your learning</h2>

        <!-- Loading state -->
        <div v-if="isLoading" class="wrapper">
            <p>Loading related skills...</p>
        </div>

        <!-- Skills found -->
        <div
            v-else-if="showNextSkillsInBranch && nextSkillsInBranch.length > 0"
            class="wrapper"
        >
            <div v-for="nextSkill in nextSkillsInBranch" :key="nextSkill.id">
                <router-link
                    :class="{
                        'grade-school': nextSkill.level == 'grade_school',
                        'middle-school': nextSkill.level == 'middle_school',
                        'high-school': nextSkill.level == 'high_school',
                        college: nextSkill.level == 'college',
                        phd: nextSkill.level == 'phd'
                    }"
                    class="skill-link btn"
                    :to="`/skills/${nextSkill.url}`"
                    target="_blank"
                >
                    {{ nextSkill.name }}
                </router-link>
            </div>
        </div>

        <!-- No skills found -->
        <div
            v-else-if="
                showNextSkillsInBranch && nextSkillsInBranch.length === 0
            "
            class="wrapper"
        >
            <p>
                🎉 Excellent work! You've completed all available skills in this
                learning path.
            </p>
        </div>
    </div>
</template>

<style scoped>
.wrapper {
    padding: 15px 20px;
    background-color: #f0f1f3;
    border-radius: 5px;
    border: #8f7bd6 1px solid;
    margin: 10px 0px;
    width: fit-content;
    height: fit-content;
    display: flex;
    flex-direction: column;
    gap: 8px;
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
