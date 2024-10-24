<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import { useSkillsStore } from '../../../stores/SkillsStore';
import { useUsersStore } from '../../../stores/UsersStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const skillsStore = useSkillsStore();
        const usersStore = useUsersStore();

        return {
            userDetailsStore,
            skillsStore,
            usersStore
        };
    },
    data() {
        return {
            skillUrl: this.$route.params.skillUrl,
            versionNumber: this.$route.params.versionNumber,
            skillRevision: {},
            currentVersionNumber: null,
            revertComment: '',
            isCurrentVersion: false,
            showConfirmModal: false,
            showCommentModal: false,
            skill: {}
        };
    },
    async mounted() {
        // Get list of skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }
        // Get list of users.
        if (this.usersStore.users.length == 0) {
            await this.usersStore.getUsers();
        }
        await this.getSkill();
    },
    methods: {
        async getSkill() {
            // Load the skill data
            const res = await fetch('/skills/url/' + this.skillUrl);
            this.skill = await res.json();
            this.currentVersionNumber = this.skill.version_number;
            await this.getSkillVersion();
        },
        async getSkillVersion() {
            let url =
                '/skill-history/' + this.skill.id + '/' + this.versionNumber;

            const res = await fetch(url);
            this.skillRevision = await res.json();

            if (
                this.skillRevision.version_number == this.currentVersionNumber
            ) {
                this.isCurrentVersion = true;
            }

            // Get name of parent.
            for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                if (
                    this.skillsStore.skillsList[i].id ==
                    this.skillRevision.parent
                ) {
                    this.skillRevision.parentName =
                        this.skillsStore.skillsList[i].name;
                }
            }

            // Get name of user that made the revision.
            for (let i = 0; i < this.usersStore.users.length; i++) {
                if (this.usersStore.users[i].id == this.skillRevision.user_id) {
                    this.skillRevision.userName =
                        this.usersStore.users[i].username;
                }
            }

            // Prep the date and time data ---------------
            var date = this.skillRevision.edited_date.replace('T', ' ');
            date = date.replace('Z', ' ');
            let newDate = date.split(/[- :]/);
            var finalDate = new Date(
                Date.UTC(
                    newDate[0],
                    newDate[1] - 1,
                    newDate[2],
                    newDate[3],
                    newDate[4],
                    newDate[5]
                )
            );
            var options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            };
            this.skillRevision.date = finalDate.toLocaleDateString(
                'en-US',
                options
            );
        },
        confirmRevert() {
            this.showConfirmModal = true;
        },
        closeModal() {
            this.showConfirmModal = false;
            this.showCommentModal = false;
        },
        openCommentModal() {
            this.closeModal();
            this.showCommentModal = true;
        },
        revert() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comment: this.revertComment
                })
            };
            var url =
                '/skill-history/' +
                this.skill.id +
                '/revert-to/' +
                this.versionNumber;
            fetch(url, requestOptions).then(() => {
                this.$router.push('/skills/' + this.skill.url);
            });
        }
    }
};
</script>

