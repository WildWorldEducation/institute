<script>
// Import the store.
import { useTagsStore } from '../../stores/TagsStore.js';
import { useSkillTagsStore } from '../../stores/SkillTagsStore.js';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useSkillTreeStore } from '../../stores/SkillTreeStore.js';
import { useUserSkillsStore } from '../../stores/UserSkillsStore.js';
import { useSessionDetailsStore } from '../../stores/SessionDetailsStore.js';
import { useShowSkillStore } from '../../stores/ShowSkillStore.js';
import { useSettingsStore } from '../../stores/SettingsStore.js';

// Import components
import FlagModals from './FlagModals.vue';
import Forum from './forum/Forum.vue';
import AITutor from './ai-tutor/AITutor.vue';
import LearningObjectiveAITutor from './ai-tutor/LearningObjectiveAITutor.vue';

export default {
    setup() {
        const tagsStore = useTagsStore();
        const skillTagsStore = useSkillTagsStore();
        const userDetailsStore = useUserDetailsStore();
        const skillsStore = useSkillsStore();
        const skillTreeStore = useSkillTreeStore();
        const userSkillsStore = useUserSkillsStore();
        const sessionDetailsStore = useSessionDetailsStore();
        const showSkillStore = useShowSkillStore();
        const settingsStore = useSettingsStore();

        // If method hasn`t been run before.
        if (tagsStore.tagsList.length == 0) {
            // Run the GET request.
            tagsStore.getTagsList();
        }

        return {
            tagsStore,
            skillTagsStore,
            userDetailsStore,
            skillsStore,
            skillTreeStore,
            userSkillsStore,
            sessionDetailsStore,
            showSkillStore,
            settingsStore
        };
    },
    data() {
        return {
            skillUrl: this.$route.params.skillUrl,
            skillId: null,
            skill: {
                learningObjectives: []
            },
            userSkills: [],
            isMastered: false,
            isUnlocked: false,
            isGoal: false,
            filters: [],
            showFlaggingModal: false,
            ancestor: this.$route.params.id,
            // Accessible list used to find nearest un-lockable node.
            accessibleSkills: [],
            showAncestorLink: false,
            isMobileCheck: window.innerWidth,
            showConfirmModal: false,
            isSkillLoaded: false,
            randomNum: 0,
            goalSteps: [],
            goals: [],
            toggleModal: false, // Controls the modal visibility
            selectedSkill: null, // Stores the selected skill for modal context
            // Tutorial tooltips
            isTutorialComplete: false,
            showTutorialTip1: false,
            showTutorialTip2: false,
            showTutorialTip3: false,
            showTutorialTip4: false,
            showTutorialTip5: false,
            showTutorialTip6: false,
            showTutorialTip7: false,
            showTutorialTip8: false,
            showTutorialTip9: false,
            showTutorialTip10: false,
            showTutorialTip11: false,
            showCategoryCompletedModal: false,
            nextSkillsInBranch: [],
            // Defaults to true. False only for certain skills.
            // This is just to prevent them displaying. They are still loaded, as used by the AI.
            showLearningObjectives: true,
            isAITokenLimitReached: false,
            showMasteryModal: false,
            areAllSubskillsMastered: false,
            unmasteredSubskills: [],
            showUnmasteredModal: false
        };
    },
    components: {
        Forum,
        FlagModals,
        AITutor,
        LearningObjectiveAITutor
    },
    async created() {
        try {
            // Set to false at the beginning to be safe
            this.isSkillLoaded = false;

            // Needed for token limit
            if (this.sessionDetailsStore.isLoggedIn) {
                await this.checkTokenUsage();
            }

            // Get the skill data
            await this.getSkill();

            // Only set isSkillLoaded to true if getSkill completes successfully
            this.isSkillLoaded = true;

            if (this.sessionDetailsStore.isLoggedIn) {
                await this.getUserSkills();
                // Check for subskill mastery directly here
                if (this.skill.type === 'super') {
                    await this.checkSubskillMastery();
                } else {
                    this.areAllSubskillsMastered = true;
                }
            }

            // Turn this on only if user is logged in.
            if (this.sessionDetailsStore.isLoggedIn) {
                this.checkIfTutorialComplete();
            }

            if (!this.isUnlocked) {
                this.nearestAccessibleAncestor(this.skill);
            }
        } catch (error) {
            console.error('Error in created hook:', error);
            this.isSkillLoaded = false;
        }
    },
    mounted() {
        if (this.showTutorialTip6) {
            this.scrollToTooltip();
        }
        if (this.showTutorialTip7) {
            this.scrollToTooltip();
        }
    },
    methods: {
        async checkTokenUsage() {
            try {
                // Ensure user details are loaded first
                await this.userDetailsStore.getUserDetails();

                // Check if settings store exists and has the method
                if (
                    this.settingsStore &&
                    typeof this.settingsStore.getSettings === 'function'
                ) {
                    // Only get settings if free monthly tokens are 0 or not set
                    if (this.settingsStore.freePlanTokenLimit === 0) {
                        await this.settingsStore.getSettings();
                    }
                } else {
                    console.error('Settings store is not properly initialized');
                    this.isAITokenLimitReached = true;
                    return;
                }

                // Check if user is over free monthly AI token limit
                if (this.userDetailsStore.subscriptionTier == 'free') {
                    if (
                        this.settingsStore.freePlanTokenLimit <=
                        this.userDetailsStore.monthlyTokenUsage
                    ) {
                        this.isAITokenLimitReached = true;
                    }
                } else if (this.userDetailsStore.subscriptionTier == 'basic') {
                    if (
                        this.settingsStore.basicPlanTokenLimit <=
                        this.userDetailsStore.monthlyTokenUsage
                    ) {
                        this.isAITokenLimitReached = true;
                    }
                }
            } catch (error) {
                console.error('Error in checkTokenUsage:', error);
                // Set a default state to prevent complete failure
                this.isAITokenLimitReached = true;
            }
        },
        async getSkill() {
            // solution for image to be changed when we change it from AWS
            this.randomNum = Math.random();
             /* 
             / Load the skill data
             / Split into 2 parts, for SEO
            */
            // Load the first part of the skill data - above the fold for mobile view 
            await this.showSkillStore.getSkillFirstPart(this.skillUrl);
            this.skill.name = this.showSkillStore.skill.name;
            this.skill.intro_sentence =
                this.showSkillStore.skill.intro_sentence;
            this.skill.type = this.showSkillStore.skill.type;
            this.skill.level = this.showSkillStore.skill.level;
            this.skill.image_thumbnail_url =
                this.showSkillStore.skill.image_thumbnail_url;
            this.skill.is_human_edited =
                this.showSkillStore.skill.image_thumbnail_url

            // Load the rest of the skill data
            await this.showSkillStore.getSkillSecondPart(this.skillUrl);
            this.skill = this.showSkillStore.skill;
            this.skillId = this.skill.id;

            /*
             * Learning Objectives
             */
            // Hide learning objectives for certain skills
            if (this.skill.name.includes('Vocabulary Test')) {
                this.showLearningObjectives = false;
            }

            // Get learning objectives for the skill
            this.skill.learningObjectives = [];

            await this.getLearningObjectives();

            // Meta title and description for browser tab, Google Search snippet and SEO
            document.title = this.skill.name + ' - Parrhesia';
            document
                .querySelector('meta[name="description"]')
                .setAttribute('content', this.skill.intro_sentence);

            //Load skill filters
            this.getSkillFilters();

            const icon = document.getElementsByTagName('svg');
            if (icon.length > 0) {
                icon[0].style.height = '50px';
            }

            // Record that the user visited this skill.
            if (this.userDetailsStore.role == 'student')
                this.recordSkillVisit(this.skillId);
        },
        async getLearningObjectives() {
            const result = await fetch(
                '/skill-learning-objectives/' + this.skillId + '/list'
            );
            this.skill.learningObjectives = await result.json();
            if (this.sessionDetailsStore.isLoggedIn) {
                for (let i = 0; i < this.skill.learningObjectives.length; i++) {
                    this.skill.learningObjectives[i].showAI = false;
                }
            }
        },
        recordSkillVisit(skillId) {
            fetch('/skills/record-visit/' + skillId);
        },
        async getSkillFilters() {
            if (this.skillTagsStore.skillTagsList.length == 0)
                await this.skillTagsStore.getSkillTagsList();

            for (let i = 0; i < this.skillTagsStore.skillTagsList.length; i++) {
                if (
                    this.skillTagsStore.skillTagsList[i].skill_id ==
                    this.skillId
                ) {
                    this.filters.push(
                        this.skillTagsStore.skillTagsList[i].tag_id
                    );
                }
            }
        },
        async getUserSkills() {
            const res = await fetch(
                '/user-skills/filtered-unnested-list/' +
                    this.userDetailsStore.userId
            );
            const data = await res.json();
            this.userSkills = data;
            // Reset these flags before processing
            this.isMastered = false;
            this.isUnlocked = false;
            this.isGoal = false;

            for (let i = 0; i < this.userSkills.length; i++) {
                if (this.userSkills[i].id == this.skill.id) {
                    // For domain skills, we always want to keep the button visible
                    if (this.skill.type === 'domain') {
                        // Only update isUnlocked status for domain skills
                        if (this.userSkills[i].is_accessible == 1)
                            this.isUnlocked = true;
                        if (this.userSkills[i].is_goal == 1) this.isGoal = true;
                        // Deliberately NOT setting isMastered for domain skills
                    } else {
                        // For non-domain skills, proceed as normal
                        if (this.userSkills[i].is_mastered == 1) {
                            this.isMastered = true;
                        }
                        if (this.userSkills[i].is_accessible == 1)
                            this.isUnlocked = true;
                        if (this.userSkills[i].is_goal == 1) this.isGoal = true;
                    }
                }

                // Also get the accessible skill list of this user for the find nearest accessible ancestor method
                if (this.userSkills[i].is_accessible == 1) {
                    this.accessibleSkills.push(this.userSkills[i]);
                }
            }
            // Add this check right here, after processing userSkills
            if (this.skill.type === 'super') {
                try {
                    // Get all subskills for this super skill
                    const response = await fetch(
                        `/skills/sub-skills/${this.skill.id}`
                    );
                    const subskills = await response.json();

                    // If no subskills, consider all mastered
                    if (!subskills || subskills.length === 0) {
                        this.areAllSubskillsMastered = true;
                    } else {
                        // Check if all subskills are mastered by the user
                        let allMastered = true;
                        for (const subskill of subskills) {
                            const found = this.userSkills.find(
                                (us) => us.id === subskill.id
                            );
                            if (!found || found.is_mastered !== 1) {
                                allMastered = false;
                                break;
                            }
                        }

                        this.areAllSubskillsMastered = allMastered;
                    }
                } catch (error) {
                    console.error('Error checking subskill mastery:', error);
                    this.areAllSubskillsMastered = false;
                }
            } else {
                // Not a super skill, so this check doesn't apply
                this.areAllSubskillsMastered = true;
            }
        },
        async MakeMastered() {
            // If it's a domain skill, first find its first child skill
            if (this.skill.type === 'domain') {
                try {
                    // First get the first child skill
                    const response = await fetch(
                        `/skills/get-first-child-skill/${this.skill.id}`
                    );
                    const firstChildSkill = await response.json();

                    // Mark the domain skill as mastered but don't change the UI state for domain skills
                    // This allows the button to remain visible when we return to this page
                    await this.userSkillsStore.MakeMastered(
                        this.userDetailsStore.userId,
                        this.skill
                    );

                    // Update user skills to reflect changes in the store, but keep button visible
                    await this.getUserSkills();

                    // For domain skills, we want to keep the button visible even after mastering
                    this.isMastered = false;

                    // If a child skill exists, redirect to it
                    if (firstChildSkill && firstChildSkill.url) {
                        this.$router.push(`/skills/${firstChildSkill.url}`);
                    } else {
                        // If no child skill, show category completed modal
                        await this.getNextSkillsInBranch();
                        this.showCategoryCompletedModal = true;
                    }
                } catch (error) {
                    console.error(
                        'Error marking domain skill as mastered:',
                        error
                    );
                }
            } else {
                // Existing logic for non-domain skills
                await this.userSkillsStore.MakeMastered(
                    this.userDetailsStore.userId,
                    this.skill
                );
                this.isMastered = true;
                await this.getUserSkills();
                await this.getNextSkillsInBranch();
                this.showCategoryCompletedModal = true;
            }
        },
        async getNextSkillsInBranch() {
            const result = await fetch(
                '/user-skills/get-next-accessible-in-branch/' +
                    this.userDetailsStore.userId +
                    '/' +
                    this.skillId
            );
            this.nextSkillsInBranch = await result.json();
        },
        closeFlagModal() {
            this.showModal = false;
        },
        /**
         * Find the closest ancestor of this skill node that is not mastered, but is unlocked
         * For now I am using recursive method to traverse the tree nodes. This might be costly and need to test more when the skills number expand
         */
        nearestAccessibleAncestor(node) {
            const inAccessibleList = this.accessibleSkills.find(
                (as) => as.id == node.id
            );

            // stop when the first ancestor node that is unlocked for the student
            if (inAccessibleList) {
                this.ancestor = node.url;
                // show the button to go to the skill when the link is ready
                this.showAncestorLink = true;
                return;
            }

            // if node is a super skill, check its subskills.
            let subskills = [];
            if (node.type == 'super') {
                for (let i = 0; i < this.accessibleSkills.length; i++) {
                    if (
                        this.accessibleSkills[i].type == 'sub' &&
                        this.accessibleSkills[i].parent == node.id &&
                        this.accessibleSkills[i].is_mastered != 1
                    ) {
                        subskills.push(this.accessibleSkills[i]);
                    }
                }
            }
            if (subskills.length > 0) {
                this.ancestor = subskills[0].url;
                // show the button to go to the skill when the link is ready
                this.showAncestorLink = true;
                return;
            }

            fetch('/skills/show/' + node.parent)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    // recursively call the function with parent node data
                    return this.nearestAccessibleAncestor(data);
                });
        },
        copyShareableURLToClipBoard() {
            navigator.clipboard.writeText(window.location.href);
            this.showConfirmModal = true;
        },
        imageUrlAlternative(event) {
            event.target.src = '/images/skill-avatar/recurso.png';
        },
        openModal(skill) {
            this.selectedSkill = skill;
            this.toggleModal = true;
        },
        // Close the modal
        closeModal() {
            this.toggleModal = false;
            this.selectedSkill = null;
        },
        // Confirm create goal and execute the necessary logic
        async confirmCreateGoal() {
            if (!this.selectedSkill) return; // Ensure a skill is selected

            // Create goal logic
            await this.userSkillsStore.getFilteredUnnestedList(
                this.userDetailsStore.userId
            );

            // Call the method to create the goal
            this.createGoal(this.selectedSkill);

            // Close the modal after confirming
            this.closeModal();
        },
        createGoal(skill) {
            if (skill.type != 'domain') {
                // Add ancestor skill to array.
                this.goalSteps.push(skill);
            }
            // Add ancestor subskills to array.
            let isSubSkillUnlocked = false;
            if (skill.type == 'super') {
                for (
                    let i = 0;
                    i < this.userSkillsStore.filteredUnnestedList.length;
                    i++
                ) {
                    if (
                        this.userSkillsStore.filteredUnnestedList[i].type ==
                            'sub' &&
                        this.userSkillsStore.filteredUnnestedList[i].parent ==
                            skill.id &&
                        this.userSkillsStore.filteredUnnestedList[i]
                            .is_mastered != 1
                    ) {
                        this.goalSteps.push(
                            this.userSkillsStore.filteredUnnestedList[i]
                        );
                        // Check if sub skill is unlocked.
                        if (
                            this.userSkillsStore.filteredUnnestedList[i]
                                .is_accessible
                        ) {
                            isSubSkillUnlocked = true;
                        }
                    }
                }
            }

            // Check if current skill is unlocked.
            const inAccessibleList = this.accessibleSkills.find(
                (as) => as.id == skill.id
            );

            // Stop when the first ancestor node that is unlocked for the student is found
            // or if its sub skill is unlocked
            if (inAccessibleList || isSubSkillUnlocked) {
                this.populateGoalSteps();
                return;
            }

            fetch('/skills/show/' + skill.parent)
                .then((response) => {
                    return response.json();
                })
                .then((skill) => {
                    // Recursively call the function with parent skill data.
                    return this.createGoal(skill);
                });
        },
        populateGoalSteps() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    goalSteps: this.goalSteps
                })
            };
            const url =
                '/user-skills/set-goal/' +
                this.userDetailsStore.userId +
                '/' +
                this.skillId;
            fetch(url, requestOptions).then(() => {
                alert(
                    `You've created a goal for ${this.skill.name}, you can view your goals in the drop-down menu.`
                );
                this.$router.push(
                    `/goals/${this.userDetailsStore.userId}/${this.skillId}`
                );
            });
        },
        // Tutorial
        async checkIfTutorialComplete() {
            const result = await fetch(
                '/users/check-tutorial-progress/skill/' +
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
                if (!this.isMastered) {
                    this.showTutorialTip2 = true;
                } else {
                    // If skill is already mastered, skip step 2 (assessment button tooltip)
                    this.showTutorialTip3 = true;
                }
            } else if (step == 2) {
                this.showTutorialTip2 = false;
                this.showTutorialTip3 = true;
            } else if (step == 3) {
                this.showTutorialTip3 = false;
                this.showTutorialTip4 = true;
            } else if (step == 4) {
                this.showTutorialTip4 = false;
                this.showTutorialTip5 = true;
            } else if (step == 5) {
                this.showTutorialTip5 = false;

                // For editors and instructors, skip to tooltip 7 which will show at the Forum section
                if (
                    this.userDetailsStore.role === 'editor' ||
                    this.userDetailsStore.role === 'instructor'
                ) {
                    this.showTutorialTip5 = false;
                    this.markTutorialComplete();
                }
                this.showTutorialTip6 = true;
            } else if (step == 6) {
                this.showTutorialTip6 = false;
                this.showTutorialTip7 = true;
            } else if (step == 7) {
                this.showTutorialTip7 = false;
                // If skill is mastered, skip AI Tutor assessment tooltips
                if (this.isMastered) {
                    this.showTutorialTip10 = true;
                } else {
                    this.showTutorialTip8 = true;
                }
            } else if (step == 8) {
                this.showTutorialTip8 = false;
                this.showTutorialTip9 = true;
            } else if (step == 9) {
                this.showTutorialTip9 = false;
                this.showTutorialTip10 = true;
            } else if (step == 10) {
                this.showTutorialTip10 = false;
                this.showTutorialTip11 = true;
            } else if (step == 11) {
                this.showTutorialTip11 = false;
                this.markTutorialComplete();
            }
        },
        restartTutorial() {
            this.showTutorialTip1 = true;
            this.showTutorialTip2 = false;
            this.showTutorialTip3 = false;
            this.showTutorialTip4 = false;
            this.showTutorialTip5 = false;
            this.showTutorialTip6 = false;
            this.showTutorialTip7 = false;
            this.showTutorialTip8 = false;
            this.showTutorialTip9 = false;
            this.showTutorialTip10 = false;
            this.showTutorialTip11 = false;
            this.showInstructorEditorTutorialTip = false;
            this.isTutorialComplete = false;
        },
        markTutorialComplete() {
            let url =
                '/users/mark-tutorial-complete/skill/' +
                this.userDetailsStore.userId;
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            };
            fetch(url, requestOptions);
        },
        skipTutorial() {
            this.showTutorialTip1 = false;
            this.showTutorialTip2 = false;
            this.showTutorialTip3 = false;
            this.showTutorialTip4 = false;
            this.showTutorialTip5 = false;
            this.showTutorialTip6 = false;
            this.showTutorialTip7 = false;
            this.showTutorialTip8 = false;
            this.showTutorialTip9 = false;
            this.showTutorialTip10 = false;
            this.showTutorialTip11 = false;
            this.isTutorialComplete = true;
            this.markTutorialComplete();
        },
        scrollToTooltip() {
            this.$nextTick(() => {
                if (
                    this.userDetailsStore.role == 'student' &&
                    this.showTutorialTip6 &&
                    this.$refs.learningObjectivesSection
                ) {
                    this.$refs.learningObjectivesSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                } else if (this.showTutorialTip7 && this.$refs.aiTutorSection) {
                    this.$refs.aiTutorSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        },
        scrollToAITutor() {
            if (this.$refs.aiTutorSection) {
                // Scroll to the AITutor section
                this.$refs.aiTutorSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        },
        async checkSubskillMastery() {
            if (this.skill.type !== 'super') {
                // Not a super skill, so this check doesn't apply
                this.areAllSubskillsMastered = true;
                return;
            }

            try {
                // Get all subskills for this super skill
                const response = await fetch(
                    `/skills/sub-skills/${this.skill.id}`
                );
                const subskills = await response.json();

                // If no subskills, consider all mastered
                if (!subskills || subskills.length === 0) {
                    this.areAllSubskillsMastered = true;
                    this.unmasteredSubskills = [];
                    return;
                }

                // Check if all subskills are mastered by the user
                let allMastered = true;
                this.unmasteredSubskills = []; // Reset this array

                for (const subskill of subskills) {
                    const found = this.userSkills.find(
                        (us) => us.id === subskill.id
                    );
                    if (!found || found.is_mastered !== '1') {
                        allMastered = false;
                        this.unmasteredSubskills.push(subskill);
                    }
                }

                this.areAllSubskillsMastered = allMastered;
            } catch (error) {
                console.error('Error checking subskill mastery:', error);
                this.areAllSubskillsMastered = false;
                this.unmasteredSubskills = [];
            }
        },

        showUnmasteredSubskillsModal() {
            this.showUnmasteredModal = true;
        },
        handleSkillMastered() {
            this.isMastered = true;
            this.showMasteryModal = true;
        }
    },
    /**
     * Because in Vue when only the params change the component instance will NOT be load
     * so we have to watch for the $route and re fetch data our self
     */
    watch: {
        async $route(to, from) {
            // react to route changes...
            this.skillUrl = to.params.skillUrl;
            await this.getSkill();
            await this.getUserSkills();
        },
        showTutorialTip6(newVal) {
            if (newVal) {
                this.$nextTick(() => {
                    this.scrollToTooltip();
                });
            }
        },
        showTutorialTip7(newVal) {
            if (newVal) {
                this.$nextTick(() => {
                    this.scrollToTooltip();
                });
            }
        }
    }
};
</script>

<template>
    <div class="container">
        <div
            id="skill-info-container"
            :class="{ domain: skill.type == 'domain' }"
        >
            <!-- Name and description -->
            <div>
                <div class="d-flex justify-content-between top-row">
                    <h1 class="heading">{{ skill.name }}</h1>
                    <!-- Take assessment btn-->
                    <!-- If this skill is not unlocked yet, and user is student, instead show link to its closest unlocked ancestor -->
                    <router-link
                        v-if="
                            userDetailsStore.isSkillsLocked == 1 &&
                            userDetailsStore.role == 'student' &&
                            !isUnlocked &&
                            !isMastered &&
                            showAncestorLink
                        "
                        :to="'/skills/' + ancestor"
                        class="btn assessment-btn me-1"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 448 512"
                            width="20"
                            fill="white"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="M144 144l0 48 160 0 0-48c0-44.2-35.8-80-80-80s-80 35.8-80 80zM80 192l0-48C80 64.5 144.5 0 224 0s144 64.5 144 144l0 48 16 0c35.3 0 64 28.7 64 64l0 192c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 256c0-35.3 28.7-64 64-64l16 0z"
                            />
                        </svg>
                        &nbsp; Go to Nearest Unlocked Skill
                    </router-link>
                    <!-- Assessment -->
                    <button
                        v-if="
                            userDetailsStore.role == 'student' &&
                            !isMastered &&
                            skill.type != 'domain' &&
                            skill.id &&
                            (skill.type !== 'super' || areAllSubskillsMastered)
                        "
                        class="btn me-1 assessment-btn"
                        @click="scrollToAITutor()"
                    >
                        <!-- Half star icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 576 512"
                            width="22"
                            fill="white"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="M288 0c-12.2 .1-23.3 7-28.6 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3L288 439.8 288 0zM429.9 512c1.1 .1 2.1 .1 3.2 0l-3.2 0z"
                            />
                        </svg>
                        Take the Test
                        <!-- Half star icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 576 512"
                            width="22"
                            fill="white"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="m 169.24356,0 c 12.2,0.1 23.3,7 28.6,18 l 64.4,132.3 143.6,21.2 c 12,1.8 22,10.2 25.7,21.7 3.7,11.5 0.7,24.2 -7.9,32.7 l -104.2,103.1 24.6,145.7 c 2,12 -3,24.2 -12.9,31.3 -9.9,7.1 -23,8 -33.8,2.3 l -128.1,-68.5 z M 27.343555,512 c -1.1,0.1 -2.1,0.1 -3.2,0 z"
                                id="path17"
                            />
                        </svg>
                    </button>
                    <!-- Unmastered Subskills Modal -->
                    <div
                        v-if="showUnmasteredModal"
                        class="modal"
                        @click.self="showUnmasteredModal = false"
                    >
                        <div class="modal-content">
                            <h1 class="heading h5">
                                Complete these cluster skills first:
                            </h1>
                            <div v-for="subskill in unmasteredSubskills">
                                <router-link
                                    :class="{
                                        'grade-school':
                                            skill.level == 'grade_school',
                                        'middle-school':
                                            skill.level == 'middle_school',
                                        'high-school':
                                            skill.level == 'high_school',
                                        college: skill.level == 'college',
                                        phd: skill.level == 'phd'
                                    }"
                                    class="skill-link btn mb-1 text-start"
                                    :to="`/skills/${subskill.url}`"
                                    @click="showUnmasteredModal = false"
                                >
                                    {{ subskill.name }}
                                </router-link>
                            </div>
                            <button
                                class="btn primary-btn ms-auto me-0"
                                @click="showUnmasteredModal = false"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                    <button
                        v-if="
                            userDetailsStore.role == 'student' &&
                            !isMastered &&
                            skill.type === 'super' &&
                            !areAllSubskillsMastered
                        "
                        class="btn me-1 assessment-btn"
                        style="opacity: 0.7"
                        @click="showUnmasteredSubskillsModal"
                        title="Click to see which subskills need to be mastered"
                    >
                        <!-- Half star icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 576 512"
                            width="22"
                            fill="white"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="M288 0c-12.2 .1-23.3 7-28.6 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3L288 439.8 288 0zM429.9 512c1.1 .1 2.1 .1 3.2 0l-3.2 0z"
                            />
                        </svg>
                        Master Subskills First
                        <!-- Half star icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 576 512"
                            width="22"
                            fill="white"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="m 169.24356,0 c 12.2,0.1 23.3,7 28.6,18 l 64.4,132.3 143.6,21.2 c 12,1.8 22,10.2 25.7,21.7 3.7,11.5 0.7,24.2 -7.9,32.7 l -104.2,103.1 24.6,145.7 c 2,12 -3,24.2 -12.9,31.3 -9.9,7.1 -23,8 -33.8,2.3 l -128.1,-68.5 z M 27.343555,512 c -1.1,0.1 -2.1,0.1 -3.2,0 z"
                                id="path17"
                            />
                        </svg>
                    </button>
                    <button
                        v-if="
                            userDetailsStore.role == 'student' &&
                            skill.type == 'domain'
                        "
                        @click="MakeMastered()"
                        class="btn me-1 assessment-btn"
                    >
                        <!-- Half star icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 576 512"
                            width="22"
                            fill="white"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="M288 0c-12.2 .1-23.3 7-28.6 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3L288 439.8 288 0zM429.9 512c1.1 .1 2.1 .1 3.2 0l-3.2 0z"
                            />
                        </svg>
                        Go To Child Skill
                        <!-- Half star icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 576 512"
                            width="22"
                            fill="white"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="m 169.24356,0 c 12.2,0.1 23.3,7 28.6,18 l 64.4,132.3 143.6,21.2 c 12,1.8 22,10.2 25.7,21.7 3.7,11.5 0.7,24.2 -7.9,32.7 l -104.2,103.1 24.6,145.7 c 2,12 -3,24.2 -12.9,31.3 -9.9,7.1 -23,8 -33.8,2.3 l -128.1,-68.5 z M 27.343555,512 c -1.1,0.1 -2.1,0.1 -3.2,0 z"
                                id="path17"
                            />
                        </svg>
                    </button>
                    <!-- If not logged in, go to Login page -->
                    <router-link
                        v-else-if="!sessionDetailsStore.isLoggedIn"
                        class="btn me-1 assessment-btn"
                        to="/login"
                    >
                        <!-- Half star icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 576 512"
                            width="22"
                            fill="white"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="M288 0c-12.2 .1-23.3 7-28.6 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3L288 439.8 288 0zM429.9 512c1.1 .1 2.1 .1 3.2 0l-3.2 0z"
                            />
                        </svg>
                        <span v-if="skill.type != 'domain'">Take the Test</span
                        ><span v-else>Mark Complete</span>
                        <!-- Half star icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 576 512"
                            width="22"
                            fill="white"
                        >
                            <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                            <path
                                d="m 169.24356,0 c 12.2,0.1 23.3,7 28.6,18 l 64.4,132.3 143.6,21.2 c 12,1.8 22,10.2 25.7,21.7 3.7,11.5 0.7,24.2 -7.9,32.7 l -104.2,103.1 24.6,145.7 c 2,12 -3,24.2 -12.9,31.3 -9.9,7.1 -23,8 -33.8,2.3 l -128.1,-68.5 z M 27.343555,512 c -1.1,0.1 -2.1,0.1 -3.2,0 z"
                                id="path17"
                            />
                        </svg>
                    </router-link>
                </div>
                <!-- Student tooltip -->
                <div
                    v-if="
                        userDetailsStore.role == 'student' && showTutorialTip2
                    "
                    class="tool-tip-base d-flex justify-content-end"
                >
                    <div
                        class="explain-tool-tip hovering-info-panel"
                        :class="
                            isMobileCheck > 576
                                ? 'triangle-top-right'
                                : 'triangle-top-left'
                        "
                    >
                        <div class="tool-tip-text">
                            <p>
                                This is where you can take an assessment for
                                this skill, if it is unlocked.
                            </p>
                            <p>
                                If it's locked, this button will instead take
                                you to the closest unlocked skill.
                            </p>
                            <div class="d-flex justify-content-between">
                                <button
                                    class="btn primary-btn"
                                    @click="progressTutorial(2)"
                                >
                                    next
                                </button>
                                <button
                                    class="btn red-btn"
                                    @click="skipTutorial"
                                >
                                    exit tutorial
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Description only seen by admins -->
                <div
                    v-if="userDetailsStore.role == 'admin'"
                    class="row pe-4 ps-4 ps-md-0 skill-description"
                >
                    <p>{{ skill.description }}</p>
                </div>
                <!-- A line divide -->
                <hr class="border border-2 opacity-100 hr" />
            </div>
            <!-- Buttons -->
            <div class="row mb-2">
                <div
                    class="col d-flex"
                    :class="{
                        'flex-row justify-content-between':
                            isMobileCheck >= 576,
                        'flex-column': isMobileCheck < 576
                    }"
                >
                    <div class="d-flex">
                        <!-- Edit skill btn-->
                        <router-link
                            v-if="sessionDetailsStore.isLoggedIn"
                            :to="'/skills/edit/' + skillUrl"
                            class="edit-btn btn primary-btn me-1"
                            ><span v-if="isMobileCheck > 576">Edit &nbsp;</span>
                            <!-- Pencil icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                width="20"
                                height="20"
                                fill="white"
                            >
                                <path
                                    d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"
                                />
                            </svg>
                        </router-link>
                        <!-- Show version history -->
                        <router-link
                            v-if="
                                userDetailsStore.role == 'admin' ||
                                userDetailsStore.role == 'editor'
                            "
                            :to="'/skills/history/' + this.skillUrl"
                            class="btn primary-btn me-1"
                            ><span v-if="isMobileCheck > 576"
                                >History&nbsp;</span
                            >
                            <!-- History icon -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                width="18"
                                height="20"
                                fill="white"
                            >
                                <path
                                    d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9L0 168c0 13.3 10.7 24 24 24l110.1 0c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24l0 104c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65 0-94.1c0-13.3-10.7-24-24-24z"
                                />
                            </svg>
                        </router-link>
                        <!-- Create goal button -->
                        <button
                            v-if="
                                skill.type != 'domain' &&
                                sessionDetailsStore.isLoggedIn &&
                                isMastered == false &&
                                isUnlocked == false &&
                                isGoal == false &&
                                userDetailsStore.role == 'student'
                            "
                            class="btn primary-btn"
                            @click="openModal(skill)"
                        >
                            Create goal&nbsp;
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                fill="white"
                                width="20"
                                height="20"
                            >
                                <path
                                    d="M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                                />
                            </svg>
                        </button>

                        <!-- Modal -->
                        <div
                            v-if="toggleModal"
                            @click.self="closeModal"
                            class="modal"
                        >
                            <div class="modal-content">
                                <p>
                                    Are you sure you want to create a goal for
                                    <span style="color: var(--primary-color)">
                                        {{ selectedSkill?.name }} </span
                                    >?
                                </p>
                                <div
                                    class="modal-btns d-flex justify-content-between mt-3"
                                >
                                    <button
                                        class="btn red-btn"
                                        @click="closeModal"
                                    >
                                        No
                                    </button>
                                    <button
                                        class="btn primary-btn"
                                        @click="confirmCreateGoal"
                                    >
                                        Yes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex mt-2 mt-md-0">
                        <!-- Sharable URL -->
                        <button
                            @click="copyShareableURLToClipBoard"
                            class="btn me-1"
                            aria-label="share"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                width="20"
                                heigth="20"
                            >
                                <path
                                    class="primary-icon"
                                    d="M352 224c53 0 96-43 96-96s-43-96-96-96s-96 43-96 96c0 4 .2 8 .7 11.9l-94.1 47C145.4 170.2 121.9 160 96 160c-53 0-96 43-96 96s43 96 96 96c25.9 0 49.4-10.2 66.6-26.9l94.1 47c-.5 3.9-.7 7.8-.7 11.9c0 53 43 96 96 96s96-43 96-96s-43-96-96-96c-25.9 0-49.4 10.2-66.6 26.9l-94.1-47c.5-3.9 .7-7.8 .7-11.9s-.2-8-.7-11.9l94.1-47C302.6 213.8 326.1 224 352 224z"
                                />
                            </svg>
                        </button>
                        <!-- Flag button -->
                        <button
                            v-if="sessionDetailsStore.isLoggedIn"
                            @click="showFlaggingModal = true"
                            class="btn"
                            b-tooltip.hover
                            title="Report this skill to the admin if it has errors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                class="flag-icon"
                            >
                                <path
                                    class="primary-icon"
                                    d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"
                                />
                            </svg>
                        </button>
                        <button
                            class="btn primary-btn me-1"
                            @click="restartTutorial"
                            aria-label="info"
                        >
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
                <!-- Student tooltips -->
                <div
                    v-if="
                        userDetailsStore.role == 'student' && showTutorialTip3
                    "
                    class="tool-tip-base"
                >
                    <div
                        class="explain-tool-tip triangle-top-left hovering-info-panel narrow-info-panel"
                    >
                        <div class="tool-tip-text">
                            <p>
                                Suggesting edits to this page or its test can
                                increase your reputation score.
                            </p>
                            <p>
                                If this skill is marked as locked, you can also
                                bookmark this skill by marking it as a goal.
                            </p>
                            <div class="d-flex justify-content-between">
                                <button
                                    class="btn primary-btn"
                                    @click="progressTutorial(3)"
                                >
                                    next
                                </button>
                                <button
                                    class="btn red-btn"
                                    @click="skipTutorial"
                                >
                                    exit tutorial
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    v-if="
                        userDetailsStore.role == 'student' && showTutorialTip4
                    "
                    class="tool-tip-base d-flex justify-content-end"
                >
                    <div
                        class="explain-tool-tip triangle-top-right hovering-info-panel narrow-info-panel"
                    >
                        <div class="tool-tip-text">
                            <p>
                                Here you can share a link to this skill with a
                                friend, or flag this page as unhelpful or
                                incorrect.
                            </p>
                            <div class="d-flex justify-content-between">
                                <button
                                    class="btn primary-btn"
                                    @click="progressTutorial(4)"
                                >
                                    next
                                </button>
                                <button
                                    class="btn red-btn"
                                    @click="skipTutorial"
                                >
                                    exit tutorial
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Editor tooltips -->
                <div
                    v-if="userDetailsStore.role == 'editor' && showTutorialTip2"
                    class="tool-tip-base"
                >
                    <div
                        class="explain-tool-tip triangle-top-left hovering-info-panel"
                    >
                        <div class="tool-tip-text">
                            <p>
                                The "Edit" button allows you to edit this skill
                                page or its assessment.
                            </p>
                            <div class="d-flex justify-content-between">
                                <button
                                    class="btn primary-btn"
                                    @click="progressTutorial(2)"
                                >
                                    next
                                </button>
                                <button
                                    class="btn red-btn"
                                    @click="skipTutorial"
                                >
                                    exit tutorial
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    v-if="userDetailsStore.role == 'editor' && showTutorialTip3"
                    class="tool-tip-base d-flex justify-content-end"
                >
                    <div
                        class="explain-tool-tip triangle-top-right narrow-info-panel hovering-info-panel"
                    >
                        <div class="tool-tip-text">
                            <p>
                                Here you can share a link to this skill with a
                                friend, or flag this page as unhelpful or
                                incorrect.
                            </p>
                            <div class="d-flex justify-content-between">
                                <button
                                    class="btn primary-btn"
                                    @click="progressTutorial(3)"
                                >
                                    next
                                </button>
                                <button
                                    class="btn red-btn"
                                    @click="skipTutorial"
                                >
                                    exit tutorial
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Instructor tooltips -->
                <div
                    v-if="
                        userDetailsStore.role == 'instructor' &&
                        showTutorialTip2
                    "
                    class="tool-tip-base"
                >
                    <div
                        class="explain-tool-tip triangle-top-left narrow-info-panel hovering-info-panel"
                    >
                        <div class="tool-tip-text">
                            <p>
                                Here you can suggest an edit to this skill page.
                            </p>
                            <div class="d-flex justify-content-between">
                                <button
                                    class="btn primary-btn"
                                    @click="progressTutorial(2)"
                                >
                                    next
                                </button>
                                <button
                                    class="btn red-btn"
                                    @click="skipTutorial"
                                >
                                    exit tutorial
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    v-if="
                        userDetailsStore.role == 'instructor' &&
                        showTutorialTip3
                    "
                    class="tool-tip-base d-flex justify-content-end"
                >
                    <div
                        class="explain-tool-tip triangle-top-right narrow-info-panel hovering-info-panel"
                    >
                        <div class="tool-tip-text">
                            <p>
                                Here you can share a link to this skill with a
                                friend, or flag this page as unhelpful or
                                incorrect.
                            </p>
                            <div class="d-flex justify-content-between">
                                <button
                                    class="btn primary-btn"
                                    @click="progressTutorial(3)"
                                >
                                    next
                                </button>
                                <button
                                    class="btn red-btn"
                                    @click="skipTutorial"
                                >
                                    exit tutorial
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- A line divide -->
                <hr class="border border-1 opacity-100 hr mt-2" />
            </div>
            <!-- Content -->
            <div class="row">
                <div class="col-md-8 order-2 order-md-1">
                    <!-- Introduction -->
                    <div class="">
                        <h2 class="h4 secondary-heading">Introduction</h2>
                        <div class="bg-white rounded p-2">
                            <p>{{ skill.intro_sentence }}</p>
                        </div>
                    </div>

                    <!-- Mastery Requirements -->
                    <div v-if="skill.type != 'domain'" class="mt-1">
                        <h2 class="h4 secondary-heading">
                            Requirements for Mastery
                        </h2>
                        <div
                            class="bg-white rounded p-2 mastery-requirements-section"
                            v-html="skill.mastery_requirements"
                        ></div>
                    </div>
                </div>
                <!-- Infobox -->
                <div class="col-md-4 order-1 order-md-2">
                    <div class="info-box p-2 mb-2">
                        <!-- AWS S3 hosted feature image -->
                        <!-- Using random number otherwise url doesnt change (cache)-->
                        <a
                            :href="skill.image_url"
                            :aria-label="
                                'full size image representing ' + skill.name
                            "
                        >
                            <img
                                :src="skill.image_thumbnail_url"
                                @error="imageUrlAlternative"
                                class="rounded img-fluid"
                                :alt="'image representing ' + skill.name"
                                width="294.4"
                                height="294.4"
                            />
                        </a>
                        <!-- Grade level -->
                        <div class="mt-2">
                            <h2 class="h4 secondary-heading">Level</h2>
                            <span v-if="skill.level == 'grade_school'"
                                >Grade School</span
                            >
                            <span v-else-if="skill.level == 'middle_school'"
                                >Middle School</span
                            >
                            <span v-else-if="skill.level == 'high_school'"
                                >High School</span
                            >
                            <span v-else-if="skill.level == 'college'"
                                >College</span
                            >
                            <span v-else-if="skill.level == 'phd'">PHD</span>
                        </div>
                        <div class="mt-2">
                            <h2 class="h4 secondary-heading">Author</h2>
                            <!-- Author Icon -->
                            <div
                                v-if="skill.is_human_edited"
                                b-tooltip.hover
                                title="This page was written or edited by a human"
                                style="height: 50px"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 320 512"
                                    height="22"
                                >
                                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                                    <path
                                        d="M112 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm40 304l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-223.1L59.4 304.5c-9.1 15.1-28.8 20-43.9 10.9s-20-28.8-10.9-43.9l58.3-97c17.4-28.9 48.6-46.6 82.3-46.6l29.7 0c33.7 0 64.9 17.7 82.3 46.6l58.3 97c9.1 15.1 4.2 34.8-10.9 43.9s-34.8 4.2-43.9-10.9L232 256.9 232 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-128-16 0z"
                                        fill="black"
                                    />
                                </svg>
                            </div>
                            <div
                                v-else
                                b-tooltip.hover
                                title="This page was written by an AI"
                                style="height: 50px"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 640 512"
                                    height="22"
                                >
                                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                                    <path
                                        d="M320 0c17.7 0 32 14.3 32 32l0 64 120 0c39.8 0 72 32.2 72 72l0 272c0 39.8-32.2 72-72 72l-304 0c-39.8 0-72-32.2-72-72l0-272c0-39.8 32.2-72 72-72l120 0 0-64c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224l16 0 0 192-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0-192 16 0z"
                                        fill="black"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- Learning Objectives -->
            <div
                v-if="skill.type != 'domain' && showLearningObjectives"
                class="mt-4"
                ref="learningObjectivesSection"
            >
                <h2 class="h4 secondary-heading">Learning Objectives</h2>
                <div
                    v-if="
                        userDetailsStore.role == 'student' && showTutorialTip6
                    "
                    class="tool-tip-base d-flex justify-content-start"
                >
                    <div
                        class="explain-tool-tip hovering-info-panel triangle-top-left"
                    >
                        <div class="tool-tip-text">
                            <p>
                                Learning Objectives outline the specific skills
                                and knowledge you need to master this subject.
                                Click the + button next to any objective to get
                                personalized help from an AI tutor specifically
                                focused on that objective.
                            </p>
                            <div class="d-flex justify-content-between">
                                <button
                                    class="btn primary-btn"
                                    @click="progressTutorial(6)"
                                >
                                    next
                                </button>
                                <button
                                    class="btn red-btn"
                                    @click="skipTutorial"
                                >
                                    exit tutorial
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="bg-white rounded p-2">
                    <div
                        v-for="learningObjective in skill.learningObjectives"
                        class="d-flex mb-3 justify-content-between"
                        :class="{ 'mb-4': learningObjective.showAI }"
                    >
                        <div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                width="6"
                                height="6"
                            >
                                <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                                <path
                                    d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512z"
                                />
                            </svg>
                        </div>
                        <div class="ms-2 w-100">
                            <p class="mb-0">
                                {{ learningObjective.objective }}
                            </p>
                            <div v-if="learningObjective.showAI">
                                <!-- AI tutor for this learning objective -->
                                <LearningObjectiveAITutor
                                    :learningObjective="
                                        learningObjective.objective
                                    "
                                    :learningObjectiveId="learningObjective.id"
                                    :skillName="skill.name"
                                    :skillUrl="skill.url"
                                    :skillLevel="skill.level"
                                />
                            </div>
                        </div>
                        <button
                            v-if="
                                sessionDetailsStore.isLoggedIn &&
                                userDetailsStore.role == 'student'
                            "
                            class="btn plus-btn"
                            @click="
                                learningObjective.showAI =
                                    !learningObjective.showAI
                            "
                        >
                            <svg
                                v-if="!learningObjective.showAI"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                width="18"
                                height="18"
                            >
                                <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                                <path
                                    d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 144L48 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l144 0 0 144c0 17.7 14.3 32 32 32s32-14.3 32-32l0-144 144 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-144 0 0-144z"
                                />
                            </svg>
                            <svg
                                v-else
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                width="18"
                                height="18"
                            >
                                <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                                <path
                                    d="M432 256c0 17.7-14.3 32-32 32L48 288c-17.7 0-32-14.3-32-32s14.3-32 32-32l352 0c17.7 0 32 14.3 32 32z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- A line divide -->
            <div v-if="userDetailsStore.role == 'admin'">
                <div class="row">
                    <div class="col col-md-8 p-4 p-md-0">
                        <hr class="border border-2 opacity-100 hr" />
                    </div>
                </div>
                <!-- Filters -->
                <div class="row mt-3">
                    <div class="h1-title">Filter</div>
                    <label
                        v-for="tag in tagsStore.tagsList"
                        class="control control-checkbox"
                    >
                        <span class="my-auto mx-2 me-4"> {{ tag.name }}</span>
                        <input
                            type="checkbox"
                            :value="tag.id"
                            v-model="filters"
                            disabled
                        />
                        <div class="control_indicator"></div>
                    </label>
                </div>
            </div>
        </div>
        <!-- AI Tutor -->
        <div class="row mt-3 mb-3" ref="aiTutorSection">
            <!-- Only show AI tutor for Student -->
            <!-- Not show AI tutor for domain type of skill-->
            <AITutor
                v-if="
                    isSkillLoaded &&
                    (userDetailsStore.role === 'student' ||
                        !sessionDetailsStore.isLoggedIn) &&
                    skill.type !== 'domain'
                "
                :skill="skill"
                :showTutorialTip7="showTutorialTip7"
                :showTutorialTip8="showTutorialTip8"
                :showTutorialTip9="showTutorialTip9"
                :areAllSubskillsMastered="areAllSubskillsMastered"
                @skipTutorial="skipTutorial"
                @progressTutorial="progressTutorial"
                @skillMastered="handleSkillMastered"
            />

            <div
                v-else-if="
                    isSkillLoaded &&
                    userDetailsStore.role === 'student' &&
                    skill.type !== 'domain'
                "
            >
                <em
                    >You have reached your monthly AI token limit. Please
                    recharge your subscription to use more.</em
                >
            </div>
            <!-- Skill Mastered Modal -->
            <div v-if="showMasteryModal" class="modal">
                <div class="modal-content mastery-modal">
                    <div class="text-center mb-4">
                        <h2 class="heading">Congratulations!</h2>
                        <p class="mb-3">
                            You have mastered the skill
                            <strong>{{ skill.name }}</strong
                            >!
                        </p>

                        <!-- Trophy icon -->
                        <div class="trophy-icon mb-3">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 576 512"
                                width="80"
                                height="80"
                                fill="#FFD700"
                            >
                                <!-- Font Awesome Trophy Icon -->
                                <path
                                    d="M400 0H176c-26.5 0-48.1 21.8-47.1 48.2c.2 5.3 .4 10.6 .7 15.8H24C10.7 64 0 74.7 0 88c0 92.6 33.5 157 78.5 200.7c44.3 43.1 98.3 64.8 138.1 75.8c23.4 6.5 39.4 26 39.4 45.6c0 20.9-17 37.9-37.9 37.9H192c-17.7 0-32 14.3-32 32s14.3 32 32 32H384c17.7 0 32-14.3 32-32s-14.3-32-32-32H357.9C337 448 320 431 320 410.1c0-19.6 15.9-39.2 39.4-45.6c39.9-11 93.9-32.7 138.2-75.8C542.5 245 576 180.6 576 88c0-13.3-10.7-24-24-24H446.4c.3-5.2 .5-10.4 .7-15.8C448.1 21.8 426.5 0 400 0zM48.9 112h84.4c9.1 90.1 29.2 150.3 51.9 190.6c-24.9-11-50.8-26.5-73.2-48.3c-32-31.1-58-76-63-142.3zM464.1 254.3c-22.4 21.8-48.3 37.3-73.2 48.3c22.7-40.3 42.8-100.5 51.9-190.6h84.4c-5.1 66.3-31.1 111.2-63 142.3z"
                                />
                            </svg>
                        </div>
                    </div>

                    <div class="d-flex justify-content-center">
                        <button
                            class="btn primary-btn"
                            @click="showMasteryModal = false"
                        >
                            Continue
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Posts -->
        <div v-if="skill.type != 'domain'">
            <div class="row mt-3 mb-3">
                <Forum
                    v-if="isSkillLoaded"
                    :skillId="skill.id"
                    :showTutorialTip10="showTutorialTip10"
                    :userRole="userDetailsStore.role"
                    @skipTutorial="skipTutorial"
                    @progressTutorial="progressTutorial"
                />
            </div>
        </div>
        <p>&nbsp;</p>
    </div>
    <div
        v-if="showConfirmModal"
        @click="showConfirmModal = false"
        class="modal"
    >
        <!-- Confirm Modal -->
        <div class="modal-content asking-modal">
            <p>URL copied to clipboard</p>

            <!-- Buttons row -->
            <div class="d-flex justify-content-end gap-2">
                <button
                    type="button"
                    class="btn primary-btn modal-btn"
                    @click="showConfirmModal = false"
                >
                    <span class="d-none d-md-block"> OK </span>
                    <!-- X icon Only show when in Phone View -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="18"
                        height="18"
                        fill="white"
                        class="d-md-none"
                    >
                        <path
                            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Category skill completed, and next skills in branch modal -->
    <div v-if="showCategoryCompletedModal" class="modal">
        <div class="modal-content">
            <h1 class="heading h5">You have completed {{ skill.name }}!</h1>
            <p>The next skills in this branch are:</p>
            <div v-for="nextSkill in nextSkillsInBranch">
                <router-link
                    :class="{
                        'grade-school': nextSkill.level == 'grade_school',
                        'middle-school': nextSkill.level == 'middle_school',
                        'high-school': nextSkill.level == 'high_school',
                        college: nextSkill.level == 'college',
                        phd: nextSkill.level == 'phd'
                    }"
                    class="skill-link btn mb-1"
                    :to="`/skills/${nextSkill.url}`"
                    target="_blank"
                >
                    {{ nextSkill.name }}
                </router-link>
            </div>
            <button
                class="btn primary-btn ms-auto me-0"
                @click="showCategoryCompletedModal = false"
            >
                Close
            </button>
        </div>
    </div>

    <!-- flag modals component -->
    <FlagModals
        v-if="showFlaggingModal"
        :userId="userDetailsStore.userId"
        contentType="skill"
        :contentId="skillId"
    />

    <!-- Tooltip modals -->
    <!-- Student -->
    <div
        v-if="
            userDetailsStore.role == 'student' &&
            (showTutorialTip1 || showTutorialTip5 || showTutorialTip11)
        "
        class="modal"
    >
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>
                    Here is where you can learn about a subject, find resources
                    for mastering it, and take a test to demonstrate your
                    mastery.
                </p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(1)"
                    >
                        next
                    </button>
                    <button class="btn red-btn" @click="skipTutorial">
                        exit tutorial
                    </button>
                </div>
            </div>
            <div v-else-if="showTutorialTip5">
                <p>
                    The "Requirements for Mastery" and "Learning Objectives"
                    sections explain everything one needs to learn to master the
                    skill.
                </p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(5)"
                    >
                        next
                    </button>
                    <button class="btn red-btn" @click="skipTutorial">
                        exit tutorial
                    </button>
                </div>
            </div>
            <div v-else-if="showTutorialTip11">
                <p>
                    Remember that you can master this skill in two ways: by
                    taking the formal assessment test at the top of the page, or
                    by successfully completing an assessment session with the
                    Assessment Tutor. Choose the method that works best for your
                    learning style.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(11)">
                    close
                </button>
            </div>
        </div>
    </div>

    <!-- Editor -->
    <div
        v-if="
            userDetailsStore.role == 'editor' &&
            (showTutorialTip1 || showTutorialTip4 || showTutorialTip5)
        "
        class="modal"
    >
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>
                    Here is where you can learn about a subject, find resources
                    for mastering it, and take a test to demonstrate your
                    mastery.
                </p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(1)"
                    >
                        next
                    </button>
                    <button class="btn red-btn" @click="skipTutorial">
                        exit tutorial
                    </button>
                </div>
            </div>
            <div v-else-if="showTutorialTip4">
                <p>
                    The "Requirements for mastery" section explains everything a
                    student needs to learn to master the skill.
                </p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(4)"
                    >
                        next
                    </button>
                    <button class="btn red-btn" @click="skipTutorial">
                        exit tutorial
                    </button>
                </div>
            </div>
            <div v-else-if="showTutorialTip5">
                <p>
                    At the bottom of the page, in the "Best Places To Learn
                    This" section, students can find various sites and resources
                    to learn about this topic.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(5)">
                    close
                </button>
            </div>
        </div>
    </div>

    <!-- Instructor -->
    <div
        v-if="
            userDetailsStore.role == 'instructor' &&
            (showTutorialTip1 || showTutorialTip4 || showTutorialTip5)
        "
        class="modal"
    >
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>
                    This page is where students can learn about, and take a test
                    to try to master, this skill.
                </p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(1)"
                    >
                        next
                    </button>
                    <button class="btn red-btn" @click="skipTutorial">
                        exit tutorial
                    </button>
                </div>
            </div>
            <div v-else-if="showTutorialTip4">
                <p>
                    The "Requirements for mastery" section explains everything a
                    student needs to learn to master the skill.
                </p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(4)"
                    >
                        next
                    </button>
                    <button class="btn red-btn" @click="skipTutorial">
                        exit tutorial
                    </button>
                </div>
            </div>
            <div v-else-if="showTutorialTip5">
                <p>
                    At the bottom of the page, in the "Best Places To Learn
                    This" section, students can find various sites and resources
                    to learn about this topic.
                </p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(5)"
                    >
                        close
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.mastery-modal {
    max-width: 400px;
    padding: 30px;
    text-align: center;
    animation: fadeIn 0.5s;
}

