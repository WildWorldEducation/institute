<script>
export default {
    props: [`resourcePosts`, 'user'],
    data() {
        return {
            showActionBtns: false,
            currentClickId: 0
        };
    },
    mounted() {},
    computed: {
        orderedAndNamedPosts() {
            // Getting the student's name.
            for (let j = 0; j < this.resourcePosts.length; j++) {
                for (let k = 0; k < this.$parent.users.length; k++) {
                    if (
                        this.resourcePosts[j].user_id ==
                        this.$parent.users[k].id
                    ) {
                        this.resourcePosts[j].studentName =
                            this.$parent.users[k].first_name +
                            ' ' +
                            this.$parent.users[k].last_name;
                        // I think we should get the user avatar too
                        this.resourcePosts[j].userAvatar =
                            this.$parent.users[k].avatar;
                    }
                }
            }

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
        handleClickActionBtns(postId) {
            this.showActionBtns = !this.showActionBtns;
            this.currentClickId = postId;
        },
        showWarningModal(post) {
            this.$parent.showWarningModal(post);
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
                    this.$parent.getSourceVotes(postId);
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
                    this.$parent.getSourceVotes(postId);
                });
            }
        },
        handleOpenFlagModal(postId) {
            this.$parent.flagPost = postId;
            this.$parent.showFlaggingModal = true;
            this.showActionBtns = false;
            this.$parent.flagType = 'resource';
        }
    }
};
</script>

<template>
    <div class="d-flex flex-column flex-md-row justify-content-between mt-4">
        <div class="d-flex align-items-md-baseline align-items-start gap-2">
            <div class="forum-sub-page-tile">Best Places To Learn This</div>
            <img src="/images/recurso-69.png" class="" />
        </div>
        <div class="mx-auto mx-md-0 mt-3 mt-lg-0">
            <div class="d-flex flex-column justify-content-between">
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
                <router-link
                    v-if="user.role == 'student' && isAlreadyTutoring == false"
                    :to="'/tutor/add/' + skillId"
                    class="btn purple-btn mt-2"
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
    <div id="posts-big-container">
        <div
            class="row mt-4 forum-container source"
            v-for="post in orderedAndNamedPosts"
        >
            <div class="d-flex align-items-center justify-content-between mb-2">
                <!-- Second row contain name and avatar -->
                <div class="w-100">
                    <div class="col post-user-row">
                        <div class="user-avatar">
                            <img
                                :src="post.userAvatar"
                                class="user-avatar-img"
                                alt="user avatar"
                            />
                        </div>
                        <div
                            class="user-name-div d-flex justify-content-between w-100"
                        >
                            <span class="user-name-text">
                                {{ post.studentName }}
                            </span>
                        </div>
                    </div>
                </div>
                <!-- First row of post contain likes count and relate buttons -->
            </div>
            <div class="col-12">
                <div class="source">
                    <!-- Post Content -->
                    <div class="forum-post" v-html="post.content"></div>
                </div>
            </div>
            <div class="d-flex align-items-center justify-content-end mt-3">
                <!-- row contain likes count and relate buttons -->
                <div class="first-post-row">
                    <div class="d-flex flex-row justify-content-end gap-1">
                        <!-- Upvote Button -->
                        <div
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
                        </div>
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
                        <div
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
                        </div>
                        <!-- Actions Dropdown Component -->
                        <div class="position-relative">
                            <!-- Button to toggle the action dropdown -->
                            <div
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
                            </div>
                            <!-- The Drop Down Div Contains action relate to the resource (use transition for animation) -->
                            <Transition name="dropdown">
                                <div
                                    v-if="
                                        showActionBtns &&
                                        post.id == currentClickId
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
