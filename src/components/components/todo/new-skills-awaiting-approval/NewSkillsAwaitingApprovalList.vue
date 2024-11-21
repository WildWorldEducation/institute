<script>
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useUsersStore } from '../../../../stores/UsersStore';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userDetailsStore = useUserDetailsStore();
        return { usersStore, userDetailsStore };
    },
    data() {
        return {
            newSkillsAwaitingApproval: []
        };
    },
    components: {},
    async mounted() {
        await this.getNewSkillsAwaitingApproval();
        if (this.usersStore.users.length < 1) {
            await this.usersStore.getUsers();
        }
        await this.addUserNameToSkillArray();
    },
    methods: {
        async getNewSkillsAwaitingApproval() {
            await fetch('/new-skills-awaiting-approval/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.newSkillsAwaitingApproval = data;
                });
        },
        async addUserNameToSkillArray() {
            const resultArray = this.newSkillsAwaitingApproval.map((skill) => {
                const user = this.usersStore.findUserById(skill.user_id);

                return { ...skill, username: user.username };
            });

            this.newSkillsAwaitingApproval = resultArray;
        }
    }
};
</script>

<template>
    <div class="mt-3 table-div h-100">
        <div v-for="skill in newSkillsAwaitingApproval">
            {{ skill.name }}, {{ skill.username }}
        </div>
    </div>
</template>

<style scoped></style>
