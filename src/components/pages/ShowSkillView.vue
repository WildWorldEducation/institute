<script>
import ShowSkill from '../components/ShowSkill.vue';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
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
    components: {
        ShowSkill
    },
    mounted() {
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
    beforeRouteLeave(to, from, next) {
        if (
            !this.userDetailsStore.userId ||
            this.$refs.childComponent.skill.type == 'domain'
        ) {
            next();
            return;
        }
        // Record the end time and calculate the duration
        this.userEndTime = Date.now();
        this.duration = this.userEndTime - this.userStartTime;
        const skillId = this.$refs.childComponent.skillId;
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
        next();
    },
    methods: {
        resetTimer() {
            console.log('Action');
            this.lastActivityTime = Date.now();
            if (!this.isActive) {
                this.isActive = true;
                console.log('User became active again');
            }
        }
    }
};
</script>

<template>
    <div class="position-relative d-flex">
        <div class="container">
            <ShowSkill ref="childComponent" />
        </div>
    </div>
</template>

<style scoped></style>
