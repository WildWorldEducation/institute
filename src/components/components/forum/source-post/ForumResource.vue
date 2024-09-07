<script>
import ResourcePostCard from './ResourcePostCard.vue';

export default {
    props: [`resourcePosts`, 'user', 'skillId'],
    data() {
        return {
            showActionBtns: false,
            currentClickId: 0,
            isAlreadyTutoring: this.$parent.isAlreadyTutoring,
            showWarnModal: false,
            currentPost: null
        };
    },
    components: {
        ResourcePostCard
    },
    mounted() {},
    computed: {
        orderedAndNamedPosts() {
            // Ordering by vote.
            var sortedPosts = this.resourcePosts.sort((a, b) => {
                if (b.voteCount === a.voteCount) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                return b.voteCount - a.voteCount;
            });

            // for (let i = 0; i < sortedPosts.length; i++) {
            //     this.resourcePosts[i].index = i;
            // }

            return sortedPosts;
        }
    },
    methods: {
        deletePost() {
            this.$parent.deletePost(this.currentPost);
            this.showWarnModal = false;
        },
        showWarningModal(post) {
            this.currentPost = post;
            this.showWarnModal = true;
        },
        handleOpenFlagModal(postId) {
            this.$parent.flagPost = postId;
            this.$parent.showFlaggingModal = true;
            this.showActionBtns = false;
            this.$parent.flagType = 'resource';
        },
        getSourceVotes(postId) {
            this.$parent.getSourceVotes(postId);
        }
    }
};
</script>

<template>
    <div class="d-flex flex-column mt-4">
        <div class="d-flex flex-column flex-lg-row">
            <div class="ms-0 me-auto ms-lg-auto me-lg-0">
                <div class="d-flex flex-column align-items-baseline">
                    <router-link
                        :to="'/resources/add/' + skillId"
                        class="btn green-btn"
                        role="button"
                        >Add source&nbsp;&nbsp;
                        <!-- Plus sign -->
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
                </div>
            </div>
        </div>
    </div>
    <div id="posts-big-container">
        <ResourcePostCard
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
                <p>Are you sure you want to delete this source?</p>
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

<style>
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
