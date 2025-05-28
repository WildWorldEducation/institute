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
            isUnlockedSkillsOnlyFilter: null,
            reputationScore: null,
            cohortId: null,
            isSkillsLocked: 0,
            tokens: 0,
            monthlyTokenUsage: 0,
            isAudioAutoPlay: 0
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
                this.monthlyTokenUsage = data.monthly_token_usage;
                this.tokens = data.tokens;
                this.isAudioAutoPlay = data.is_audio_auto_play || 0;

                if (this.role == 'student') {
                    await this.getInstructor();
                }

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
        async updateAudioAutoPlay(isAutoPlay) {
            // Update local state
            this.isAudioAutoPlay = isAutoPlay ? 1 : 0;

            // Update the database
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isAudioAutoPlay: this.isAudioAutoPlay
                })
            };

            const url = `/users/update-audio-auto-play/${this.userId}`;
            try {
                const response = await fetch(url, requestOptions);
                return await response.json();
            } catch (error) {
                console.error('Error updating audio auto-play setting:', error);
                return { success: false };
            }
        }
    }
});
