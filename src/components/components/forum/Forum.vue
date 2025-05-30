<script>
// Import the store.
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
// Import Custom Components
import FlagModals from '../FlagModals.vue';
import ForumAllPost from './ForumAllPost.vue';

export default {
    setup() {
        // I think because store is in separate component so we will setup it in child
        // instead of passing the store as prop.
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    emits: ['progressTutorial', 'skipTutorial'],
    props: ['skillId', 'showTutorialTip10', 'userRole'],
    data() {
        return {
            sourcePosts: [],
            tutorPosts: [],
            // posts: [],
            user: {},
            showModal: false,
            resourceId: null,
            showFlaggingModal: false,
            flagPost: '',
            flagType: '',
            showActionBtns: false,
            currentClickId: '',
            source: null,
            activeTab: 'allPost'
        };
    },
    components: {
        FlagModals,
        ForumAllPost
    },
    computed: {
        posts() {
            let posts = this.sourcePosts;
            posts = posts.concat(this.tutorPosts);
            return posts;
        }
    },
    async created() {
        await this.getUserId();

        // Get all sources for this skill.
        await this.getSourcePosts(this.skillId);

        // Get voting data on each.
        for (let i = 0; i < this.sourcePosts.length; i++) {
            await this.getSourceVotes(this.sourcePosts[i].id);
        }

        // Dont show the tutors if guest account.
        if (this.$parent.sessionDetailsStore.isLoggedIn == true) {
            // Get all tutor posts for this skill.
            await this.getTutorPosts(this.skillId);

            // Get voting data on each.
            for (let i = 0; i < this.tutorPosts.length; i++) {
                await this.getTutorPostVotes(this.tutorPosts[i].id);
            }
        }
    },
    methods: {
        async getUserId() {
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
                    data.forEach((element) => {
                        element.type = 'tutor-post';
                        if (element.contact_preference == null) {
                            element.contact_preference = element.email;
                        }
                    });

                    // Add these tutor posts to the other posts, if the skill is the same.
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].skill_id == this.skillId) {
                            this.tutorPosts.push(data[i]);
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
        deletePost(source) {
            // Close the modal.
            this.showModal = false;
            // Delete record from DB.
            // Using switch case for easy future adding new type of post
            switch (source.type) {
                case 'tutor-post':
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
        deleteTutorPost(source) {
            // Close the modal.
            this.showModal = false;
            // Delete record from DB.

            fetch('/tutor-posts/delete/' + source.id, {
                method: 'DELETE'
            }).then(() => {
                this.getS;
                this.isAlreadyTutoring = false;
            });

            // Delete without refreshing page using filter will be quicker.
            this.tutorPosts = this.tutorPosts.filter((tutorPost) => {
                return tutorPost.id != source.id;
            });
        },
        showWarningModal(source) {
            this.source = source;
            this.showModal = true;
        },
        closeWarningModal() {
            this.showModal = false;
        },
        handleTabClick(tabName) {
            switch (tabName) {
                case 'tutorPost':
                    this.activeTab = 'tutorPost';
                    break;
                case 'resource':
                    this.activeTab = 'resource';
                    break;
                default:
                    this.activeTab = 'allPost';
                    break;
            }
        }
    }
};
</script>

<template>
    <div class="container-fluid mt-4">
        <div class="forum-header">
            <h2 class="secondary-heading">Other Places To Learn This</h2>
        </div>
        <ForumAllPost
            :posts="posts"
            :user="user"
            :skillId="skillId"
            :showTutorialTip10="showTutorialTip10"
            :userRole="userDetailsStore.role"
            @progressTutorial="$emit('progressTutorial', $event)"
            @skipTutorial="$emit('skipTutorial', $event)"
        />
    </div>
    <!-- Flagging Component -->
    <FlagModals
        v-if="showFlaggingModal"
        :userId="userDetailsStore.userId"
        :contentType="flagType"
        :contentId="flagPost"
    />
</template>

<style scoped>
.forum-header {
    background-color: #f2edffcc;
    border-radius: 10px;
    padding: 10px;
}

.nav-tabs {
    --bs-nav-tabs-border-width: 2px;
    --bs-nav-tabs-border-color: var(--primary-color);
    --bs-nav-tabs-link-active-border-color: var(--primary-color)
        var(--primary-color) #fff;
    --bs-nav-tabs-link-active-color: var(--primary-color);
    font-weight: 550;
    cursor: pointer;
}

.active {
    cursor: help;
}

.nav-link {
    color: var(--primary-color);
    font-weight: 550;
}

.nav-link:hover {
    border-bottom-color: var(--primary-color);
}

.nav-link.active {
    color: var(--primary-color);
}

.nav-link.active:hover {
    border-bottom-color: transparent;
}

:deep(.green-btn) {
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

:deep(.green-btn:hover) {
    background-color: #3eb3a3;
}

:deep(.vote-count) {
    font-size: 1.563rem;
    font-weight: 700;
    margin-top: -7px;
    cursor: help;
}

:deep(.vote-icon) {
    height: 34px !important;
    cursor: pointer;
}

:deep(.upvote-icon) {
    margin-top: -8px;
}

:deep(.resource-vote-button) {
    width: 32px;
}

:deep(.userUpVote) {
    background-color: green;
}

:deep(.userDownVote) {
    background-color: red;
}

.plus-icon {
    height: 20px !important;
}

/* The Warning Modal */
:deep(.modal) {
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
:deep(.modal-content) {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 300px;
    /* Could be more or less, depending on screen size */
}

:deep(.modal-btn) {
    width: 25%;
}
/* End of Warning modal styling */

/* Style For dropdown div */
:deep(.toggle-actions-bnt) {
    cursor: pointer;
    background-color: #fefefe;
    border-radius: 50px;
    width: 30px;
    height: 30px;
    padding-top: 4px;
    padding-left: 4px;
    margin-top: -5px;
    margin-left: 5px;
    border: none;
}

:deep(.toggle-actions-bnt:hover) {
    outline: 1px solid gray;
    background-color: white;
}

:deep(.more-icon) {
    height: 100%;
    width: auto;
}

:deep(.action-btns-div) {
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

:deep(.dropdown-btn) {
    outline: none !important;
    border: 0px;
}

:deep(.dropdown-btn:hover) {
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

:deep(.dropdown-enter-active) {
    transform-origin: top center;
    animation: slide 0.2s;
}

:deep(.dropdown-leave-active) {
    transform-origin: top center;
    animation: slide 0.2s reverse;
}

/* Delay The button transition */
:depp(.dropdown-enter-active .btn, .dropdown-leave-active .btn) {
    transition-delay: 0.2s;
}

/* ** End Of Dropdown Animation ** */

/* Mobile */
@media (max-width: 480px) {
    .center-header {
        justify-content: center;
    }

    :deep(.forum-post) {
        width: 94%;
    }

    :deep(.vote-count) {
        font-size: 18px;
        font-weight: 500;
    }

    :deep(.vote-icon) {
        height: 18px !important;
        margin-top: -15px;
    }

    :deep(.upvote-icon) {
        margin-top: -20px;
    }

    :deep(.toggle-actions-bnt) {
        width: 22px;
        height: 22px;
        padding-top: 0px;
        padding-left: 2px;
    }

    :deep(.first-post-row) {
        margin-left: 15px;
    }

    :deep(.action-btns-div) {
        left: -10px;
    }

    :deep(.modal-btn) {
        width: fit-content;
    }

    :deep(.modal-content) {
        margin-top: 100%;
        width: 90%;
    }

    :deep(.modal-content-flag) {
        margin-top: 100%;
        width: 95%;
    }
}

/* Tablets */
@media (min-width: 481px) and (max-width: 1024px) {
    .center-header {
        justify-content: center;
    }

    :deep(.first-post-row) {
        margin-left: 20px;
    }

    :deep(.forum-post) {
        width: 96%;
    }

    :deep(.modal-content) {
        margin-top: 60%;
        width: 70%;
    }

    :deep(.modal-content-flag) {
        margin-top: 55%;
        width: 50%;
    }

    :deep(.modal-btn) {
        width: fit-content;
    }
}
</style>
