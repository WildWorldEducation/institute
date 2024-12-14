import { defineStore } from 'pinia';

export const useUsersStore = defineStore('users', {
    state: () => ({
        users: [],
        usersIncludingDeleted: [],
        instructors: [],
        editors: [],
        studentsOfInstructor: [],

    }),
    actions: {
        async getUsers() {
            const result = await fetch('/users/list');
            const data = await result.json();
            this.users = data;
        },
        async getUsersIncludingDeleted() {
            const result = await fetch('/users/list-including-deleted');
            const data = await result.json();
            this.usersIncludingDeleted = data;
        },
        async getInstructors() {
            const result = await fetch('/users/instructors/list');
            const data = await result.json();
            this.instructors = data;
        },
        async getEditors() {
            const result = await fetch('/users/editors/list');
            const data = await result.json();
            this.editors = data;
        },
        async getStudentsOfUser(instructorId) {
            const result = await fetch(`/users/student-of-instructors/${instructorId}`)
            const data = await result.json();
            console.log(result)
            console.log(data)
            this.studentsOfInstructor = data

        },
        async deleteUser(id) {
            this.users = this.users.filter((u) => {
                return u.id !== id;
            });

            const result = fetch('/users/' + id, {
                method: 'DELETE'
            });

            if (result.error) {
                console.log(result.error);
            }
        },
    }
});
