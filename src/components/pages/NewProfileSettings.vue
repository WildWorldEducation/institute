<script lang="ts">
import ThemeDetails from '../components/profile-page/ThemeDetails.vue';
import { useUserDetailsStore } from '../../stores/UserDetailsStore';
import { useSessionDetailsStore } from '../../stores/SessionDetailsStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const sessionDetailsStore = useSessionDetailsStore();
        userDetailsStore.getUserDetails();
        return {
            userDetailsStore,
            sessionDetailsStore
        };
    },
    data() {
        return {};
    },
    components: {
        ThemeDetails
    },
    methods: {}
};
</script>

<template>
    <div class="container legend-div">
        <div class="mt-2 d-flex gap-2 justify-content-between">
            <ThemeDetails />
            <div class="form">
                <div>
                    <!-- Instructor -->
                    <div
                        v-if="userDetailsStore.instructorUsername"
                        class="profile-input"
                    >
                        <h2 class="secondary-heading h4">Instructor</h2>
                        <input
                            type="text"
                            class="form-control"
                            readonly
                            :value="userDetailsStore.instructorUsername"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.legend-div {
    width: 100%;
    z-index: 2;
    top: 80px;
}

.profile-input {
    width: '100%';
    max-width: 300px;
}
.form-control {
    border: 1px solid #f2f4f7;
    box-shadow: 0px 1px 2px 0px #1018280d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    color: black;
}
</style>
