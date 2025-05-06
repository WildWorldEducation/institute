import { defineStore } from 'pinia';

// Import another store.
import { useSessionDetailsStore } from './SessionDetailsStore.js';
import SubscriptionView from '../components/pages/subscriptions/SubscriptionView.vue';

export const useUserDetailsStore = defineStore('userDetails', {
    state: () => {
        return {
            avatar: null,
            userName: null,
            role: null,
            firstName: null,
            lastName: null,
            password: null,
            email: null,
            userId: null,
            instructorId: null,
            instructorUsername: null,
            isGoogleAuth: null,
            theme: 'original',
            gradeFilter: null,
            subjectFilters: [],
            subSubjectsFilters: [], // additional filter for child nodes
            guestSubJectFilter: [],
            isUnlockedSkillsOnlyFilter: null,
            reputationScore: null,
            cohortId: null,
            isSkillsLocked: 0,
            tokens: 0,
            monthlyTokenUsage: 0,
            subscriptionTier: '',
            monthlyTokenUsage: 0
        };
    },
    actions: {
        async getUserDetails() {
            // First get the user id from the saved Express session.
            const sessionDetailsStore = useSessionDetailsStore();
            const sessionDetails =
                await sessionDetailsStore.getSessionDetails();

            if (sessionDetails.isLoggedIn) {
                this.userId = sessionDetails.userId;

                // Then load the details for the current user.
                const result = await fetch('/users/show/' + this.userId);
                const data = await result.json();
                this.avatar = data.avatar;
                this.userName = data.username;
                this.firstName = data.first_name;
                this.lastName = data.last_name;
                this.role = data.role;
                this.password = data.password;
                this.email = data.email;
                this.isGoogleAuth = data.is_google_auth;
                this.gradeFilter = data.grade_filter;
                this.theme = data.theme;
                this.subjectFilters = data.subjectFilters;
                this.reputationScore = data.reputation_score;
                this.cohortId = data.cohort_id;
                this.isUnlockedSkillsOnlyFilter =
                    data.is_unlocked_skills_only_filter;
                this.subscriptionTier = data.subscription_tier;
                this.monthlyTokenUsage = data.monthly_token_usage;

                if (this.role == 'student') {
                    await this.getInstructor();
                }


                // May Need to convert to save in database later

                //this.subSubjectsFilters = data.subjectFilters.map(data => { return { skillName: data, isLeaf: false } })
                return this.$state;
            }
        },
        async getInstructor() {
            const result = await fetch('/users/instructor/' + this.userId);
            const data = await result.json();
            if (data.length > 0) {
                this.instructorId = data[0].id;
                this.instructorUsername = data[0].username;
                this.isSkillsLocked = data[0].is_skills_locked;
            }
        },
        async updateProfile(userName, skillTreeTheme, avatar) {
            // Update the store.
            this.$patch({
                userName: userName,
                skillTreeTheme: skillTreeTheme,
                avatar: avatar
            });

            // Update the database.
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: userName,
                    avatar: avatar,
                    skilltree_theme: skillTreeTheme
                })
            };
            var url = '/users/profile/' + this.userId + '/edit';
            fetch(url, requestOptions).then(() => {
                // Import the other store.
                const skillTreeStore = useSkillTreeStore();
                var student = {
                    id: this.userId,
                    avatar: this.avatar,
                    skillTreeTheme: this.skillTreeTheme,
                    password: this.password,
                    email: this.email
                };
                skillTreeStore.updateSkillTree(student);
            });
        },
        updateTheme(theme) {
            if (theme == 'instructor') {
                this.theme = 'instructor';
                document.body.classList.remove('editor-theme');
                document.body.classList.add('instructor-theme');
            } else if (theme == 'editor') {
                this.theme = 'editor';
                document.body.classList.remove('instructor-theme');
                document.body.classList.add('editor-theme');
            } else {
                this.theme = 'original';
                document.body.classList.remove('instructor-theme');
                document.body.classList.remove('editor-theme');
            }
            // API call
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    theme: this.theme
                })
            };

            var url = '/users/theme/' + this.userId + '/edit';
            fetch(url, requestOptions);
        },
        async updateTokens(tokensNeeded) {
            // API call
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tokensNeeded: tokensNeeded
                })
            };

            var url = '/users/tokens/' + this.userId + '/update';
            fetch(url, requestOptions);
        },
        // Using array to store what node is showing
        updateSubSubjectFilter(filterObject) {

            // initial the filter data if there are none
            const obj = { skillName: filterObject.skillName, isLeaf: true }
            const isInFilterArray = this.subSubjectsFilters.find(node => node.skillName === filterObject.skillName)
            if (isInFilterArray) {
                this.subSubjectsFilters = this.subSubjectsFilters.filter(node => node.skillName !== filterObject.skillName);
                return
            } else {
                this.subSubjectsFilters.push(obj);
            }
            let haveChildNodeIndex = -1;
            // find if the node in subSubject

            haveChildNodeIndex = this.subSubjectsFilters.findIndex(node => node.skillName === filterObject.parent)

            if (haveChildNodeIndex >= 0) {
                this.subSubjectsFilters[haveChildNodeIndex].isLeaf = false;
            }
        },

        removeSkillFromFilter(skillNodeData) {
            this.subSubjectsFilters = this.subSubjectsFilters.filter(filterObject => filterObject.skillName !== skillNodeData.skill_name)
            let childStack = skillNodeData.children;
            if (!childStack.length) {
                return
            }
            let stopFlag = false;
            while (!stopFlag) {
                if (!childStack.length) {
                    stopFlag = true
                }
                const currentNode = childStack.pop();
                if (currentNode) {
                    this.subSubjectsFilters = this.subSubjectsFilters.filter(subjectFilter => subjectFilter.skillName !== currentNode.skill_name);
                    childStack = childStack.concat(currentNode.children)
                }
            }
        },
        searchSubSubjectFilter(skillName) {
            const result = this.subSubjectsFilters.find(filterObject => filterObject.skillName === skillName)
            return result;
        },
        /**
         * Find if any element in array is in sub-subject filter array
         * Mainly for finding if child of a skill is in sub-subject filter
         * @param {*} skillArray child node data of a skill 
         */
        checkIfHaveSkillInSubSubjectFilter(skillArray) {
            let result = false;
            const skill = skillArray.some(skillData => this.searchSubSubjectFilter(skillData.skill_name));
            if (skill) {
                result = true
            }
            return result;
        },
        // ------------------------------------------------------------
        // Guest Relate filter Actions
        // ------------------------------------------------------------
        // Using array to store what node is showing
        updateGuestSubjectFilter(filterObject) {
            // initial the filter data if there are none
            const obj = { skillName: filterObject.skillName, isLeaf: true }
            const isInFilterArray = this.guestSubJectFilter.find(node => node.skillName === filterObject.skillName)
            if (isInFilterArray) {
                this.subSubjectsFilters = this.guestSubJectFilter.filter(node => node.skillName !== filterObject.skillName);
                return
            } else {
                this.guestSubJectFilter.push(obj);
            }
            let haveChildNodeIndex = -1;
            // find if the node in subSubject

            haveChildNodeIndex = this.guestSubJectFilter.findIndex(node => node.skillName === filterObject.parent)

            if (haveChildNodeIndex >= 0) {
                this.subSubjectsFilters[haveChildNodeIndex].isLeaf = false;
            }
        },

        removeSkillFromGuestFilter(skillNodeData) {
            this.guestSubJectFilter = this.guestSubJectFilter.filter(filterObject => filterObject.skillName !== skillNodeData.skill_name)
            let childStack = skillNodeData.children;
            if (!childStack.length) {
                return
            }
            let stopFlag = false;
            while (!stopFlag) {
                if (!childStack.length) {
                    stopFlag = true
                }
                const currentNode = childStack.pop();
                if (currentNode) {
                    this.guestSubJectFilter = this.guestSubJectFilter.filter(subjectFilter => subjectFilter.skillName !== currentNode.skill_name);
                    childStack = childStack.concat(currentNode.children)
                }
            }
        },
        searchGuestSubSubjectFilter(skillName) {
            const result = this.subSubjectsFilters.find(filterObject => filterObject.skillName === skillName)
            return result;
        },
        /**
         * Find if any element in array is in sub-subject filter array
         * Mainly for finding if child of a skill is in sub-subject filter
         * @param {*} skillArray child node data of a skill 
         */
        checkIfHaveGuestSkillIntSubSubjectFilter(skillArray) {
            let result = false;
            const skill = skillArray.some(skillData => this.searchGuestSubSubjectFilter(skillData.name));
            if (skill) {
                result = true
            }
            return result;
        },
        // change the isLeaf status of the filter object
        changeIsLeafStatus(skillName) {
            this.subSubjectsFilters = this.subSubjectsFilters.map(filterObject => {
                if (filterObject.skillName === skillName) {
                    return { ...filterObject, isLeaf: !filterObject.isLeaf };
                }
                return filterObject;
            });
        }
    }
});
