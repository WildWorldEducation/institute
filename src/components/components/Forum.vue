<script>
export default {
    setup() {},
    data() {
        return {
            skillId: this.$route.params.id,
            sourcePosts: [],
            tutorPosts: [],
            isAlreadyTutoring: false,
            posts: [],
            users: [],
            user: {},
            showModal: false,
            resourceId: null,
            showFlaggingModal: false,
            flagPost: '',
            flagType: '',
            showActionBtns: false,
            currentClickId: '',
            showThankModal: false,
            source: null
        };
    },
    computed: {
        orderedAndNamedPosts() {
            // Getting the student's name.
            for (let j = 0; j < this.posts.length; j++) {
                for (let k = 0; k < this.users.length; k++) {
                    if (this.posts[j].user_id == this.users[k].id) {
                        this.posts[j].studentName =
                            this.users[k].first_name +
                            ' ' +
                            this.users[k].last_name;
                        // I think we should get the user avatar too
                        this.posts[j].userAvatar = this.users[k].avatar;
                        if (this.posts[j].type == 'tutor')
                            this.posts[j].email = this.users[k].email;
                    }
                }
            }

            // Ordering by vote.
            var sortedPosts = this.posts.sort((a, b) => {
                if (b.voteCount === a.voteCount) {
                    return new Date(b.created_at) - new Date(a.created_at);
                }
                return b.voteCount - a.voteCount;
            });
            for (let i = 0; i < sortedPosts.length; i++) {
                this.posts[i].index = i;
            }

            return sortedPosts;
        }
    },
    async created() {
        this.getUserId();
        await this.getUsers();
        // Get all sources for this skill.
        await this.getSourcePosts(this.skillId);
        // Get voting data on each.
        for (let i = 0; i < this.sourcePosts.length; i++) {
            await this.getSourceVotes(this.sourcePosts[i].id);
        }
        // Add to posts.
        this.posts = this.sourcePosts;
        // Get all tutor posts for this skill.
        await this.getTutorPosts(this.skillId);
        // Get voting data on each.
        for (let i = 0; i < this.tutorPosts.length; i++) {
            await this.getTutorPostVotes(this.tutorPosts[i].id);
        }
        // Add to posts.
        this.posts = this.posts.concat(this.tutorPosts);
    },
    methods: {
        getUserId() {
            fetch('/get-session-details')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => (this.user = data));
        },
        async getSourcePosts(skillId) {
            await fetch('/skills/' + skillId + '/resources')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    data.forEach(function (element) {
                        element.type = 'source';
                    });

                    this.sourcePosts = data;
                });
        },
        async getSourceVotes(resourceId) {
            await fetch('/user-votes/' + resourceId)
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    var votesOnThisSource = data;
                    var voteCount = 0;
                    let userUpVote = false;
                    let userDownVote = false;
                    // Work out if current user has already voted on this source post.
                    for (let i = 0; i < votesOnThisSource.length; i++) {
                        if (votesOnThisSource[i].user_id == this.user.userId) {
                            if (votesOnThisSource[i].vote == 1) {
                                userUpVote = true;
                            } else if (votesOnThisSource[i].vote == -1) {
                                userDownVote = true;
                            }
                        }
                        // Calculate SUM of votes.
                        voteCount = voteCount + votesOnThisSource[i].vote;
                    }
                    // Add the data to the post.
                    for (let i = 0; i < this.sourcePosts.length; i++) {
                        if (this.sourcePosts[i].id == resourceId) {
                            this.sourcePosts[i].voteCount = voteCount;
                            this.sourcePosts[i].userUpVote = userUpVote;
                            this.sourcePosts[i].userDownVote = userDownVote;
                        }
                    }
                });
        },
        async getTutorPosts(skillId) {
            await fetch('/tutor-posts/' + skillId + '/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    data.forEach(function (element) {
                        element.type = 'tutor';
                    });

                    // Add these tutor posts to the other posts, if the skill is the same.
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].skill_id == this.skillId) {
                            this.tutorPosts.push(data[i]);
                        }
                    }

                    // Prevent student from adding another tutor post, if they already have.
                    for (let i = 0; i < this.tutorPosts.length; i++) {
                        if (this.tutorPosts[i].user_id == this.user.userId) {
                            this.isAlreadyTutoring = true;
                        }
                    }
                });
        },
        async getTutorPostVotes(tutorPostId) {
            await fetch('/tutor-votes/' + tutorPostId)
                .then((response) => {
                    return response.json();
                })
                .then((data) => {
                    var votesOnThisTutor = data;
                    var voteCount = 0;
                    let userUpVote = false;
                    let userDownVote = false;
                    // Record if current user has already voted on this tutor post.
                    for (let i = 0; i < votesOnThisTutor.length; i++) {
                        if (votesOnThisTutor[i].user_id == this.user.userId) {
                            if (votesOnThisTutor[i].vote == 1) {
                                userUpVote = true;
                            } else if (votesOnThisTutor[i].vote == -1) {
                                userDownVote = true;
                            }
                        }
                        // Calculate SUM of votes.
                        voteCount = voteCount + votesOnThisTutor[i].vote;
                    }
                    // Add the data to the post.
                    for (let i = 0; i < this.tutorPosts.length; i++) {
                        if (this.tutorPosts[i].id == tutorPostId) {
                            this.tutorPosts[i].voteCount = voteCount;
                            this.tutorPosts[i].userUpVote = userUpVote;
                            this.tutorPosts[i].userDownVote = userDownVote;
                        }
                    }
                });
        },
        // Get all users to map the post user ID to the user's name.
        async getUsers() {
            await fetch('/users/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => (this.users = data));
        },
        voteUp(postId, hasVoted, type) {
            if (type == 'source') {
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
                    ).then(() => this.getSourceVotes(postId));
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
                    ).then(() => this.getSourceVotes(postId));
                }
            } else if (type == 'tutor') {
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
                    ).then(() => this.getTutorPostVotes(postId));
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
                    ).then(() => this.getTutorPostVotes(postId));
                }
            }
        },
        voteDown(postId, hasVoted, type) {
            if (type == 'source') {
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
                        this.getSourceVotes(postId);
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
                        this.getSourceVotes(postId);
                    });
                }
            } else if (type == 'tutor') {
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
                    ).then(() => this.getTutorPostVotes(postId));
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
                    ).then(() => this.getTutorPostVotes(postId));
                }
            }
        },
        deletePost(source) {
            // Close the modal.
            this.showModal = false;
            // Delete record from DB.
            if (source.type != 'tutor') {
                fetch('/resources/delete/' + source.id, { method: 'DELETE' });
            } else {
                fetch('/tutor-posts/delete/' + source.id, {
                    method: 'DELETE'
                }).then(() => {
                    this.isAlreadyTutoring = false;
                });
            }

            // Delete without refreshing page.
            var index;
            for (let i = 0; i < this.posts.length; i++) {
                if (this.posts[i].id == source.id) {
                    index = i;
                }
            }
            if (index > -1) {
                this.posts.splice(index, 1);
            }
        },
        showWarningModal(source) {
            this.source = source;
            this.showModal = true;
        },
        closeWarningModal() {
            this.showModal = false;
        },
        flagElement(resourceId) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content_type: this.flagType,
                    content_id: resourceId,
                    user_id: this.user.userId
                })
            };
            var url = '/content-flags/add';

            fetch(url, requestOptions).then(() => {
                // Handle showing some modal after post content flags
                this.showThankModal = true;
                this.showFlaggingModal = false;
            });
        },
        handleOpenFlagModal(postId, type) {
            if(type == "source" ){
                this.flagType = "resource"
            }else if(type == "tutor"){
                this.flagType = "tutor_post"
            }
            this.flagPost = postId;
            this.showFlaggingModal = true;
            this.showActionBtns = false;
        },
        handleClickActionBtns(postId) {
            this.showActionBtns = !this.showActionBtns;
            this.currentClickId = postId;
        }
    }
};
</script>

