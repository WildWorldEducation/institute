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
            const resultArray = this.newSkillsAwaitingApproval.map((skill) => {
                const user = this.usersStore.findUserById(skill.user_id);

                return { ...skill, username: user.username };
            });

            this.newSkillsAwaitingApproval = resultArray;
            console.log('anc nsl mkd');
            console.log(this.newSkillsAwaitingApproval);
        }
    }
};
</script>

<template>
    <div class="mt-3 table-div h-100">
        <!-- Page tile -->
        <h2 class="heading">Suggested New Skills</h2>
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
