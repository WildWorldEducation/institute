<script>
import LoadingSpinner from './LoadingSpinner.vue';

export default {
    components: {
        LoadingSpinner
    }
};
</script>

<template>
    <!-- Confirm Modal -->
    <div class="modal">
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

.success-modal {
    width: 500px !important;
}

.success-text {
    color: #16a34a;
}

.fails-text {
    color: #dc2626;
}

.keyboard-shortcut {
    color: #74a4c4;
    background-color: #dce4ec;
    border-radius: 5px;
    padding: 0px 5px;
}

.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 10;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}
/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}

/* Style Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    .success-modal {
        width: 100% !important;
    }

    .modal-content {
        top: 35%;
    }
}
</style>
