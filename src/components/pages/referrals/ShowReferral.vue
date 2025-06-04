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
            partnerId: this.$route.params.partnerId,
            referredUserId: this.$route.params.referredUserId,
            receipts: []
        };
    },
    async created() {
        console.log(this.$route.params.partnerId);
        // if (typeof this.usersDetailsStore.userId == 'undefined') {
        //     await this.usersDetailsStore.getUserDetails();
        // }
        this.getReferral();
    },
    methods: {
        getReferral() {
            fetch(`/referrals/get-receipts/${this.referredUserId}`)
                .then(function (response) {
                    return response.json();
                })
                .then(async (data) => {
                    this.receipts = data;
                    console.log(this.receipts);
                });
        }
    }
};
</script>

<template>
    <div class="container bg-light rounded">
        <h1 class="heading">{{ referredUserId }}</h1>
    </div>
</template>

<style scoped></style>
