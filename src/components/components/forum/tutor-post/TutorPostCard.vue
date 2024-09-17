<script>
export default {
    props: ['post', 'user'],
    data() {
        return {
            showActionBtns: false,
            currentClickId: 0,
            isAlreadyTutoring: this.$parent.isAlreadyTutoring,
            expandPost: false,
            showActionButton: false
        };
    },
    mounted() {},
    computed: {},
    methods: {
        showWarningModal(post) {
            this.$parent.showWarningModal(post, 'tutorPost');
        },
        voteUp(postId, hasVoted) {
            if (hasVoted) {
                fetch(
                    '/tutor-votes/' +
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
                ).then(() => this.$parent.getTutorPostVotes(postId));
            } else {
                fetch(
                    '/tutor-votes/' +
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
                ).then(() => this.$parent.getTutorPostVotes(postId));
            }
        },
        voteDown(postId, hasVoted) {
            if (hasVoted) {
                fetch(
                    '/tutor-votes/' +
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
                ).then(() => this.$parent.getTutorPostVotes(postId));
            } else {
                fetch(
                    '/tutor-votes/' +
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
                ).then(() => this.$parent.getTutorPostVotes(postId));
            }
        },
        handleOpenFlagModal(postId) {
            this.$parent.handleOpenFlagModal(postId, 'tutorPost');
        },

        deleteTutorPost(source) {
            this.$parent.deleteTutorPost(source, 'tutorPost');
        },
        /* Because we store the tutor post with HTML tags so we 
           need to strip all the tags to show it in the non-expand version
        */
        toPlainText(code) {
            return code?.replace(/<\/?[^>]+(>|$)/g, '');
        }
    }
};
</script>

<template>
    <div class="tutor d-flex w-100 p-3 flex-column flex-lg-row">
        <!-- User avatar -->
        <div
            class="d-flex justify-content-center ms-3 ms-md-0 tutor-avatar-div"
        >
            <img
                :src="post.avatar"
                class="tutor-img rounded"
                alt="user avatar"
            />
        </div>
        <div class="d-flex flex-column w-100">
            <div class="d-flex flex-row justify-content-between">
                <div class="tutor-user-name text-capitalize">
                    {{ post.username }}
                </div>
                <div
                    b-on-hover
                    title="expand cover letter"
                    style="cursor: pointer"
                    @click="expandPost = !expandPost"
                    :class="[expandPost ? 'arrow-up' : 'arrow-down']"
                >
                    <!-- Chevron Icon -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 448 512"
                        heigh="15"
                        width="15"
                        fill="grey"
                    >
                        <path
                            d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"
                        />
                    </svg>
                </div>
            </div>
            <div class="user-email">
                <div>
                    {{ post.email }}
                </div>
            </div>
            <!-- First row of post contain proposal content -->
            <div class="d-flex mt-4 tutor-post">
                <p
                    v-if="!expandPost"
                    class="tutor-post-content"
                    b-on-hover
                    title="expand this cover letter"
                    @click="expandPost = true"
                >
                    <span class="cover-letter-word">cover letter - </span
                    >{{ toPlainText(post.description) }}
                </p>
                <Transition name="dropdown">
                    <div v-if="expandPost" class="d-flex flex-column">
                        <p v-html="post.description"></p>
                        <div
                            class="btn green-btn mt-2 me-0 ms-auto w-auto mb-3"
                            role="button"
                            @click="expandPost = false"
                        >
                            Shrink
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 384 512"
                                width="15"
                                heigh="15"
                                fill="white"
                                class="ms-2"
                            >
                                <path
                                    d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"
                                />
                            </svg>
                        </div>
                    </div>
                </Transition>
            </div>
            <!-- Second row of post contain likes count and relate buttons -->
            <div class="d-flex align-items-center justify-content-end mt-3">
                <div class="first-post-row">
                    <div class="d-flex flex-row justify-content-end gap-1">
                        <!-- Upvote Button -->
                        <button
                            class="vote-btn"
                            v-if="post.user_id != user.userId"
                            @click="voteUp(post.id, post.userUpVote, post.type)"
                            b-tooltip.hover
                            title="I Vote This User "
                        >
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
                            v-if="post.user_id != user.userId"
                            b-tooltip.hover
                            title="I Dislike This "
                            @click="
                                voteDown(post.id, post.userDownVote, post.type)
                            "
                        >
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
                        <div class="position-relative">
                            <!-- Button to toggle the action dropdown -->
                            <button
                                class="toggle-actions-bnt"
                                @click="showActionBtns = !showActionBtns"
                                b-tooltip.hover
                                title="More Actions For This Tutor Offer"
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
                                    v-if="showActionBtns"
                                    class="action-btns-div"
                                >
                                    <!-- Edit Button -->
                                    <router-link
                                        v-if="
                                            post.user_id == user.userId ||
                                            user.role == 'admin' ||
                                            user.role == 'editor'
                                        "
                                        :to="'/tutor/edit/' + post.id"
                                        class="btn dropdown-btn"
                                        role="button"
                                        b-tooltip.hover
                                        title="Edit This Tutor Post"
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
                                        title="'Delete This Tutor Post'"
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
                                        :title="
                                            post.type != 'tutor'
                                                ? 'Flag This Source For Review'
                                                : 'Flag This Tutor Post For Review'
                                        "
                                        type="button"
                                        class="btn dropdown-btn"
                                        @click="
                                            handleOpenFlagModal(
                                                post.id,
                                                post.type
                                            )
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
    </div>
</template>

<style>
.tutor {
    border-top: 2px dotted #aea3ce;
    border-right: 2px solid #aea3ce;
    border-left: 2px solid #aea3ce;
    color: #7469b6;
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
.vote-btn {
    background-color: transparent;
    border: none;
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
