<script>
import { useUsersStore } from '../../../stores/UsersStore';
export default {
    setup() {
        const usersStore = useUsersStore();
        return {
            usersStore
        };
    },
    data() {
        return {
            partnerId: this.$route.params.partnerId,
            partner: {},
            referrals: []
        };
    },
    async created() {
        // Get partner details
        if (this.usersStore.partners.length == 0) {
            await this.usersStore.getPartners();
        }

        for (let i = 0; i < this.usersStore.partners.length; i++) {
            if (this.partnerId == this.usersStore.partners[i].id) {
                this.partner.username = this.usersStore.partners[i].username;
            }
        }

        this.getReferrals();
    },
    methods: {
        getReferrals() {
            fetch('/referrals/' + this.partnerId + '/list')
                .then(async function (response) {
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
        <h1 v-if="partner.username" class="heading">
            {{ partner.username }}'s Referrals
        </h1>
        <ul>
            <li v-for="referral in referrals" :key="referral.referred_user_id">
                <p>
                    <RouterLink
                        :to="`/student-payments/${referral.referred_user_id}`"
                        >{{ referral.referredUser }}</RouterLink
                    >
                </p>
            </li>
        </ul>
    </div>
</template>

<style scoped></style>
