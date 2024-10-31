<script>
import LoadingSpinner from '../../share-components/LoadingSpinner.vue';

export default {
    props: ['loadingStatus', 'showLoadingModal'],
    components: {
        LoadingSpinner
    }
};
</script>

<template>
    <!-- Confirm Modal -->
    <div v-if="showLoadingModal" class="modal">
        <!-- Confirm Modal -->
        <div class="modal-content loading-modal">
            <div class="d-flex flex-column gap-4 align-items-center">
                <!-- Warn Triangle Icon -->
                <LoadingSpinner />
                <p>Please Wait</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
.loading-modal {
    width: 340px !important;
}
</style>