<template>
    <div class="container-fluid">
        <div class="d-flex flex-column flex-md-row justify-content-between">
            <div class="d-flex align-items-md-baseline align-items-start gap-2">
                <h2>Best Places To Learn This</h2>
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
                        v-if="
                            user.role == 'student' && isAlreadyTutoring == false
                        "
                        :to="'/tutor/add/' + skillId"
                        class="btn purple-btn mt-2"
                        role="button"
                        >Offer to tutor&nbsp;&nbsp;<svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 384 512"
                            width="18"
                            height="20"
                        >
                            <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
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
                class="row mt-4 forum-container"
                :class="[post.type == 'tutor' ? 'tutor' : 'source']"
                v-for="post in orderedAndNamedPosts"
            >
                <div
                    class="d-flex align-items-center justify-content-between mb-2"
                >
                    <!-- Second row contain name and avatar -->
                    <div class="w-100">
                        <div class="col post-user-row">
                            <div v-if="post.type != 'tutor'" id="user-avatar">
                                <img
                                    :src="post.userAvatar"
                                    class="user-avatar-img"
                                    alt="user avatar"
                                />
                            </div>
                            <div
                                class="user-name-div d-flex justify-content-between w-100"
                            >
                                <span
                                    id="user-name-text"
                                    :class="{
                                        'tutor-user-name': post.type == 'tutor'
                                    }"
                                >
                                    {{ post.studentName }}
                                </span>
                                <span
                                    v-if="post.type == 'tutor'"
                                    class="text-light"
                                    style="font-weight: 500"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 640 512"
                                        width="36"
                                        height="36"
                                    >
                                        <!--!Font Awesome Free 6.5.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                        <path
                                            d="M192 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zm-8 384V352h16V480c0 17.7 14.3 32 32 32s32-14.3 32-32V192h56 64 16c17.7 0 32-14.3 32-32s-14.3-32-32-32H384V64H576V256H384V224H320v48c0 26.5 21.5 48 48 48H592c26.5 0 48-21.5 48-48V48c0-26.5-21.5-48-48-48H368c-26.5 0-48 21.5-48 48v80H243.1 177.1c-33.7 0-64.9 17.7-82.3 46.6l-58.3 97c-9.1 15.1-4.2 34.8 10.9 43.9s34.8 4.2 43.9-10.9L120 256.9V480c0 17.7 14.3 32 32 32s32-14.3 32-32z"
                                            fill="white"
                                        />
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>
                    <!-- First row of post contain likes count and relate buttons -->
                </div>
                <div class="col-12">
                    <div class="">
                        <div
                            v-if="post.type != 'tutor'"
                            class="forum-post"
                            v-html="post.content"
                        ></div>

                        <div v-else class="forum-post d-flex tutor-post">
                            <img
                                :src="post.userAvatar"
                                class="tutor-img rounded"
                                alt="user avatar"
                            />

                            <div>
                                <p>{{ post.description }}</p>
                                <p>{{ post.email }}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="d-flex align-items-center justify-content-end mt-3">
                    <!-- First row of post contain likes count and relate buttons -->
                    <div class="first-post-row">
                        <div class="d-flex flex-row justify-content-end gap-1">
                            <!-- Upvote Button -->
                            <div
                                v-if="
                                    post.user_id != user.userId ||
                                    post.type != 'tutor'
                                "
                                @click="
                                    voteUp(post.id, post.userUpVote, post.type)
                                "
                                b-tooltip.hover
                                title="I Like This "
                            >
                                <svg v-if="post.userUpVote" width="34" height="27" fill="#36c1af" class="vote-icon upvote-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M23,10C23,8.89 22.1,8 21,8H14.68L15.64,3.43C15.66,3.33 15.67,3.22 15.67,3.11C15.67,2.7 15.5,2.32 15.23,2.05L14.17,1L7.59,7.58C7.22,7.95 7,8.45 7,9V19A2,2 0 0,0 9,21H18C18.83,21 19.54,20.5 19.84,19.78L22.86,12.73C22.95,12.5 23,12.26 23,12V10M1,21H5V9H1V21Z" /></svg>
                                <svg v-else width="34" height="27" fill="#36c1af" class="vote-icon upvote-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5,9V21H1V9H5M9,21A2,2 0 0,1 7,19V9C7,8.45 7.22,7.95 7.59,7.59L14.17,1L15.23,2.06C15.5,2.33 15.67,2.7 15.67,3.11L15.64,3.43L14.69,8H21C22.11,8 23,8.9 23,10V12C23,12.26 22.95,12.5 22.86,12.73L19.84,19.78C19.54,20.5 18.83,21 18,21H9M9,19H18.03L21,12V10H12.21L13.34,4.68L9,9.03V19Z" /></svg>
                            </div>
                            <!-- Vote count Div -->
                            <span
                                b-on-hover
                                title="number of vote this resource receive"
                                id="vote-count"
                                :class="{
                                    'text-danger':
                                        post.voteCount < 0 &&
                                        post.type != 'tutor',
                                    'text-primary':
                                        post.voteCount > 0 &&
                                        post.type != 'tutor',
                                    'text-light': post.type == 'tutor'
                                }"
                                >{{ post.voteCount }}</span
                            >
                            <!-- Down vote button -->
                            <div
                                v-if="
                                    post.user_id != user.userId ||
                                    post.type != 'tutor'
                                "
                                b-tooltip.hover
                                title="I Dislike This "
                                @click="
                                    voteDown(
                                        post.id,
                                        post.userDownVote,
                                        post.type
                                    )
                                "
                            >
                                <svg v-if="post.userDownVote" width="34" height="27" fill="#FC6E68" class="vote-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,15H23V3H19M15,3H6C5.17,3 4.46,3.5 4.16,4.22L1.14,11.27C1.05,11.5 1,11.74 1,12V14A2,2 0 0,0 3,16H9.31L8.36,20.57C8.34,20.67 8.33,20.77 8.33,20.88C8.33,21.3 8.5,21.67 8.77,21.94L9.83,23L16.41,16.41C16.78,16.05 17,15.55 17,15V5C17,3.89 16.1,3 15,3Z" /></svg>
                                <svg v-else width="34" height="27" fill="#FC6E68" class="vote-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19,15V3H23V15H19M15,3A2,2 0 0,1 17,5V15C17,15.55 16.78,16.05 16.41,16.41L9.83,23L8.77,21.94C8.5,21.67 8.33,21.3 8.33,20.88L8.36,20.57L9.31,16H3C1.89,16 1,15.1 1,14V12C1,11.74 1.05,11.5 1.14,11.27L4.16,4.22C4.46,3.5 5.17,3 6,3H15M15,5H5.97L3,12V14H11.78L10.65,19.32L15,14.97V5Z" /></svg>
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
                                                (post.user_id == user.userId ||
                                                    user.role == 'admin' ||
                                                    user.role == 'editor') &&
                                                post.type != 'tutor'
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
                                        <router-link
                                            v-else-if="
                                                (post.user_id == user.userId ||
                                                    user.role == 'admin' ||
                                                    user.role == 'editor') &&
                                                post.type == 'tutor'
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
                                            title="Delete This Source"
                                            v-if="
                                                post.user_id == user.userId ||
                                                user.role == 'admin'
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
                                            <div
                                                class="d-flex flex-row-reverse"
                                            >
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
        <!-- The Modal -->
        <div v-if="showModal">
            <div id="myModal" class="modal">
                <!-- Modal content -->
                <div class="modal-content">
                    <p>Are you sure you want to delete the source?</p>
                    <div style="display: flex; gap: 10px">
                        <button
                            type="button"
                            class="btn btn-danger"
                            @click="deletePost(this.source)"
                        >
                            Yes
                        </button>
                        <button
                            type="button"
                            class="btn btn-dark"
                            @click="showModal = false"
                        >
                            No
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <!-- Modal of flagging resource -->
        <div v-if="showFlaggingModal">
            <div id="myModal" class="modal">
                <!-- Modal content -->
                <div class="modal-content">
                    <p>
                        Would you like to flag this as unhelpful or incorrect
                        for admin review
                    </p>
                    <div
                        class="d-flex justify-content-lg-between justify-content-md-end justify-content-between gap-2"
                    >
                        <button
                            type="button"
                            class="btn red-btn w-lg-25"
                            @click="showFlaggingModal = false"
                        >
                            <span class="d-none d-md-block"> No </span>
                            <!-- Tick Icon ONLY show when in Phone View -->
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
                            class="btn green-btn w-lg-25"
                            @click="flagElement(flagPost)"
                        >
                            <span class="d-none d-md-block"> Yes </span>
                            <!-- X icon Only show when in Phone View -->
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
        </div>
        <!-- Thank You Modal After User Flagging -->
        <div v-if="showThankModal">
            <div id="myModal" class="modal">
                <!-- Modal content -->
                <div class="modal-content">
                    <div class="d-flex gap-4 text-center">
                        <p>
                            Thank you for flagging this source. We will take a
                            look as soon as possible!
                        </p>
                    </div>
                    <div class="d-flex justify-content-center">
                        <button
                            type="button"
                            class="btn green-btn w-25"
                            @click="showThankModal = false"
                        >
                            <div>OK</div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.red-btn:hover {
    background-color: #cc3535;
    color: white;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    height: auto;
    align-items: center;
    justify-content: center;
}

