<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            reputationEvents: []
        };
    },
    async created() {
        const result = await fetch(
            '/users/reputation-events/' + this.userDetailsStore.userId
        );
        this.reputationEvents = await result.json();

        for (let i = 0; i < this.reputationEvents.length; i++) {
            this.reputationEvents[i].formattedDate = this.formatDate(
                this.reputationEvents[i].create_date
            );
            this.reputationEvents[i].formattedContentType =
                this.reputationEvents[i].content_type.replace(/_/g, ' ');
        }

        console.log(this.reputationEvents);
    },
    methods: {
        formatDate(unformattedDate) {
            // Prep the date and time data ---------------
            // Split timestamp into [ Y, M, D, h, m, s ]
            var date = unformattedDate.replace('T', ' ');
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
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            };
            finalDate = finalDate.toLocaleDateString('en-US', options);
            return finalDate;
        }
    }
};
</script>

<template>
    <h2 class="secondary-heading h4">Reputation Awards</h2>
    <div id="background">
        <div v-for="reputationEvent in reputationEvents">
            <div class="text-white bg-success rounded">
                <span class="badge text-bg-light">+1</span>
                {{ reputationEvent.formattedContentType }}
                <span v-if="reputationEvent.content_type != 'new_skill'"
                    >improved</span
                ><span v-else>added</span> on
                {{ reputationEvent.formattedDate }}
            </div>
        </div>
        <!-- <div v-if="noSkills" id="no-skill-cell"></div> -->
    </div>
</template>

<style scoped>
/* Scrollbar */
::-webkit-scrollbar {
    width: 12px;
}

::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    border-radius: 10px;
    -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.5);
}

.table-responsive {
    max-height: 300px;
    display: flex;
    flex-direction: column;
}

#background {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 300px;
    border-radius: 10px;
    background-color: rgb(33, 37, 41);
}

#background div {
    padding: 10px 6px;
}

#no-skill-cell {
    height: 41px;
}

@media (max-width: 480px) {
    #background {
        max-height: 200px;
        margin-left: 1px;
    }
}
</style>
