<script>
import { useSessionDetailsStore } from '../../../../stores/SessionDetailsStore.js';

import ResourcePostCard from '../source-post/ResourcePostCard.vue';
import TutorPostCard from '../tutor-post/TutorPostCard.vue';

export default {
    setup() {
        const sessionDetailsStore = useSessionDetailsStore();

        return {
            sessionDetailsStore
        };
    },
    props: [`posts`, 'user', 'skillId'],
    data() {
        return {
            showActionBtns: false,
            currentClickId: 0,
            isAlreadyTutoring: this.$parent.isAlreadyTutoring,
            showWarnModal: false,
            currentPost: null,
            warnText: '',
            deletePostType: '',
            isLoading: true,
            isAlreadyTutoring: false
        };
    },
    components: {
        TutorPostCard,
        ResourcePostCard
    },
    mounted() {},
    computed: {
        orderedAndNamedPosts() {
            // Ordering by vote.
            var sortedPosts = this.posts.sort((a, b) => {
                if (b.voteCount === a.voteCount) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                return b.voteCount - a.voteCount;
            });
            for (let i = 0; i < this.posts.length; i++) {
                if (this.posts[i].type == 'tutor-post') {
                    if (
                        sortedPosts[i].user_id ==
                        this.sessionDetailsStore.userId
                    ) {
                        this.isAlreadyTutoring = true;
                    }
                }
            }
            this.isLoading = false;
            return sortedPosts;
        }
    },
    methods: {
        deletePost(post, postType) {
            switch (this.deletePostType) {
                case 'tutorPost':
                    this.$parent.deleteTutorPost(this.currentPost);
                    this.isAlreadyTutoring = false;
                    break;
                // default case will be source type post
                default:
                    this.$parent.deletePost(this.currentPost);
                    break;
            }
            this.showWarnModal = false;
        },
        showWarningModal(post, postType) {
            switch (postType) {
                case 'tutorPost':
                    this.warnText =
                        'Are you sure you want to remove this tutor offer?';
                    this.deletePostType = 'tutorPost';
                    break;
                // default case will be source type post
                default:
                    this.deletePostType = 'resource';
                    this.warnText =
                        'Are you sure you want to delete this source?';
                    break;
            }
            this.currentPost = post;
            this.showWarnModal = true;
        },

        handleOpenFlagModal(postId, postType) {
            this.$parent.flagPost = postId;
            this.$parent.showFlaggingModal = true;
            this.showActionBtns = false;
            this.$parent.flagType = postType;
        },
        getSourceVotes(postId) {
            this.$parent.getSourceVotes(postId);
        },
        getTutorPostVotes(postId) {
            this.$parent.getTutorPostVotes(postId);
        }
    }
};
</script>

<template>
    <div v-if="sessionDetailsStore.isLoggedIn" class="d-flex flex-column mt-4">
        <div class="d-flex flex-column flex-lg-row">
            <div class="col-12">
                <div
                    class="d-flex justify-content-xl-end justify-content-between"
                    v-if="isLoading == false"
                >
                    <router-link
                        :to="'/resources/add/' + skillId"
                        class="btn secondary-btn"
                        role="button"
                        >Add source&nbsp;&nbsp;
                        <!-- Plus icon -->
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M6.34811 20.0423L6.34811 13.6494L-0.0358702 13.6583C-0.320945 13.6579 -0.594203 13.5444 -0.795782 13.3428C-0.997361 13.1412 -1.11082 12.868 -1.11132 12.5829L-1.11729 7.41477C-1.1168 7.1297 -1.00334 6.85644 -0.801757 6.65486C-0.600179 6.45328 -0.326921 6.33982 -0.0418461 6.33933L6.3481 6.34231L6.3481 -0.0506238C6.34659 -0.193451 6.3736 -0.335145 6.42756 -0.467396C6.48152 -0.599646 6.56134 -0.719794 6.66234 -0.820794C6.76334 -0.921794 6.88349 -1.00161 7.01574 -1.05557C7.14799 -1.10953 7.28969 -1.13655 7.43251 -1.13503L12.5827 -1.12308C12.8678 -1.12259 13.141 -1.00913 13.3426 -0.807549C13.5442 -0.60597 13.6577 -0.332713 13.6582 -0.047637L13.6552 6.34231L20.0481 6.34231C20.3325 6.34248 20.6052 6.45552 20.8063 6.65661C21.0074 6.8577 21.1204 7.13039 21.1206 7.41477L21.1325 12.565C21.1324 12.8494 21.0193 13.122 20.8182 13.3231C20.6171 13.5242 20.3444 13.6373 20.0601 13.6374L13.6552 13.6494L13.6641 20.0334C13.6636 20.3184 13.5502 20.5917 13.3486 20.7933C13.147 20.9948 12.8738 21.1083 12.5887 21.1088L7.43252 21.1267C7.28969 21.1282 7.148 21.1012 7.01575 21.0473C6.88349 20.9933 6.76335 20.9135 6.66235 20.8125C6.56135 20.7115 6.48153 20.5913 6.42757 20.4591C6.37361 20.3268 6.34659 20.1851 6.34811 20.0423Z"
                                fill="white"
                            />
                        </svg>
                    </router-link>
                    <router-link
                        v-if="
                            user.role == 'student' && isAlreadyTutoring == false
                        "
                        :to="'/tutor/add/' + skillId"
                        class="btn primary-btn"
                        role="button"
                        >Offer to tutor&nbsp;&nbsp;
                        <!-- hand point up icon -->
                        <svg
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
    </div>
    <div id="posts-big-container">
        <div v-for="post in orderedAndNamedPosts">
            <ResourcePostCard
                v-if="post.type === 'source'"
                :post="post"
                :user="user"
            />
            <TutorPostCard
                v-if="post.type === 'tutor-post'"
                :post="post"
                :user="user"
                class="my-4"
            />
        </div>
    </div>
    <!-- The Delete Warn Modal -->
    <div v-if="showWarnModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <p>{{ warnText }}</p>
                <div style="display: flex; gap: 10px">
                    <button
                        type="button"
                        class="btn btn-danger"
                        @click="deletePost()"
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

<style scoped>
#posts-big-container {
    padding-left: 10px;
    padding-right: 10px;
}

.forum-container {
    border-radius: 12px;
    padding-top: 12px;
    padding-bottom: 12px;
}

.user-name-text {
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
    font-weight: lighter;
    color: #778094;
}

.user-name-div {
    margin-left: 5px;
}

.user-avatar {
    height: 45px;
    width: 45px;
}

.user-avatar-img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    margin-right: 0px;
    margin-left: auto;
    margin-top: 0px;
    object-fit: cover;
}

.source {
    background-color: #f2edff;
}

.post-user-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 5px;
}

.forum-post {
    padding: 10px;
    border-radius: 5px;
    background-color: white;
}
/* Mobile */
@media (max-width: 480px) {
    .user-avatar {
        padding: 4px;
    }
}

/* Tablets */
@media (min-width: 481px) and (max-width: 1024px) {
}
</style>
