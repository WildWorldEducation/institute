import { defineStore } from 'pinia';
import { useUserDetailsStore } from './UserDetailsStore.js';
import { useSkillTreeStore } from './SkillTreeStore.js';

export const useLearningTracksStore = defineStore('learning-tracks', {
    state: () => ({
        learningTracks: [
            {
                id: null,
                name: ''
            }
        ],
        selectedLearningTrack: {
            id: null,
            name: '',
            skills: []
        },
        areSkillsLoaded: false
    }),
    actions: {
        // Load learning tracks for this user.
        async getLearningTracks() {
            const userDetailsStore = useUserDetailsStore();
            if (userDetailsStore.userId == null)
                await userDetailsStore.getUserDetails();
            let url = '/learning-tracks/' + userDetailsStore.userId + '/list';
            let result = await fetch(url);
            this.learningTracks = await result.json();
        },
        async loadLearningTrack() {
            this.areSkillsLoaded = false;
            const userDetailsStore = useUserDetailsStore();

            if (this.selectedLearningTrack.id == -1) {
                const skillTreeStore = useSkillTreeStore();
                this.selectedLearningTrack.skills =
                    await skillTreeStore.getCustomLearningTrackSkills();
            } else {
                let url = '/learning-tracks/' + this.selectedLearningTrack.id;
                const requestOption = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: userDetailsStore.userId,
                        cohortId: userDetailsStore.cohortId
                    })
                };
                let result = await fetch(url, requestOption);
                this.selectedLearningTrack.skills = await result.json();
            }
            this.areSkillsLoaded = true;
        }
    }
});
