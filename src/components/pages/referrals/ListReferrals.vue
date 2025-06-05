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
            referrals: []
        };
    },
    async created() {
        if (typeof this.usersDetailsStore.userId == 'undefined') {
            await this.usersDetailsStore.getUserDetails();
        }
        await this.getReferrals();
    },
    methods: {
        async getReferrals() {
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
                    console.log(this.referrals);
                });
        }
    }
};
</script>

<template>
    <div class="container bg-light rounded">
        <h1 class="heading">Referrals</h1>
        <ul>
            <li v-for="referral in referrals">
                <p>
                    <router-link
                        :to="
                            '/referrals/' +
                            referral.referrer_user_id +
                            '/' +
                            referral.referred_user_id
                        "
                        ><strong>{{
                            referral.referredUser
                        }}</strong></router-link
                    >
                </p>
            </li>
        </ul>
    </div>
</template>

<style scoped></style>
