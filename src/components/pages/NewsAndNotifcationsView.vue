<script>
import News from '../components/news-and-notifications/News.vue';
import Notifications from '../components/news-and-notifications/Notifications.vue';

export default {
    setup() {
        return {};
    },
    components: {
        News,
        Notifications
    }
};
</script>

<template>
    <div class="container">
        <!-- Notifications -->
        <div class="row mt-2">
            <div class="col-lg-4 col-md-6 mb-3">
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
