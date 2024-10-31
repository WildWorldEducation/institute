<script>
import { useSessionDetailsStore } from '../../../../stores/SessionDetailsStore.js';

export default {
    setup() {
        const sessionDetailsStore = useSessionDetailsStore();

        return {
            sessionDetailsStore
        };
    },
    props: ['post', 'user'],
    data() {
        return {
            showActionBtns: false,
            currentClickId: 0
        };
    },
    mounted() {},
    computed: {},
    methods: {
        handleClickActionBtns(postId) {
            this.showActionBtns = !this.showActionBtns;
            this.currentClickId = postId;
        },
        showWarningModal(post) {
            this.$parent.showWarningModal(post, 'resource');
        },
        voteUp(postId, hasVoted) {
            if (hasVoted) {
                fetch(
                    '/user-votes/' +
                        this.user.userId +
                        '/' +
                        postId +
                        '/edit/cancel',
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'content/type'
                        },
                        body: {}
                    }
                ).then(() => this.$parent.getSourceVotes(postId));
            } else {
                fetch(
                    '/user-votes/' +
                        this.user.userId +
                        '/' +
                        postId +
                        '/edit/up',
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'content/type'
                        },
                        body: {}
                    }
                ).then(() => this.$parent.getSourceVotes(postId));
            }
        },
        voteDown(postId, hasVoted) {
            if (hasVoted) {
                fetch(
                    '/user-votes/' +
                        this.user.userId +
                        '/' +
                        postId +
                        '/edit/cancel',
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'content/type'
                        },
                        body: {}
                    }
                ).then(() => {
                    this.$parent.getSourceVotes(postId, this.post.type);
                });
            } else {
                fetch(
                    '/user-votes/' +
                        this.user.userId +
                        '/' +
                        postId +
                        '/edit/down',
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'content/type'
                        },
                        body: {}
                    }
                ).then(() => {
                    this.$parent.getSourceVotes(postId, this.post.type);
                });
            }
        },
        handleOpenFlagModal(postId) {
            this.$parent.handleOpenFlagModal(postId, 'resource');
        }
    }
};
</script>