.green-btn:hover {
    background-color: #3eb3a3;
}

.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.purple-btn:hover {
    background-color: #8666ca;
}

#posts-big-container {
    padding-left: 10px;
    padding-right: 10px;
}

.forum-container {
    border-radius: 12px;
    padding-top: 12px;
    padding-bottom: 12px;
}

.tutor {
    background-color: #a48be6;
}

.source {
    background-color: #f2edff;
}

#vote-count {
    font-size: 1.563rem;
    font-weight: 700;
    margin-top: -7px;
    cursor: help;
}

.vote-icon {
    height: 34px !important;
    cursor: pointer;
}

.upvote-icon {
    margin-top: -8px;
}

#user-name-text {
    font-family: 'Poppins', sans-serif;
    font-size: 1rem;
    font-weight: lighter;
    color: #778094;
}

.tutor-user-name {
    color: white !important;
}

.user-name-div {
    margin-left: 5px;
}

#user-avatar {
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

.tutor-img {
    width: 100px !important;
    height: 100px !important;
    margin-right: 1rem;
}

.forum-post {
    background-color: #ffffff;
    border-radius: 5px;
    padding: 10px 20px;
}

.forum-post img {
    max-width: 100%;
    height: auto;
}

.resource-vote-button {
    width: 32px;
}

