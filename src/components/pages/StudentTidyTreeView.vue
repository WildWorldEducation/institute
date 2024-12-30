<script>
import StudentTidyTree from '../components/skilltrees/StudentTidyTree.vue';
import { useUsersStore } from '../../stores/UsersStore';
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            usersStore,
            userDetailsStore
        };
    },
    data() {
        return {
            studentName: '',
            showTutorialTip1: true,
            showTutorialTip2: false
        };
    },
    async created() {
        if (
            this.userDetailsStore.role == 'instructor' ||
            this.userDetailsStore.role == 'admin'
        ) {
            this.instructorId = this.userDetailsStore.userId;
        } else {
            alert('Only admin or instructors can access this page.');
            this.$router.push('/');
        }
        if (this.usersStore.users.length == 0) await this.usersStore.getUsers();
        for (let i = 0; i < this.usersStore.users.length; i++) {
            if (this.usersStore.users[i].id == this.$route.params.studentId) {
                this.studentName = this.usersStore.users[i].username;
            }
        }

        // Check if tutorial has been seen.
        if (
            localStorage.getItem('isStudentVerticalTreeTutorialCompleted') !=
            'true'
        ) {
            this.showTutorialTip1 = true;
        }
    },
    components: {
        StudentTidyTree
    },
    methods: {
        progressTutorial(step) {
            if (step == 1) {
                this.showTutorialTip1 = false;
                this.showTutorialTip2 = true;
            } else if (step == 2) {
                this.showTutorialTip2 = false;
                // Store
                localStorage.setItem(
                    'isStudentVerticalTreeTutorialCompleted',
                    'true'
                );
            }
        }
    }
};
</script>

<template>
    <!-- Display loading screen while asynchronous call is made. -->
    <Suspense>
        <template #default>
            <StudentTidyTree
                :studentId="$route.params.studentId"
                :studentName="studentName"
            />
        </template>
        <template #fallback>
            <span>Loading...</span>
        </template>
    </Suspense>

    <!-- Tooltip modal -->
    <div v-if="showTutorialTip1 || showTutorialTip2" class="modal">
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>This is your student's skill tree.</p>
                <button class="btn primary-btn" @click="progressTutorial(1)">
                    next
                </button>
            </div>
            <div v-else-if="showTutorialTip2">
                <p>
                    You can get a bird's eye view of their progress from here.
                </p>
                <button class="btn primary-btn" @click="progressTutorial(2)">
                    close
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Modals */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 2000;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    /* Modal Content/Box */
    .modal-content {
        width: 90%;
        margin-top: 30%;
    }
}
</style>
