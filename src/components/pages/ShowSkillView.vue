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
            userStartTime: null,
            userEndTime: null,
            duration: null
        };
    },
    components: {
        ShowSkill
    },
    mounted() {
        this.userStartTime = Date.now();
        console.log(this.userDetailsStore.userId);
    },
    beforeRouteLeave(to, from, next) {
        if (!this.userDetailsStore.userId) {
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
    saveDuration() {}
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
