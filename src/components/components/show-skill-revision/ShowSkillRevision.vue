<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import { useSkillsStore } from '../../../stores/SkillsStore';
import { useUsersStore } from '../../../stores/UsersStore';
import ConfirmModal from './components/ConfirmModal.vue';
import CommentModal from './components/CommentModal.vue';
import CompareWithDropdown from './components/CompareWithDropdown.vue';
import CompareWithContent from './components/CompareWithContent.vue';
import { useShowSkillStore } from '../../../stores/ShowSkillStore.js';
import LoadingModal from './components/LoadingModal.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const skillsStore = useSkillsStore();
        const usersStore = useUsersStore();
        const showSkillStore = useShowSkillStore();
        return {
            userDetailsStore,
            skillsStore,
            usersStore,
            showSkillStore
        };
    },
    data() {
        return {
            skillUrl: this.$route.params.skillUrl,
            versionNumber: this.$route.params.versionNumber,
            skillRevision: {},
            skillRevisionHistory: [],
            currentVersionNumber: null,
            isCurrentVersion: false,
            showConfirmModal: false,
            showCommentModal: false,
            showLoadingModal: false,
            skill: {},
            compareWithRevision: null,
            currentCompareWithRevision: null,
            loadingStatus: ''
        };
    },
    components: {
        ConfirmModal,
        CommentModal,
        CompareWithDropdown,
        CompareWithContent,
        LoadingModal
    },
    async mounted() {
        // Get list of skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }
        // Get list of users.
        if (this.usersStore.usersIncludingDeleted.length == 0) {
            await this.usersStore.getUsersIncludingDeleted();
        }
        await this.getSkill();
        await this.getSkillRevisionHistory();
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
            for (
                let i = 0;
                i < this.usersStore.usersIncludingDeleted.length;
                i++
            ) {
                if (
                    this.usersStore.usersIncludingDeleted[i].id ==
                    this.skillRevision.user_id
                ) {
                    this.skillRevision.userName =
                        this.usersStore.usersIncludingDeleted[i].username;
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
        async getSkillRevisionHistory() {
            const url = '/skill-history/' + this.skill.id + '/list';
            const res = await fetch(url);
            const skillRevisionsResult = await res.json();

            this.skillRevisionHistory = skillRevisionsResult.map((revision) => {
                const author = this.usersStore.usersIncludingDeleted.find(
                    (o) => o.id === revision.user_id
                );
                return { ...revision, user_name: author.username };
            });
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
        revert(comment) {
            this.showCommentModal = false;
            this.showLoadingModal = true;
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comment: comment
                })
            };
            var url =
                '/skill-history/' +
                this.skill.id +
                '/revert-to/' +
                this.versionNumber;
            fetch(url, requestOptions).then(async (res) => {
                if (!res.ok) {
                    this.loadingStatus = 'fails';
                    return;
                }
                this.loadingStatus = 'success';
                await this.showSkillStore.findSkill(this.skillUrl);
            });
        },
        closeModal() {
            this.showCommentModal = false;
            this.showConfirmModal = false;
            this.showLoadingModal = false;
        },
        updateCompareWithRevision(revision) {
            if (
                revision?.version_number === this.skillRevision.version_number
            ) {
                return;
            }
            this.compareWithRevision = revision;
        },
        imageUrlAlternative(event) {
            event.target.src = '/images/skill-avatar/recurso.png';
        }
    }
};
</script>

