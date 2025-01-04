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
        console.log(this.userDetailsStore.userId);
        const result = await fetch(
            '/users/reputation-events/' + this.userDetailsStore.userId
        );
        this.reputationEvents = await result.json();
        console.log(this.reputationEvents);
    },
    methods: {}
};
</script>

<template>
    <h2 class="secondary-heading h4">Reputation Events</h2>
    <div id="skill-list">
        <div v-for="reputationEvent in reputationEvents">
            <div class="skill-link btn">
                {{ reputationEvent.id }}
            </div>
        </div>
        <div v-if="noSkills" id="no-skill-cell"></div>
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

#skill-list {
    overflow-y: auto;
    overflow-x: hidden;
    max-height: 300px;
    border-radius: 10px;
    background-color: rgb(33, 37, 41);
}

#skill-list div {
    padding: 10px 6px;
}

.skill-link {
    text-decoration: none !important;
    color: black;
}

#skill-list div:hover {
    cursor: pointer;
    text-decoration: underline;
}

#no-skill-cell {
    height: 41px;
}

@media (max-width: 480px) {
    #skill-list {
        max-height: 200px;
        margin-left: 1px;
    }
}
</style>
