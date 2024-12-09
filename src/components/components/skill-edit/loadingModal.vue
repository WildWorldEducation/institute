<script>
import LoadingSpinner from '../share-components/LoadingSpinner.vue';

export default {
    props: ['loadingStatus', 'showLoadingModal', 'skillUrl', 'closeModal'],
    components: {
        LoadingSpinner
    },
    computed: {
        revertResult() {
            switch (this.loadingStatus) {
                case 'fails':
                    return 'fails';
                case 'success':
                    return 'success';
                default:
                    return 'waiting';
            }
        }
    }
};
</script>

<template>
    <!-- Confirm Modal -->
    <div v-if="showLoadingModal" class="modal">
        <!-- Confirm Modal -->
        <div
            class="modal-content loading-modal"
            :class="{ 'success-modal': revertResult === 'success' }"
        >
            <div
                v-if="revertResult === 'waiting'"
                class="d-flex flex-column gap-4 align-items-center"
            >
                <!-- Warn Triangle Icon -->
                <LoadingSpinner />
                <p>Please wait</p>
            </div>
            <div v-if="revertResult === 'success'" class="d-flex flex-column">
                <div class="d-flex success-text align-items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        class="me-1"
                        height="18"
                        width="18"
                        fill="#16a34a"
                    >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"
                        />
                    </svg>
                    Revert Success
                </div>
                <div>You will go back to skill forum soon.</div>
            </div>
            <div class="d-flex flex-column" v-if="revertResult === 'fails'">
                <div class="d-flex fails-text align-items-center">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        class="me-1"
                        width="16"
                        height="16"
                        fill="#dc2626"
                    >
                        <path
                            d="M367.2 412.5L99.5 144.8C77.1 176.1 64 214.5 64 256c0 106 86 192 192 192c41.5 0 79.9-13.1 111.2-35.5zm45.3-45.3C434.9 335.9 448 297.5 448 256c0-106-86-192-192-192c-41.5 0-79.9 13.1-111.2 35.5L412.5 367.2zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"
                        />
                    </svg>
                    Revert Fails!
                </div>
                <div>Some thing went wrong !!</div>
                <button
                    type="button"
                    class="btn green-btn modal-btn mx-auto mt-2"
                    @click="closeModal()"
                >
                    <span class="d-none d-md-block"> Ok </span>
                </button>
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
}
</style>