<template>
    <div class="d-flex">
        <div v-if="!compareWithRevision" class="mt-3">
            <div id="skill-info-container">
                <!-- Skill Info -->

                <h1 class="heading">
                    {{ skill.name }}
                    <span class="revision-version"
                        >(revision {{ skillRevision.version_number }})</span
                    >
                </h1>

                <!-- A line divide -->
                <hr class="border border-2 opacity-100 hr" />

                <div class="d-flex flex-column">
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

                    <CompareWithDropdown
                        :skillRevisionHistory="skillRevisionHistory"
                        :currentShowingVersion="skillRevision.version_number"
                        :updateCompareWithRevision="updateCompareWithRevision"
                        :compareWithRevision="compareWithRevision"
                    />
                </div>
                <!-- A line divide -->
                <hr class="border border-1 opacity-100 hr mt-md-4 mt-5" />
                <div class="d-flex flex-column-reverse flex-md-row gap-4">
                    <!-- Mastery Requirements -->
                    <!-- <div class="col-md-8 order-2 order-md-1"> -->
                    <div class="d-flex flex-column">
                        <div class="mastery-requirements">
                            <div
                                v-html="skillRevision.mastery_requirements"
                            ></div>
                        </div>
                    </div>
                    <!-- </div> -->
                    <!-- Infobox -->
                    <div class="col-md-4 order-1 order-md-2">
                        <div class="info-box p-2 mb-2">
                            <!-- AWS S3 hosted feature image -->
                            <!-- Show a default skill avatar if skill not have image yet -->
                            <a
                                v-if="skillRevision.icon_image"
                                :href="
                                    'https://institute-skill-infobox-images.s3.amazonaws.com/' +
                                    skillRevision.icon_image
                                "
                            >
                                <img
                                    :src="
                                        'https://institute-skill-infobox-image-thumbnails.s3.amazonaws.com/' +
                                        skillRevision.icon_image
                                    "
                                    class="rounded img-fluid"
                                />
                            </a>
                            <div
                                class="d-flex flex-column align-items-center"
                                v-else
                            >
                                <div class="no-image-warn">
                                    Version
                                    {{ skillRevision.version_number }} Does Not
                                    Change Icon Image.
                                </div>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="80"
                                    height="80"
                                >
                                    <path
                                        d="M448 80c8.8 0 16 7.2 16 16l0 319.8-5-6.5-136-176c-4.5-5.9-11.6-9.3-19-9.3s-14.4 3.4-19 9.3L202 340.7l-30.5-42.7C167 291.7 159.8 288 152 288s-15 3.7-19.5 10.1l-80 112L48 416.3l0-.3L48 96c0-8.8 7.2-16 16-16l384 0zM64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l384 0c35.3 0 64-28.7 64-64l0-320c0-35.3-28.7-64-64-64L64 32zm80 192a48 48 0 1 0 0-96 48 48 0 1 0 0 96z"
                                    />
                                </svg>
                            </div>
                            <!-- Grade level -->
                            <div class="mt-2">
                                <h2 class="h4 heading">Level</h2>
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
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    v-if="
                        !isCurrentVersion &&
                        (userDetailsStore.role == 'admin' ||
                            userDetailsStore.role == 'editor')
                    "
                    class="btn primary-btn mt-4"
                    @click="confirmRevert()"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        fill="white"
                        height="25"
                        width="25"
                        class="me-2"
                    >
                        <path
                            d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9L0 168c0 13.3 10.7 24 24 24l110.1 0c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24l0 104c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65 0-94.1c0-13.3-10.7-24-24-24z"
                        />
                    </svg>
                    <div>Revert to this version</div>
                </button>
                <p>&nbsp;</p>
            </div>
        </div>
        <CompareWithContent
            v-else
            :skillRevisionHistory="skillRevisionHistory"
            :viewingRevision="skillRevision"
            :compareWithRevision="compareWithRevision"
            :updateCompareWithRevision="updateCompareWithRevision"
        />
    </div>
    <!-- Confirm Modal -->
    <ConfirmModal
        :showConfirmModal="showConfirmModal"
        :closeModal="closeModal"
        :openCommentModal="openCommentModal"
    />
    <!-- Comment Modal -->
    <CommentModal
        :showCommentModal="showCommentModal"
        :closeModal="closeModal"
        :revert="revert"
    />
    <LoadingModal
        :skillUrl="skillUrl"
        :showLoadingModal="showLoadingModal"
        :loadingStatus="loadingStatus"
        :closeModal="closeModal"
    />
</template>

<style scoped>
.info-box {
    border: 1px solid #a2a9b1;
    color: black;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
}

/* The Warning Modal */
:deep(.modal) {
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
:deep(.modal-content) {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
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
    color: var(--primary-color);
    font-weight: 800;
    margin-bottom: 0px;
    text-align: start;
}

.revision-version {
    font-weight: 500;
    font-size: 18px;
}

.hr {
    border-color: #aea3ce !important;
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
}

.info-box {
    color: black;
    border-radius: 5px;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: fit-content;
}

.no-image-warn {
    color: #a16207;
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

    .mastery-requirements {
        width: 100%;
    }

    .info-box {
        width: fit-content;
        height: auto;
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
