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
            partners: []
        };
    },
    created() {
        this.getPartners();
    },
    methods: {
        getPartners() {
            fetch('/users/partners')
                .then(function (response) {
                    return response.json();
                })
                .then(async (data) => {
                    this.partners = data;
                    console.log(this.partners);
                });
        }
        // getPartners() {
        //     fetch('/referrals/list')
        //         .then(function (response) {
        //             return response.json();
        //         })
        //         .then(async (data) => {
        //             await this.usersStore.getUsers();
        //             this.referrals = data;
        //             for (let i = 0; i < this.referrals.length; i++) {
        //                 for (let j = 0; j < this.usersStore.users.length; j++) {
        //                     // Get referred user
        //                     if (
        //                         this.referrals[i].referred_user_id ==
        //                         this.usersStore.users[j].id
        //                     ) {
        //                         this.referrals[i].referredUser =
        //                             this.usersStore.users[j].username;
        //                     }
        //                     // Get referring user
        //                     if (
        //                         this.referrals[i].referrer_user_id ==
        //                         this.usersStore.users[j].id
        //                     ) {
        //                         this.referrals[i].referringUser =
        //                             this.usersStore.users[j].username;
        //                     }
        //                 }
        //             }

        //             console.log(this.referrals);
        //         });
        // }
    }
};
</script>

<template>
    <div class="container bg-light rounded">
        <h1 class="heading">Partners</h1>
        <ul>
            <li v-for="partner in partners">
                <p>{{ partner.username }}</p>
            </li>
        </ul>
    </div>
</template>

<style scoped></style>