.userUpVote {
    background-color: green;
}

.userDownVote {
    background-color: red;
}

h2 {
    color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
    font-size: 1.75rem;
}

.plus-icon {
    height: 20px !important;
}

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

#add-resource-column {
    padding-right: 0px !important;
    margin-right: 0px !important;
}

/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 300px;
    /* Could be more or less, depending on screen size */
}

.modal-btn {
    width: 25%;
}
/* End of Warning modal styling */

.post-user-row {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 5px;
}

#header-col {
    display: flex;
    align-items: end;
    justify-content: start;
}

#header-col > h2 {
    margin-bottom: 0px;
    font-size: 1.75rem;
    margin-left: 0px;
}

/* Style For dropdown div */
.toggle-actions-bnt {
    cursor: pointer;
    background-color: #fefefe;
    border-radius: 50px;
    width: 30px;
    height: 30px;
    padding-top: 4px;
    padding-left: 4px;
    margin-top: -5px;
    margin-left: 5px;
}

.toggle-actions-bnt:hover {
    outline: 1px solid gray;
    background-color: white;
}

.more-icon {
    height: 100%;
    width: auto;
}

.action-btns-div {
    background-color: white;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    padding: 5px;
    position: absolute;
    top: 25px;
    left: 5px;
    z-index: 10;
    box-shadow: 0 4px 4px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}

