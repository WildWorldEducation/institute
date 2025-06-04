<script>
import { useUsersStore } from '../../../stores/UsersStore';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const usersStore = useUsersStore();
        const usersDetailsStore = useUserDetailsStore();
        return {
            usersStore,
            usersDetailsStore
        };
    },
    data() {
        return {
            referral: {}
        };
    },
    async created() {
        if (typeof this.usersDetailsStore.userId == 'undefined') {
            await this.usersDetailsStore.getUserDetails();
        }
        this.getReferral();
    },
    methods: {
        getReferral() {
            fetch(`/referrals/${this.usersDetailsStore.userId}/list`)
                .then(function (response) {
                    return response.json();
                })
                .then(async (data) => {
                    await this.usersStore.getUsers();
                    this.referrals = data;
                    for (let i = 0; i < this.referrals.length; i++) {
                        for (let j = 0; j < this.usersStore.users.length; j++) {
                            // Get referred user
                            if (
                                this.referrals[i].referred_user_id ==
                                this.usersStore.users[j].id
                            ) {
                                this.referrals[i].referredUser =
                                    this.usersStore.users[j].username;
                            }
                            // Get referring user
                            if (
                                this.referrals[i].referrer_user_id ==
                                this.usersStore.users[j].id
                            ) {
                                this.referrals[i].referringUser =
                                    this.usersStore.users[j].username;
                            }
                        }
                    }
                });
        }
    }
};
</script>

<template>
    <div class="container bg-light rounded">
        <h1 class="heading">show</h1>
    </div>
</template>

<style scoped></style>