<template>
    <div class="row mt-4 forum-container source">
        <div class="d-flex align-items-center justify-content-between mb-2">
            <!-- name and avatar -->
            <div class="w-100">
                <div class="col post-user-row">
                    <div class="user-avatar">
                        <img
                            v-if="sessionDetailsStore.isLoggedIn"
                            :src="post.avatar"
                            class="user-avatar-img"
                            alt="user avatar"
                        />
                        <img
                            v-else
                            src="/images/source-avatars/source-default-avatar.png"
                            class="user-avatar-img"
                            alt="user avatar"
                        />
                    </div>
                    <div
                        class="user-name-div d-flex justify-content-between w-100"
                    >
                        <span class="user-name-text">
                            {{ post.username }}
                        </span>
                    </div>
                    <!-- Author Icon -->
                    <div
                        v-if="post.is_human_edited"
                        b-tooltip.hover
                        title="This source was created or edited by a human"
                        class="author-icon me-4"
                        style="height: 50px"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 320 512"
                            height="22"
                            style="opacity: 0.5"
                        >
                            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <path
                                d="M112 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm40 304l0 128c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-223.1L59.4 304.5c-9.1 15.1-28.8 20-43.9 10.9s-20-28.8-10.9-43.9l58.3-97c17.4-28.9 48.6-46.6 82.3-46.6l29.7 0c33.7 0 64.9 17.7 82.3 46.6l58.3 97c9.1 15.1 4.2 34.8-10.9 43.9s-34.8 4.2-43.9-10.9L232 256.9 232 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-128-16 0z"
                                fill="#8f7bd6"
                            />
                        </svg>
                    </div>
                    <div
                        v-else
                        b-tooltip.hover
                        title="This post was created by an AI"
                        class="author-icon me-4"
                        style="height: 50px"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 640 512"
                            height="22"
                            style="opacity: 0.5"
                        >
                            <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                            <path
                                d="M320 0c17.7 0 32 14.3 32 32l0 64 120 0c39.8 0 72 32.2 72 72l0 272c0 39.8-32.2 72-72 72l-304 0c-39.8 0-72-32.2-72-72l0-272c0-39.8 32.2-72 72-72l120 0 0-64c0-17.7 14.3-32 32-32zM208 384c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zm96 0c-8.8 0-16 7.2-16 16s7.2 16 16 16l32 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-32 0zM264 256a40 40 0 1 0 -80 0 40 40 0 1 0 80 0zm152 40a40 40 0 1 0 0-80 40 40 0 1 0 0 80zM48 224l16 0 0 192-16 0c-26.5 0-48-21.5-48-48l0-96c0-26.5 21.5-48 48-48zm544 0c26.5 0 48 21.5 48 48l0 96c0 26.5-21.5 48-48 48l-16 0 0-192 16 0z"
                                fill="#8f7bd6"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <div class="source">
            <!-- Post Content -->
            <div class="forum-post w-auto" v-html="post.content"></div>
        </div>

        <div class="d-flex align-items-center justify-content-end mt-3">
            <!-- row contain likes count and relate buttons -->
            <div class="first-post-row">
                <div class="d-flex flex-row justify-content-end gap-1">
                    <!-- Upvote Button -->
                    <button
                        class="vote-btn"
                        v-if="sessionDetailsStore.isLoggedIn"
                        @click="voteUp(post.id, post.userUpVote)"
                        b-tooltip.hover
                        title="I Like This "
                    >
                        <!-- fill upvote icon -->
                        <svg
                            v-if="post.userUpVote"
                            width="34"
                            height="27"
                            fill="#36c1af"
                            class="vote-icon upvote-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z"
                            />
                        </svg>
                        <!-- outline upvote icon -->
                        <svg
                            v-else
                            width="34"
                            height="27"
                            fill="#36c1af"
                            class="vote-icon upvote-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M5,9V21H1V9H5M9,21A2,2 0 0,1 7,19V9C7,8.45 7.22,7.95 7.59,7.59L14.17,1L15.23,2.06C15.5,2.33 15.67,2.7 15.67,3.11L15.64,3.43L14.69,8H21C22.11,8 23,8.9 23,10V12C23,12.26 22.95,12.5 22.86,12.73L19.84,19.78C19.54,20.5 18.83,21 18,21H9M9,19H18.03L21,12V10H12.21L13.34,4.68L9,9.03V19Z"
                            />
                        </svg>
                    </button>
                    <!-- Vote count Div -->
                    <span
                        b-on-hover
                        title="number of vote this resource receive"
                        :class="{
                            'text-danger': post.voteCount < 0,
                            'text-primary': post.voteCount > 0,
                            'vote-count': true
                        }"
                        >{{ post.voteCount }}</span
                    >
                    <!-- Down vote button -->
                    <button
                        class="vote-btn"
                        v-if="sessionDetailsStore.isLoggedIn"
                        b-tooltip.hover
                        title="I Dislike This "
                        @click="voteDown(post.id, post.userDownVote)"
                    >
                        <!-- fill dislike button -->
                        <svg
                            v-if="post.userDownVote"
                            width="34"
                            height="27"
                            fill="#FC6E68"
                            class="vote-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.41,16.41C16.78,16.05 17,15.55 17,15V5C17,3.89 16.1,3 15,3Z"
                            />
                        </svg>
                        <!-- outline dislike button -->
                        <svg
                            v-else
                            width="34"
                            height="27"
                            fill="#FC6E68"
                            class="vote-icon"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                        >
                            <path
                                d="M19,15V3H23V15H19M15,3A2,2 0 0,1 17,5V15C17,15.55 16.78,16.05 16.41,16.41L9.83,23L8.77,21.94C8.5,21.67 8.33,21.3 8.33,20.88L8.36,20.57L9.31,16H3C1.89,16 1,15.1 1,14V12C1,11.74 1.05,11.5 1.14,11.27L4.16,4.22C4.46,3.5 5.17,3 6,3H15M15,5H5.97L3,12V14H11.78L10.65,19.32L15,14.97V5Z"
                            />
                        </svg>
                    </button>
                    <!-- Actions Dropdown Component -->
                    <div
                        v-if="sessionDetailsStore.isLoggedIn"
                        class="position-relative"
                    >
                        <!-- Button to toggle the action dropdown -->
                        <button
                            class="toggle-actions-bnt"
                            @click="handleClickActionBtns(post.id)"
                            b-tooltip.hover
                            title="More Actions For This Source"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                fill="grey"
                                class="more-icon"
                            >
                                <path
                                    d="M8 256a56 56 0 1 1 112 0A56 56 0 1 1 8 256zm160 0a56 56 0 1 1 112 0 56 56 0 1 1 -112 0zm216-56a56 56 0 1 1 0 112 56 56 0 1 1 0-112z"
                                />
                            </svg>
                        </button>
                        <!-- The Drop Down Div Contains action relate to the resource (use transition for animation) -->
                        <Transition name="dropdown">
                            <div
                                v-if="
                                    showActionBtns && post.id == currentClickId
                                "
                                class="action-btns-div"
                            >
                                <!-- Edit Button -->
                                <router-link
                                    v-if="
                                        post.user_id == user.userId ||
                                        user.role == 'admin' ||
                                        user.role == 'editor'
                                    "
                                    :to="'/resources/edit/' + post.id"
                                    class="btn dropdown-btn"
                                    role="button"
                                    b-tooltip.hover
                                    title="Edit This Source"
                                >
                                    <!-- Pencil icon -->
                                    <svg
                                        width="19"
                                        height="20"
                                        viewBox="0 0 19 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
                                            fill="#857D99"
                                        />
                                        <path
                                            d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
                                            fill="#857D99"
                                        />
                                        <path
                                            d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
                                            fill="#857D99"
                                        />
                                    </svg>
                                </router-link>
                                <!-- Delete Resource Button -->
                                <button
                                    b-tooltip.hover
                                    title="Delete This Source"
                                    v-if="
                                        post.user_id == user.userId ||
                                        user.role == 'admin' ||
                                        user.role == 'editor'
                                    "
                                    type="button"
                                    class="btn dropdown-btn"
                                    @click="showWarningModal(post)"
                                >
                                    <!-- X icon -->
                                    <svg
                                        width="18"
                                        height="18"
                                        viewBox="0 0 20 20"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z"
                                            fill="#857D99"
                                        />
                                    </svg>
                                </button>
                                <!-- Flag button -->
                                <button
                                    b-tooltip.hover
                                    title="Flag This Source For Review"
                                    type="button"
                                    class="btn dropdown-btn"
                                    @click="
                                        handleOpenFlagModal(post.id, post.type)
                                    "
                                >
                                    <div class="d-flex flex-row-reverse">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 448 512"
                                            style="opacity: 0.5"
                                            height="20"
                                            width="20"
                                        >
                                            <path
                                                fill="#8f7bd6"
                                                d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"
                                            />
                                        </svg>
                                    </div>
                                </button>
                            </div>
                        </Transition>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
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

.author-icon:hover {
    scale: 1.2;
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
.vote-btn {
    background-color: transparent;
    border: none;
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
