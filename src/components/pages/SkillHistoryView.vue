<script>
import { useUsersStore } from '../../stores/UsersStore';
import HistoryRow from '../components/revision-history/historyRow.vue';
import HistoryRowTabletPhone from '../components/revision-history/HistoryRowTabletPhone.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        return {
            usersStore
        };
    },
    data() {
        return {
            skillUrl: this.$route.params.skillUrl,
            skill: {},
            skillRevisions: [],
            currentVersionNumber: null,
            isLoaded: false
        };
    },
    components: { HistoryRow, HistoryRowTabletPhone },
    async created() {
        if (this.usersStore.usersIncludingDeleted.length < 1)
            await this.usersStore.getUsersIncludingDeleted();
        await this.getSkill();
    },
    async mounted() {},
    methods: {
        async getSkill() {
            // Load the skill data
            const res = await fetch('/skills/url/' + this.skillUrl);
            this.skill = await res.json();
            this.currentVersionNumber = this.skill.version_number;
            await this.getRevisions();
        },
        async getRevisions() {
            // Load the skill data
            const res = await fetch(
                '/skill-history/' + this.skill.id + '/list'
            );
            this.skillRevisions = await res.json();

            // Prepare the data.
            for (let i = 0; i < this.skillRevisions.length; i++) {
                this.skillRevisions[i].timeStamp =
                    this.skillRevisions[i].edited_date;
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
                let user = this.usersStore.usersIncludingDeleted.find(
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

                if (i + 1 === this.skillRevisions.length && i > 0) {
                    this.skillRevisions[i].isOrigin = true;
                } else {
                    this.skillRevisions[i].lastRevision =
                        this.skillRevisions[i + 1];
                }
            }
            this.isLoaded = true;
        }
    }
};
</script>

<template>
    <div class="container bg-light rounded p-3">
        <h1 class="heading">{{ skill.name }}: Revision history</h1>
        <hr />
        <div class="d-none d-lg-flex flex-column">
            <HistoryRow
                v-if="isLoaded"
                v-for="revision in skillRevisions"
                :revision="revision"
                :skill="skill"
            />
        </div>
        <div class="d-flex d-lg-none flex-column">
            <HistoryRowTabletPhone
                v-if="isLoaded"
                v-for="revision in skillRevisions"
                :revision="revision"
                :skill="skill"
            />
        </div>
    </div>
</template>

<style scoped></style>
