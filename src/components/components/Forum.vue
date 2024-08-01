<script>
// Import the store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
// Import Custom Components
import FlagModals from './FlagModals.vue';
import ForumResource from './ForumResource.vue';
import ForumTutorPost from './ForumTutorPost.vue';

export default {
    setup() {
        // I think because store is in separate component so we will setup it in child
        // instead of passing the store as prop.
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.skillId,
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
            source: null
        };
    },
    components: {
        FlagModals,
        ForumResource,
        ForumTutorPost
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
        deletePost(source) {
            // Close the modal.
            this.showModal = false;
            // Delete record from DB.
            // Using switch case for easy future adding new type of post
            switch (source.type) {
                case 'tutor':
                    fetch('/tutor-posts/delete/' + source.id, {
                        method: 'DELETE'
                    }).then(() => {
                        this.isAlreadyTutoring = false;
                    });
                    // Delete without refreshing page.
                    this.tutorPosts = this.tutorPosts.filter((post) => {
                        return post.id !== source.id;
                    });
                    break;
                case 'source':
                    fetch('/resources/delete/' + source.id, {
                        method: 'DELETE'
                    });
                    this.sourcePosts = this.sourcePosts.filter((post) => {
                        return post.id !== source.id;
                    });
                    break;
            }
        },
        showWarningModal(source) {
            this.source = source;
            this.showModal = true;
        },
        closeWarningModal() {
            this.showModal = false;
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
                            <path
                                d="M32 32C32 14.3 46.3 0 64 0S96 14.3 96 32V240H32V32zM224 192c0-17.7 14.3-32 32-32s32 14.3 32 32v64c0 17.7-14.3 32-32 32s-32-14.3-32-32V192zm-64-64c17.7 0 32 14.3 32 32v48c0 17.7-14.3 32-32 32s-32-14.3-32-32V160c0-17.7 14.3-32 32-32zm160 96c0-17.7 14.3-32 32-32s32 14.3 32 32v64c0 17.7-14.3 32-32 32s-32-14.3-32-32V224zm-96 88l0-.6c9.4 5.4 20.3 8.6 32 8.6c13.2 0 25.4-4 35.6-10.8c8.7 24.9 32.5 42.8 60.4 42.8c11.7 0 22.6-3.1 32-8.6V352c0 88.4-71.6 160-160 160H162.3c-42.4 0-83.1-16.9-113.1-46.9L37.5 453.5C13.5 429.5 0 396.9 0 363V336c0-35.3 28.7-64 64-64h88c22.1 0 40 17.9 40 40s-17.9 40-40 40H96c-8.8 0-16 7.2-16 16s7.2 16 16 16h56c39.8 0 72-32.2 72-72z"
                                fill="white"
                            />
                        </svg>
                    </router-link>
                </div>
            </div>
        </div>
        <!-- ---- | Post List In This Forum | ---- -->
        <div id="posts-big-container">
            <ForumResource :resourcePosts="sourcePosts" :user="user" />
            <ForumTutorPost :tutorPosts="tutorPosts" :user="user" />
        </div>
        <!-------------------------------------------------------------------------------------------->
        <!-- The Delete Warn Modal -->
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
    </div>
    <!-- Flagging Component -->
    <FlagModals
        v-if="showFlaggingModal"
        :userId="userDetailsStore.userId"
        :contentType="flagType"
        :contentId="flagPost"
    />
</template>

<style>
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

.vote-count {
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
