<script>
import { useUsersStore } from '../../stores/UsersStore';

export default {
    setup() {
        const usersStore = useUsersStore();
        return {
            usersStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.id,
            skill: {},
            skillRevisions: [],
            currentVersionNumber: null
        };
    },
    async created() {
        await this.getSkill();
        // Set up the first user in the array to be selected on the page initially.
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
        await this.getRevisions();
    },
    async mounted() {},
    methods: {
        async getSkill() {
            // Load the skill data
            const res = await fetch('/skills/show/' + this.skillId);
            this.skill = await res.json();
            this.currentVersionNumber = this.skill.version_number;
        },
        async getRevisions() {
            // Load the skill data
            const res = await fetch('/skill-history/' + this.skillId + '/list');
            this.skillRevisions = await res.json();

            // Prepare the data.
            for (let i = 0; i < this.skillRevisions.length; i++) {
                // Prep the date and time data ---------------
                // Split timestamp into [ Y, M, D, h, m, s ]
                var date = this.skillRevisions[i].edited_date.replace('T', ' ');
                date = date.replace('Z', ' ');
                let newDate = date.split(/[- :]/);
                // Apply each element to the Date function
                var finalDate = new Date(
                    Date.UTC(
                        newDate[0],
                        newDate[1] - 1,
                        newDate[2],
                        newDate[3],
                        newDate[4],
                        newDate[5]
                    )
                );
                var options = {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric'
                };
                this.skillRevisions[i].edited_date =
                    finalDate.toLocaleDateString('en-US', options);

                // -----------------------
                // Prep the users data.
                let user = this.usersStore.users.find(
                    (o) => o.id === this.skillRevisions[i].user_id
                );
                this.skillRevisions[i].username = user.username;
                //-------------
                this.skillRevisions[i].isCurrentRevision = false;
                if (
                    this.skillRevisions[i].version_number ==
                    this.currentVersionNumber
                ) {
                    this.skillRevisions[i].isCurrentRevision = true;
                }
            }
        }
    }
};
</script>

<template>
    <div class="container">
        <h1>{{ skill.name }}: Revision history</h1>
        <ul>
            <li v-for="revision in skillRevisions">
                <router-link
                    :to="
                        '/skills/' +
                        skillId +
                        '/revision/' +
                        revision.version_number
                    "
                    >{{ revision.edited_date }}</router-link
                >, {{ revision.username
                }}<span v-show="revision.isCurrentRevision"
                    >, (current revision)</span
                >
            </li>
        </ul>
    </div>
</template>

<style scoped>
h1 {
    color: #a48be6;
    font-size: 30px;
    font-weight: 700;
    margin-bottom: 5px;
}
</style>
