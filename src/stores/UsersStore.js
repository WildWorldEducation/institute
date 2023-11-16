import { defineStore } from 'pinia'

export const useUsersStore = defineStore("users", {
    state: () => ({
        users: [],
    }),
    actions: {
        async getUsers() {
            const result = await fetch('/users/list');
            const data = await result.json();
            this.users = data;
        },
        async deleteUser(id) {
            this.users = this.users.filter(u => {
                return u.id !== id
            })

            const result = fetch('/users/' + id,
                {
                    method: 'DELETE',
                });

            if (result.error) {
                console.log(result.error)
            }
        }
    }
});