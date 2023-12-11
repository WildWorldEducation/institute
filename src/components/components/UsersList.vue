<script>
// Import the users store.
import { useUsersStore } from '../../stores/UsersStore'
import { useUserDetailsStore } from '../../stores/UserDetailsStore'
import { useInstructorStudentsStore } from '../../stores/InstructorStudentsStore'

export default {
    setup() {
        const usersStore = useUsersStore();
        const userDetailsStore = useUserDetailsStore();
        const instructorStudentsStore = useInstructorStudentsStore();

        // Run the GET request.
        if (usersStore.users.length < 1)
            usersStore.getUsers()
        return {
            usersStore, userDetailsStore, instructorStudentsStore
        }
    },
    data() {
        return {
            students: []
        }
    },
    async created() {
        // Get the instructor student list, if not yet loaded.
        if (this.instructorStudentsStore.instructorStudentsList.length == 0) {
            await this.instructorStudentsStore.getInstructorStudentsList()
        }

        if (this.userDetailsStore.role == "instructor")
            this.getStudents()
    },
    methods: {
        changeUserId(userId) {
            this.$emit('changeUserId', userId)
            if (this.userDetailsStore.role == "instructor")
                this.getStudents()
        },
        getStudents() {
            var studentIds = [];
            for (let i = 0; i < this.instructorStudentsStore.instructorStudentsList.length; i++) {
                if (this.instructorStudentsStore.instructorStudentsList[i].instructor_id == this.userDetailsStore.userId) {
                    studentIds.push(this.instructorStudentsStore.instructorStudentsList[i].student_id)
                }
            }
            console.log(studentIds)
            for (let i = 0; i < this.usersStore.users.length; i++) {
                for (let j = 0; j < studentIds.length; j++) {
                    if (this.usersStore.users[i].id == studentIds[j]) {
                        this.students.push(this.usersStore.users[i])
                    }
                }
            }
        }
    }
}
</script>

<template>
    <div class="container mt-3">
        <div v-if="userDetailsStore.role == 'admin'" v-for="user in usersStore.users">
            <div class="d-flex">
                <img class="user-avatars" v-if="user.avatar != null" :src="user.avatar" height="40" />
                <button class="user-buttons" @click="changeUserId(user)">
                    {{ user.first_name }} {{ user.last_name }}
                </button>
            </div>
            <hr>
        </div>
        <div v-else-if="userDetailsStore.role == 'instructor'" v-for="student in students">
            <div class="d-flex">
                <img class="user-avatars" v-if="student.avatar != null" :src="student.avatar" height="40" />
                <button class="user-buttons" @click="changeUserId(student)">
                    {{ student.first_name }} {{ student.last_name }}
                </button>
            </div>
            <hr>
        </div>
    </div>
</template>


<style scoped>
.user-avatars {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    border: 1px solid #7F56D9;
    margin-right: 22px;
}

.user-buttons {
    width: 283px;
    height: 80px;
    border-radius: 8px;
    border: 1px solid #7F56D9;
    background-color: #C8D7DA;
    color: white;
}
</style>