.dropdown-btn {
    outline: none !important;
    border: 0px;
}

.dropdown-btn:hover {
    scale: 1.2;
}

/* Dropdown Animation */

@keyframes slide {
    0% {
        opacity: 0;
        transform: scaleY(0);
    }

    100% {
        opacity: 1;
        transform: scaleY(1);
    }
}
.dropdown-enter-active {
    transform-origin: top center;
    animation: slide 0.2s;
}
.dropdown-leave-active {
    transform-origin: top center;
    animation: slide 0.2s reverse;
}

/* Delay The button transition */
.dropdown-enter-active .btn,
.dropdown-leave-active .btn {
    transition-delay: 0.2s;
}

/* ** End Of Dropdown Animation ** */

/* Mobile */
@media (max-width: 480px) {
    .center-header {
        justify-content: center;
    }

    #user-avatar {
        padding: 4px;
    }

    .forum-post {
        width: 94%;
    }

    #vote-count {
        font-size: 18px;
        font-weight: 500;
    }

    .vote-icon {
        height: 18px !important;
        margin-top: -15px;
    }

    .upvote-icon {
        margin-top: -20px;
    }

    .toggle-actions-bnt {
        width: 22px;
        height: 22px;
        padding-top: 0px;
        padding-left: 2px;
    }

    .first-post-row {
        margin-left: 15px;
    }

    .action-btns-div {
        left: -10px;
    }

    .modal-btn {
        width: fit-content;
    }

    .modal-content {
        margin-top: 100%;
        width: 90%;
    }

    .modal-content-flag {
        margin-top: 100%;
        width: 95%;
    }

    .tutor-post {
        flex-direction: column;
    }

    .tutor-img {
        margin-right: unset;
        margin: auto;
    }
}

/* Tablets */
@media (min-width: 481px) and (max-width: 1024px) {
    .center-header {
        justify-content: center;
    }

    .first-post-row {
        margin-left: 20px;
    }

    .forum-post {
        width: 96%;
    }

    .modal-content {
        margin-top: 60%;
        width: 70%;
    }

    .modal-content-flag {
        margin-top: 55%;
        width: 50%;
    }

    .modal-btn {
        width: fit-content;
    }
}
</style>
