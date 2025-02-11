<script lang="ts">
import News from '../pages/news-and-notifcation/News.vue';
import Notifications from '../pages/news-and-notifcation/Notifications.vue';

export default {
    setup() {
        return {};
    },
    data() {
        return;
    },
    components: {
        News,
        Notifications
    },
    methods: {}
};
</script>

<template>
    <div class="container">
        <!-- Notifications -->
        <div class="row mt-2">
            <div class="col-lg-4 col-md-6 mb-2">
                <div class="hub-component h-100">
                    <Notifications />
                </div>
            </div>
        </div>
        <!-- News -->
        <div class="row">
            <div class="col">
                <div class="hub-component h-100">
                    <News />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
