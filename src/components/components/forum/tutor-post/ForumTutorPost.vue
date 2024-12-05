<script>
import TutorPostCard from './TutorPostCard.vue';
export default {
    props: [`tutorPosts`, 'user', 'skillId'],
    data() {
        return {
            showWarnModal: false,
            currentPost: null,
            isLoading: true,
            isAlreadyTutoring: false
        };
    },
    mounted() {},
    components: {
        TutorPostCard
    },
    computed: {
        orderedAndNamedPosts() {
            // Ordering by vote.
            var sortedPosts = this.tutorPosts.sort((a, b) => {
                if (b.voteCount === a.voteCount) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                return b.voteCount - a.voteCount;
            });

            for (let i = 0; i < sortedPosts.length; i++) {
                if (sortedPosts[i].user_id == this.user.userId) {
                    this.isAlreadyTutoring = true;
                }
            }

            this.isLoading = false;

            return sortedPosts;
        }
    },
    methods: {
        showWarningModal(post) {
            this.currentPost = post;
            this.showWarnModal = true;
        },
        getTutorPostVotes(postId) {
            this.$parent.getTutorPostVotes(postId);
        },
        handleOpenFlagModal(postId) {
            this.$parent.flagPost = postId;
            this.$parent.showFlaggingModal = true;
            this.showActionBtns = false;
            this.$parent.flagType = 'tutor_post';
        },
        handleExpandPost(postId) {
            if (this.expandPostId !== Infinity) {
                this.expandPostId = Infinity;
            } else {
                this.expandPostId = postId;
            }
        },
        deleteTutorPost(post) {
            this.$parent.deleteTutorPost(post);
            this.isAlreadyTutoring = false;
            this.showWarnModal = false;
        },
        /* Because we store the tutor post with HTML tags so we 
           need to strip all the tags to show it in the non-expand version
        */
        toPlainText(code) {
            return code.replace(/<\/?[^>]+(>|$)/g, '');
        }
    }
};
</script>

<template>
    <div class="d-flex flex-column flex-md-row justify-content-between my-4">
        <div class="ms-0 me-auto ms-lg-auto me-lg-0">
            <div
                class="d-flex flex-column align-items-baseline"
                v-if="isLoading == false"
            >
                <router-link
                    v-if="user.role == 'student' && isAlreadyTutoring == false"
                    :to="'/tutor/add/' + skillId"
                    class="btn primary-btn mt-2"
                    role="button"
                    >Offer to tutor&nbsp;&nbsp;<svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                        width="18"
                        height="20"
                    >
                        <path
                            d="M32 32C32 14.3 46.3 0 64 0S96 14.3 96 32V240H32V32zM224 192c0-17.7 14.3-32 32-32s32 14.3 32 32v64c0 17.7-14.3 32-32 32s-32-14.3-32-32V192zm-64-64c17.7 0 32 14.3 32 32v48c0 17.7-14.3 32-32 32s-32-14.3-32-32V160c0-17.7 14.3-32 32-32zm160 96c0-17.7 14.3-32 32-32s32 14.3 32 32v64c0 17.7-14.3 32-32 32s-32-14.3-32-32V224zm-96 88l0-.6c9.4 5.4 20.3 8.6 32 8.6c13.2 0 25.4-4 35.6-10.8c8.7 24.9 32.5 42.8 60.4 42.8c11.7 0 22.6-3.1 32-8.6V352c0 88.4-71.6 160-160 160H162.3c-42.4 0-83.1-16.9-113.1-46.9L37.5 453.5C13.5 429.5 0 396.9 0 363V336c0-35.3 28.7-64 64-64h88c22.1 0 40 17.9 40 40s-17.9 40-40 40H96c-8.8 0-16 7.2-16 16s7.2 16 16 16h56c39.8 0 72-32.2 72-72z"
                            fill="white"
                        />
                    </svg>
                </router-link>
            </div>
        </div>
    </div>
    <div id="">
        <TutorPostCard
            v-for="post in orderedAndNamedPosts"
            :post="post"
            :user="user"
        />
    </div>
    <!-- The Delete Warn Modal -->
    <div v-if="showWarnModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <p>Are you sure you want to remove this offer?</p>
                <div style="display: flex; gap: 10px">
                    <button
                        type="button"
                        class="btn btn-danger"
                        @click="deleteTutorPost(currentPost)"
                    >
                        Yes
                    </button>
                    <button
                        type="button"
                        class="btn btn-dark"
                        @click="showWarnModal = false"
                    >
                        No
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.tutor {
    border-top: 2px dotted #aea3ce;
    border-right: 2px solid #aea3ce;
    border-left: 2px solid #aea3ce;
    color: var(--secondary-heading-colour);
}

.tutor:last-child {
    border-bottom: 2px solid #aea3ce;
}

.tutor:first-child {
    border-top: 2px solid #aea3ce;
}

.tutor:nth-child(odd) {
    background-color: #ede6ff;
}

.tutor:nth-child(even) {
    background-color: #f8f6ff;
}

.tutor-avatar-div {
    width: 18%;
}
.cover-letter-word {
    font-size: 16px;
    font-weight: 600;
    color: rgb(54, 54, 54) !important;
}

.tutor-post-content {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    cursor: pointer;
}

.user-email {
    font-size: 14px;
    color: #888;
}

.tutor-user-name {
    color: #a48be6;
    font-size: 16px;
    font-weight: 600;
}

.tutor-img {
    width: 100px !important;
    height: 100px !important;
    margin-right: 1rem;
}

.tutor-post {
    flex-direction: column;
    color: #242323;
    font-family: sans-serif;
}

.arrow-up {
    animation: rotationBack 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.arrow-down {
    animation: rotation 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

/* The animation key frame */
@keyframes rotation {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(180deg);
    }
}

@keyframes rotationBack {
    from {
        transform: rotate(180deg);
    }

    to {
        transform: rotate(0deg);
    }
}

/* Mobile */
@media (max-width: 480px) {
    .tutor-img {
        margin-right: unset;
        margin: auto;
    }
}
</style>
