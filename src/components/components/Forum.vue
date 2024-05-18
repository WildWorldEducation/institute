<script>
export default {
    setup() {},
    data() {
        return {
            skillId: this.$route.params.id,
            posts: [],
            users: [],
            votes: [],
            user: {},
            showModal: false,
            resourceId: null,
            showFlaggingModal: false,
            flagPost: '',
            showActionBtns: false,
            currentClickId: '',
            showThankModal: false
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
                    }
                }
            }

            // Ordering by vote.
            var sortedPosts = this.posts.sort(
                ({ voteCount: a }, { voteCount: b }) => b - a
            );
            for (let i = 0; i < sortedPosts.length; i++) {
                this.posts[i].index = i;
            }

            return sortedPosts;
        }
    },
    created() {
        this.getUserId();
        this.getUsers();
        this.getPosts(this.skillId);
    },
    methods: {
        getUserId() {
            fetch('/get-session-details')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => (this.user = data));
        },
        getPosts(skillId) {
            fetch('/skills/' + skillId + '/resources')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => (this.posts = data))
                .then(() => {
                    for (let i = 0; i < this.posts.length; i++) {
                        this.getPostVote(i, this.posts[i].id);
                    }
                });
        },
        getPostVote(i, resourceId) {
            fetch('/user-votes/' + resourceId)
                .then((response) => {
                    return response.json();
                })
                .then((data) => (this.votes = data))
                .then(() => {
                    this.posts[i].userUpVote = false;
                    this.posts[i].userDownVote = false;
                    var voteCount = 0;
                    for (let j = 0; j < this.votes.length; j++) {
                        // Calculate SUM of votes.
                        voteCount = voteCount + this.votes[j].vote;

                        // See if current user has voted (will reflect as green or red arrow).
                        if (this.votes[j].user_id == this.user.userId) {
                            if (this.votes[j].vote == 1) {
                                this.posts[i].userUpVote = true;
                                this.posts[i].userDownVote = false;
                            } else if (this.votes[j].vote == -1) {
                                this.posts[i].userUpVote = false;
                                this.posts[i].userDownVote = true;
                            } else {
                                this.posts[i].userUpVote = false;
                                this.posts[i].userDownVote = false;
                            }
                        }
                    }
                    this.posts[i].voteCount = voteCount;
                });
        },
        // Get all users to map the post user ID to the user's name.
        getUsers() {
            fetch('/users/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => (this.users = data));
        },
        voteUp(resourceIndex, resourceId, hasVoted) {
            if (hasVoted) {
                fetch(
                    '/user-votes/' +
                        this.user.userId +
                        '/' +
                        resourceId +
                        '/edit/cancel',
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'content/type'
                        },
                        body: {}
                    }
                ).then((response) =>
                    this.getPostVote(resourceIndex, resourceId)
                );
            } else {
                fetch(
                    '/user-votes/' +
                        this.user.userId +
                        '/' +
                        resourceId +
                        '/edit/up',
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'content/type'
                        },
                        body: {}
                    }
                ).then((response) =>
                    this.getPostVote(resourceIndex, resourceId)
                );
            }
            //location.reload();
        },
        voteDown(resourceIndex, resourceId, hasVoted) {
            if (hasVoted) {
                fetch(
                    '/user-votes/' +
                        this.user.userId +
                        '/' +
                        resourceId +
                        '/edit/cancel',
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'content/type'
                        },
                        body: {}
                    }
                ).then((response) =>
                    this.getPostVote(resourceIndex, resourceId)
                );
            } else {
                fetch(
                    '/user-votes/' +
                        this.user.userId +
                        '/' +
                        resourceId +
                        '/edit/down',
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'content/type'
                        },
                        body: {}
                    }
                ).then((response) =>
                    this.getPostVote(resourceIndex, resourceId)
                );
            }
            //   location.reload();
        },
        deletePost(resourceId) {
            // Close the modal.
            this.showModal = false;

            // Delete record from DB.
            fetch('/resources/delete/' + resourceId, { method: 'DELETE' });

            // Delete without refreshing page.
            var index;
            for (let i = 0; i < this.posts.length; i++) {
                if (this.posts[i].id == resourceId) {
                    index = i;
                }
            }
            if (index > -1) {
                this.posts.splice(index, 1);
            }
        },
        showWarningModal(resourceId) {
            this.resourceId = resourceId;
            this.showModal = true;
        },
        closeWarningModal() {
            this.showModal = false;
        },
        flagSource(resourceId) {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content_type: 'resource',
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
        handleOpenFlagModal(postId) {
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
                <!--TODO: get src from database -->
                <img src="/images/recurso-69.png" class="" />
            </div>
            <div class="mx-auto mx-md-0 mt-3 mt-lg-0">
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
        <div id="posts-big-container">
            <div
                class="row forum-container mt-3"
                v-for="post in orderedAndNamedPosts"
            >
                <!-- First row of post contain likes count and relate buttons -->
                <div class="row first-post-row">
                    <div class="d-flex flex-row justify-content-end gap-1">
                        <!-- Upvote Button -->
                        <div
                            @click="
                                voteUp(post.index, post.id, post.userUpVote)
                            "
                            b-tooltip.hover
                            title="I Like This "
                        >
                            <svg
                                width="34"
                                height="27"
                                viewBox="0 0 34 27"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                class="vote-icon upvote-icon"
                            >
                                <path
                                    d="M6.7047 8.4637H2.53277C2.20492 8.45845 1.87926 8.51793 1.57443 8.63872C1.2696 8.75952 0.991586 8.93926 0.756319 9.16765C0.521052 9.39604 0.333148 9.66859 0.203367 9.96971C0.0735865 10.2708 0.00447827 10.5946 0 10.9224L0 23.8771C0.00413046 24.2051 0.0730026 24.529 0.202662 24.8303C0.332321 25.1315 0.520214 25.4042 0.755552 25.6327C0.99089 25.8612 1.26904 26.0409 1.57402 26.1616C1.87901 26.2822 2.20483 26.3415 2.53277 26.3359H6.7285C7.2442 26.3324 7.7378 26.126 8.10246 25.7613C8.46712 25.3967 8.67352 24.9031 8.67699 24.3874V10.4228C8.6763 9.90523 8.47113 9.40893 8.10617 9.04198C7.7412 8.67504 7.24602 8.46719 6.7285 8.4637H6.7047Z"
                                    fill="#73DED0"
                                />
                                <path
                                    d="M30.9566 7.96678H22.1818L22.6551 2.45972C22.6905 2.05887 22.6162 1.65593 22.4402 1.29406C22.2641 0.932193 21.993 0.625033 21.6557 0.405482C21.1721 0.0908513 20.5948 -0.047297 20.0211 0.0143545C19.4475 0.0760059 18.9127 0.333681 18.5069 0.74389L11.5643 7.97736C10.9772 8.57753 10.6463 9.38239 10.6416 10.222V24.7629C10.6446 24.9661 10.7044 25.1644 10.8142 25.3354C10.9239 25.5064 11.0794 25.6433 11.2629 25.7305C12.4565 26.3203 13.7703 26.6261 15.1017 26.6242H30.3671C30.89 26.6414 31.3994 26.456 31.789 26.1068C32.1787 25.7576 32.4184 25.2714 32.4583 24.7497L33.0479 9.98401C33.0902 8.88154 32.1411 7.96678 30.9566 7.96678Z"
                                    fill="#73DED0"
                                />
                            </svg>
                        </div>
                        <!-- Vote count Div -->
                        <span
                            b-on-hover
                            title="number of vote this resource receive"
                            id="vote-count"
                            :class="{
                                'text-danger': post.voteCount < 0,
                                'text-primary': post.voteCount > 0
                            }"
                            >{{ post.voteCount }}</span
                        >
                        <!-- Down vote button -->
                        <div
                            b-tooltip.hover
                            title="I Dislike This "
                            @click="
                                voteDown(post.index, post.id, post.userDownVote)
                            "
                        >
                            <svg
                                width="34"
                                height="27"
                                viewBox="0 0 34 27"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                class="vote-icon"
                            >
                                <path
                                    d="M26.6742 18.1613L30.8461 18.1613C31.174 18.1665 31.4996 18.1071 31.8045 17.9863C32.1093 17.8655 32.3873 17.6857 32.6226 17.4574C32.8579 17.229 33.0458 16.9564 33.1755 16.6553C33.3053 16.3542 33.3744 16.0304 33.3789 15.7026L33.3789 2.74788C33.3748 2.41992 33.3059 2.096 33.1762 1.79473C33.0466 1.49346 32.8587 1.22076 32.6234 0.9923C32.388 0.76384 32.1099 0.584116 31.8049 0.463449C31.4999 0.342781 31.1741 0.283544 30.8461 0.289142L26.6504 0.289142C26.1347 0.292604 25.6411 0.499002 25.2764 0.863666C24.9118 1.22833 24.7054 1.72193 24.7019 2.23763L24.7019 16.2022C24.7026 16.7198 24.9078 17.2161 25.2727 17.583C25.6377 17.95 26.1329 18.1578 26.6504 18.1613L26.6742 18.1613Z"
                                    fill="#FC6E68"
                                />
                                <path
                                    d="M2.42226 18.6582L11.1971 18.6582L10.7238 24.1653C10.6884 24.5661 10.7627 24.9691 10.9387 25.3309C11.1148 25.6928 11.3859 26 11.7232 26.2195C12.2068 26.5341 12.7842 26.6723 13.3578 26.6106C13.9314 26.549 14.4663 26.2913 14.872 25.8811L21.8146 18.6476C22.4017 18.0475 22.7326 17.2426 22.7373 16.403L22.7373 1.86209C22.7343 1.6589 22.6745 1.4606 22.5648 1.2896C22.455 1.1186 22.2995 0.981731 22.116 0.894453C20.9224 0.304703 19.6086 -0.00113133 18.2772 0.000842658L3.01183 0.000841324C2.48889 -0.0163535 1.9795 0.168989 1.58988 0.518219C1.20026 0.867447 0.960491 1.3536 0.920578 1.8753L0.331006 16.641C0.288705 17.7435 1.23783 18.6582 2.42226 18.6582Z"
                                    fill="#FC6E68"
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
                                title="More Actions On This Resource"
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
                                        v-if="post.user_id == user.userId"
                                        :to="'/resources/edit/' + post.id"
                                        class="btn dropdown-btn"
                                        role="button"
                                        b-tooltip.hover
                                        title="Edit This Resource For Review"
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
                                        title="Delete This Resource"
                                        v-if="
                                            post.user_id == user.userId ||
                                            user.role == 'admin'
                                        "
                                        type="button"
                                        class="btn dropdown-btn"
                                        @click="showWarningModal(post.id)"
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
                                        title="Flag This Resource For Review"
                                        type="button"
                                        class="btn dropdown-btn"
                                        @click="handleOpenFlagModal(post.id)"
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
                <!-- Second row contain name and avatar -->
                <div class="row">
                    <div class="col post-user-row">
                        <div id="user-avatar">
                            <img
                                :src="post.userAvatar"
                                class="user-avatar-img"
                                alt="user avatar"
                            />
                        </div>
                        <div class="user-name-div">
                            <span id="user-name-text">
                                {{ post.studentName }}:
                            </span>
                        </div>
                    </div>
                    <hr />
                </div>
                <div class="forum-post row">
                    <div v-html="post.content"></div>
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
                            @click="deletePost(this.resourceId)"
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
                    <p>Are you sure you want to flag this source?</p>
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
                            @click="flagSource(flagPost)"
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

#posts-big-container {
    padding-left: 10px;
    padding-right: 10px;
}

.forum-container {
    background-color: #f2edff;
    border-radius: 12px;
    padding: 5px;
    padding-top: 25px;
    padding-bottom: 30px;
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
    font-size: 1.25rem;
    font-weight: 560;
    color: #778094;
}

.user-name-div {
    margin-left: 5px;
}

#user-avatar {
    height: 60px;
    width: fit-content;
}

.user-avatar-img {
    width: auto;
    height: 100%;
    border-radius: 10px;
    margin-right: 0px;
    margin-left: auto;
    margin-top: 0px;
}

.forum-post {
    background-color: white;
    border-radius: 5px;
    padding: 10px 20px;
    width: 98%;
    margin-left: 20px;
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
