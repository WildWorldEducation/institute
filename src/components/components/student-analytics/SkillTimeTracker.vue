<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import { useShowSkillStore } from '../../../stores/ShowSkillStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const showSkillStore = useShowSkillStore();

        return {
            userDetailsStore,
            showSkillStore
        };
    },
    data() {
        return {
            skillUrl: this.$route.params.skillUrl,
            // Record time spent on the skill
            userStartTime: null,
            userEndTime: null,
            duration: null,
            // Check for inactivity, and dont record time if inactive
            lastActivityTime: Date.now(),
            inactivityThreshold: 30000, // 30 seconds
            isActive: true
        };
    },
    mounted() {
        console.log('test');
        this.userStartTime = Date.now();
        // Events that signal activity
        ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'].forEach(
            (event) => window.addEventListener(event, this.resetTimer)
        );
        // Inactivity check every second
        setInterval(() => {
            const now = Date.now();
            if (now - this.lastActivityTime > this.inactivityThreshold) {
                if (this.isActive) {
                    this.isActive = false;
                    console.log('User is inactive');
                }
            }
        }, 1000);
    },
    methods: {
        resetTimer() {
            this.lastActivityTime = Date.now();
            if (!this.isActive) {
                this.isActive = true;
                console.log('User became active again');
            }
        },
        saveDuration() {
            // Record the end time and calculate the duration
            this.userEndTime = Date.now();
            this.duration = this.userEndTime - this.userStartTime;
            let skillId;
            if (this.showSkillStore.skill) {
                skillId = this.showSkillStore.skill.id;
            } else if (this.$parent.skillId) {
                skillId = this.$parent.skillId;
            } else if (this.$route.params.skillId) {
                skillId = this.$route.params.skillId;
            } else if (this.$parent.skill.id) {
                skillId = this.$parent.skill.id;
            }
            console.log(skillId);
            console.log(this.duration);
            console.log(this.userDetailsStore.userId);
            fetch(
                '/student-analytics/record-duration/' +
                    this.userDetailsStore.userId +
                    '/' +
                    skillId,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        duration: this.duration
                    })
                }
            );
        }
    }
};
</script>

<template></template>

<style scoped></style>
