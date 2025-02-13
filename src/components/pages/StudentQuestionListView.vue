<script lang="ts">
import StudentQuestionList from '../components/StudentQuestionList.vue';
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        userDetailsStore.getUserDetails();
        return {
            userDetailsStore
        };
    },

    data() {
        return {
            questions: []
        };
    },
    components: {
        StudentQuestionList
    },
    async created() {
        if (this.userDetailsStore.role == 'instructor') {
            await this.getStudentMCQuestions();
        }
    },
    methods: {
        async getStudentMCQuestions() {
            const result = await fetch(
                '/questions/student-mc-questions/full-data-list'
            );
            const data = await result.json();
            this.questions = data;
        }
    }
};
</script>

<template>
    <div class="container">
        <!-- Student Added Questions List -->
        <StudentQuestionList
            v-if="userDetailsStore.role == 'instructor'"
            :questions="questions"
        />
    </div>
</template>

<style scoped></style>