.trophy-icon {
    display: flex;
    justify-content: center;
    margin: 20px 0;
    animation: trophy-bounce 1s ease-in-out;
}

@keyframes trophy-bounce {
    0% {
        transform: translateY(-20px);
        opacity: 0;
    }
    50% {
        transform: translateY(10px);
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

p {
    color: black !important;
}

.plus-btn {
    height: 44px;
}

/* Mastery Reqruirements Section */
::v-deep(.mastery-requirements-section p) {
    font-family: 'Poppins' !important;
    color: black !important;
}

/* Tooltips */
.hovering-info-panel {
    position: absolute;
    z-index: 100;
    /* border-color: var(--primary-color);
    border-width: 2px;
    border-style: solid; */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    width: fit-content;
    margin-bottom: 0 !important; /* Remove any margin that might push content */
}

.narrow-info-panel {
    max-width: 300px;
}

.edit-btn {
    display: flex;
}

.assessment-btn {
    height: auto;
    max-height: 48px;
    border: 3px solid var(--secondary-contrast-color);
    font-weight: 500;
    padding: 5px;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
    text-wrap: nowrap;
    border-style: solid;
    background-color: #7f1e1e;
    color: white; /* Matching the text color used by both buttons */
}

.info-box {
    border: 1px solid #a2a9b1;
    color: black;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

.skill-description {
    font-family: 'Poppins', sans-serif;
    color: #888;
}

.hr {
    border-color: var(--dark-color) !important;
}

#skill-info-container {
    background-color: #f2edffcc;
    border-radius: 12px;
    padding: 10px 30px;
}

.domain {
    border-width: 4px;
    border-color: black;
    border-style: solid;
}

.flag-icon {
    height: 20px !important;
}

.modal-btn {
    width: 25%;
}

/* Specific phone view css */
@media (max-width: 576px) {
    h2 {
        text-align: center;
    }

    #skill-info-container {
        padding: 10px 20px;
    }

    .skill-name {
        margin-top: 5px;
        font-size: 25px;
        margin: 0px 5px;
    }

    .modal-content {
        margin-top: 100%;
        width: 90%;
    }

    .skill-description {
        font-size: 16px;
        text-align: center;
        margin-top: 5px;
    }

    .h1-title {
        font-size: 20px;
        margin-left: 4px;
    }

    .modal-btn {
        width: fit-content;
    }

    .reason-popup {
        width: 100%;
        top: 25%;
    }

    .top-row {
        flex-direction: column;
    }
}

/* ************************* */
/* Tablet Styling */
@media (min-width: 577px) and (max-width: 1023px) {
    .modal-content {
        width: 70%;
    }

    #skill-info-container {
        padding: 5px 15px;
    }

    .modal-btn {
        width: fit-content;
    }
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    /* Modal Content/Box */
    .modal-content {
        width: 90% !important;
        margin: auto;
        margin-top: 30%;
    }
}

/* For next skill in branch suggestion */
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

.skill-link:hover {
    border: 1px solid black;
}
</style>