<template>
    <div class="d-flex">
        <div class="container mt-3">
            <div id="skill-info-container">
                <!-- Skill Info -->
                <div class="d-flex justify-content-between">
                    <h1 class="skill-name">{{ skill.name }}</h1>
                </div>
                <!-- A line divide -->
                <hr class="border border-2 opacity-100 hr" />

                <div
                    class="d-flex flex-column flex-md-row justify-content-between"
                >
                    <div class="alert alert-warning d-flex" role="alert">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="20"
                            height="20"
                        >
                            <path
                                d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
                            />
                        </svg>
                        <span v-if="!isCurrentVersion" class="ms-2">
                            This is an old revision of this skill, as edited by
                            {{ skillRevision.userName }}, at
                            <span class="warning-date">
                                {{ skillRevision.date }} </span
                            >.
                        </span>
                        <span v-else class="ms-2">
                            This is the current revision of this skill, as
                            edited by
                            {{ skillRevision.userName }}, at
                            <span class="warning-date">
                                {{ skillRevision.date }} </span
                            >.
                        </span>
                    </div>
                </div>
                <!-- A line divide -->
                <hr class="border border-1 opacity-100 hr mt-2" />
                <div class="d-flex flex-column-reverse flex-md-row gap-4">
                    <div class="mastery-requirements">
                        <div v-html="skill.mastery_requirements"></div>
                    </div>
                    <div class="info-box p-2 mb-2">
                        <img
                            :src="
                                skillRevision.icon_image
                                    ? skillRevision.icon_image
                                    : '/images/skill-avatar/recurso.png'
                            "
                            @error="imageUrlAlternative"
                            class="rounded img-fluid"
                        />
                        <!-- Grade level -->
                        <div class="mt-3" style="color: #a48be6">
                            Level:
                            <strong>
                                <span v-if="skill.level == 'grade_school'"
                                    >Grade School</span
                                >
                                <span v-else-if="skill.level == 'middle_school'"
                                    >Middle School</span
                                >
                                <span v-else-if="skill.level == 'high_school'"
                                    >High School</span
                                >
                                <span v-else-if="skill.level == 'college'"
                                    >College</span
                                >
                                <span v-else-if="skill.level == 'phd'"
                                    >PHD</span
                                >
                            </strong>
                        </div>
                    </div>
                </div>
                <button
                    v-if="
                        !isCurrentVersion &&
                        (userDetailsStore.role == 'admin' ||
                            userDetailsStore.role == 'editor')
                    "
                    class="btn purple-btn mt-2"
                    @click="confirmRevert()"
                >
                    Revert to this version
                </button>
                <p>&nbsp;</p>
            </div>
        </div>
    </div>
    <!-- Confirm Modal -->
    <div v-if="showConfirmModal" class="modal">
        <!-- Confirm Modal -->
        <div class="modal-content asking-modal">
            <div class="d-flex gap-4">
                <!-- Warn Triangle Icon -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    fill="grey"
                    width="45"
                    height="45"
                >
                    <path
                        d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
                    />
                </svg>
                <p>
                    Are you sure you want to revert the skill to this version?
                </p>
            </div>
            <!-- Buttons row -->
            <div
                class="d-flex justify-content-lg-between justify-content-md-end justify-content-between gap-2"
            >
                <button
                    type="button"
                    class="btn red-btn modal-btn"
                    @click="closeModal"
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
                    class="btn green-btn modal-btn"
                    @click="openCommentModal"
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
    <!-- Comment Modal -->
    <div v-if="showCommentModal" id="myModal" class="modal">
        <!-- Modal content -->
        <div class="modal-content">
            <div class="d-flex flex-column">
                <div class="pb-3">Please add a comment to explain.</div>
                <textarea
                    class="revert-comment"
                    rows="5"
                    cols="33"
                    autofocus
                    v-model="revertComment"
                >
                </textarea>
                <!-- Suggest template -->
            </div>

            <!-- Buttons row -->
            <div
                class="d-flex justify-content-lg-between justify-content-md-end justify-content-between gap-2 mt-2"
            >
                <button
                    type="button"
                    class="btn red-btn modal-btn"
                    @click="closeModal"
                >
                    <span class="d-none d-md-block"> Cancel </span>
                    <!-- X Icon ONLY show when in Phone View -->
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
                    class="btn green-btn modal-btn"
                    @click="revert"
                >
                    <span class="d-none d-md-block"> Submit </span>
                    <!-- Tick icon Only show when in Phone View -->
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
</template>

<style scoped>
/* The Warning Modal */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 10;
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
/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}
.asking-modal {
    width: 340px !important;
}
/* ---- End of Warning modal styling ---- */

#skill-info-container {
    background-color: #f2edff;
    border-radius: 12px;
    padding: 30px;
    min-height: 86.5vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.skill-name {
    font-family: 'Poppins', sans-serif;
    font-size: 40px;
    color: #a48be6;
    font-weight: 800;
    margin-bottom: 0px;
    text-align: start;
}

.hr {
    border-color: #aea3ce !important;
}

.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    max-width: fit-content;
    height: 44px;
    display: flex;
    align-items: center;
}

.purple-btn:hover {
    background-color: #8f7bd6;
}

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
    color: white;
}

.green-btn:focus {
    background-color: #2ca695;
    color: white;
}
.revert-comment {
    outline: none;
    border-radius: 8px;
    border: #888 1px solid;
    padding: 10px;
    font-family: 'Poppins' sans-serif;
    font-size: 15px;
    color: #394353;
}

.revert-comment:focus {
    outline: none;
}

.warning-date {
    font-style: italic;
}

.mastery-requirements {
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: rgba(255, 255, 255, 0.692);
    border-radius: 5px;
    width: 70%;
}

.info-box {
    border: 1px solid #a2a9b1;
    color: black;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 35%;
}

/* Style Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    .modal-content {
        margin: 45% 0%;
        width: 100% !important;
    }

    .custom-select-div {
        width: 100%;
    }

    #skill-info-container {
        background-color: #f2edffcc;
        border-radius: 12px;
        padding: 20px;
    }

    .skill-name {
        margin-top: 5px;
        font-size: 25px;
        margin: 0px 5px;
    }
}

/* ************************* */
/* Style Specific on Tablet */
@media (min-width: 577px) and (max-width: 1023px) {
    #skill-info-container {
        padding: 15px;
    }
}
</style>
