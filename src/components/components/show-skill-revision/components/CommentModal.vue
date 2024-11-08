<script>
export default {
    props: ['showCommentModal', 'closeModal', 'revert'],
    data() {
        return {
            revertComment: ''
        };
    }
};
</script>

<template>
    <div v-if="showCommentModal" id="myModal" class="modal">
        <!-- Modal content -->
        <div class="modal-content">
            <div class="d-flex flex-column">
                <div class="pb-3">Please add a comment to explain.</div>
                <textarea
                    class="revert-comment"
                    rows="5"
                    cols="33"
                    autofocus
                    v-model="$parent.revertComment"
                >
                </textarea>
                <!-- Suggest template -->
            </div>

            <!-- Buttons row -->
            <div
                class="d-flex justify-content-lg-between justify-content-md-end justify-content-between gap-2 mt-2"
            >
                <button
                    type="button"
                    class="btn red-btn modal-btn"
                    @click="closeModal"
                >
                    <span class="d-none d-md-block"> Cancel </span>
                    <!-- X Icon ONLY show when in Phone View -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="18"
                        height="18"
                        fill="white"
                        class="d-md-none"
                    >
                        <path
                            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
                        />
                    </svg>
                </button>
                <button
                    type="button"
                    class="btn green-btn modal-btn"
                    @click="revert(revertComment)"
                >
                    <span class="d-none d-md-block"> Submit </span>
                    <!-- Tick icon Only show when in Phone View -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="18"
                        height="18"
                        fill="white"
                        class="d-md-none"
                    >
                        <path
                            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* The Warning Modal */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 1;
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

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 670px;
    /* Could be more or less, depending on screen size */
}

.revert-comment {
    outline: none;
    border-radius: 8px;
    border: #888 1px solid;
    padding: 10px;
    font-family: 'Poppins' sans-serif;
    font-size: 15px;
    color: #394353;
}

.revert-comment:focus {
    outline: none;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.green-btn:hover {
    background-color: #65e0a5;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    height: fit-content;
}

.red-btn:hover {
    background-color: #cc3535;
}
</style>
