<script>
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import { useUsersStore } from '../../../../stores/UsersStore';
import NewSkillTable from './NewSkillTable.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userDetailsStore = useUserDetailsStore();
        return { usersStore, userDetailsStore };
    },
    data() {
        return {
            newSkillsAwaitingApproval: [],
            loadingSkill: true
        };
    },
    components: {
        NewSkillTable
    },
    async mounted() {
        await this.getNewSkillsAwaitingApproval();
        if (this.usersStore.users.length < 1) {
            await this.usersStore.getUsers();
        }
        await this.addUserNameToSkillArray();
        this.loadingSkill = false;
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
            for (let i = 0; i < this.newSkillsAwaitingApproval.length; i++) {
                for (let j = 0; j < this.usersStore.users.length; j++) {
                    if (
                        this.newSkillsAwaitingApproval[i].user_id ==
                        this.usersStore.users[j].id
                    ) {
                        this.newSkillsAwaitingApproval[i].username =
                            this.usersStore.users[j].username;
                    }
                }
            }
        }
    }
};
</script>

<template>
    <div class="mt-3 table-div h-100">
        <NewSkillTable
            :newSkillArray="newSkillsAwaitingApproval"
            :loadingSkill="loadingSkill"
        />
    </div>
</template>

<style scoped>
.img-fluid {
    width: 100% !important;
}
</style>
