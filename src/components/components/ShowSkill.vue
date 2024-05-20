<script>
// Import the store.
import { useTagsStore } from '../../stores/TagsStore.js';
import { useSkillTagsStore } from '../../stores/SkillTagsStore.js';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useSkillTreeStore } from '../../stores/SkillTreeStore.js';
import { useUserSkillsStore } from '../../stores/UserSkillsStore.js';

// Nested component.
import Forum from './Forum.vue';

export default {
    setup() {
        const tagsStore = useTagsStore();
        const skillTagsStore = useSkillTagsStore();
        const userDetailsStore = useUserDetailsStore();
        const skillsStore = useSkillsStore();
        const skillTreeStore = useSkillTreeStore();
        const userSkillsStore = useUserSkillsStore();

        // If method hasnt been run before.
        if (tagsStore.tagsList.length == 0) {
            // Run the GET request.
            tagsStore.getTagsList();
        }

        return {
            tagsStore,
            skillTagsStore,
            userDetailsStore,
            skillsStore,
            skillTreeStore,
            userSkillsStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.id,
            skill: {},
            userSkills: [],
            isMastered: false,
            isUnlocked: false,
            filters: [],
            showModal: false,
            showThankModal: false
        };
    },
    components: {
        Forum
    },

    async created() {
        await this.getSkill();
        await this.getUserSkills();
    },
    methods: {
        getSkill() {
            fetch('/skills/show/' + this.skillId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => (this.skill = data))
                .then(() => {
                    // Load skill filters
                    this.getSkillFilters();

                    const icon = document.getElementsByTagName('svg');
                    if (icon.length > 0) {
                        icon[0].style.height = '50px';
                    }
                });
        },
        async getSkillFilters() {
            // Run the GET request.
            if (this.skillTagsStore.skillTagsList.length == 0)
                await this.skillTagsStore.getSkillTagsList();

            for (let i = 0; i < this.skillTagsStore.skillTagsList.length; i++) {
                if (
                    this.skillTagsStore.skillTagsList[i].skill_id ==
                    this.skillId
                ) {
                    this.filters.push(
                        this.skillTagsStore.skillTagsList[i].tag_id
                    );
                }
            }
        },
        getUserSkills() {
            fetch('/user-skills/unnested-list/' + this.userDetailsStore.userId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => (this.userSkills = data))
                .then(() => {
                    for (let i = 0; i < this.userSkills.length; i++) {
                        if (this.userSkills[i].id == this.skillId) {
                            if (this.userSkills[i].is_mastered == 1)
                                this.isMastered = true;
                            if (this.userSkills[i].is_accessible == 1)
                                this.isUnlocked = true;
                        }
                    }
                });
        },
        async MakeMastered() {
            await this.userSkillsStore.MakeMastered(
                this.userDetailsStore.userId,
                this.skillId
            );
            this.getUserSkills();
        },
        flagSkill() {
            console.log('user Id: ' + this.userDetailsStore.userId);
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content_type: 'skill',
                    content_id: this.skill.id,
                    user_id: this.userDetailsStore.userId
                })
            };
            var url = '/content-flags/add';
            fetch(url, requestOptions).then(() => {
                // Handle showing some modal after post content flags
                this.showModal = false;
                this.showThankModal = true;
            });
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <div
            id="skill-info-container"
            :class="{ domain: skill.type == 'domain' }"
        >
            <!-- Buttons For Student -->
            <div
                v-if="
                    isUnlocked &&
                    !isMastered &&
                    userDetailsStore.role == 'student'
                "
                class="row mt-3"
            >
                <div
                    class="d-flex flex-row-reverse align-items-end mb-2 mb-md-0"
                >
                    <!-- Unlock Skill Button -->
                    <button
                        v-if="skill.type == 'domain'"
                        @click="MakeMastered()"
                        class="btn purple-btn"
                    >
                        Click to unlock child skills
                    </button>
                    <!-- Take Assessment Button -->
                    <router-link
                        v-else
                        class="btn purple-btn"
                        :to="skillId + '/assessment'"
                        >Take Assessment</router-link
                    >
                </div>
            </div>
            <!-- Edit skill only available for Admin -->
            <div
                v-if="userDetailsStore.role == 'admin'"
                class="d-flex flex-row-reverse center-header pt-2"
            >
                <router-link
                    :to="'/skills/edit/' + skillId"
                    class="btn green-btn"
                    ><span>Edit</span>
                    <!-- Pencil icon -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="18"
                        height="20"
                        fill="white"
                        class="mb-1 ms-1 btn-icon"
                    >
                        <path
                            d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"
                        />
                    </svg>
                </router-link>
            </div>
            <!-- Skill Info Component -->
            <div class="d-flex flex-column gap-2">
                <!-- Skill image -->
                <div id="skill-image">
                    <!-- Show a default skill avatar if skill not have image yet -->
                    <img
                        :src="
                            skill.icon_image
                                ? skill.icon_image
                                : '/images/skill-avatar/recurso.png'
                        "
                        class="img-fluid"
                    />
                </div>
                <!-- Skill name and skill description -->
                <div class="d-flex flex-column">
                    <div class="skill-name">{{ skill.name }}</div>
                    <!-- Description only seen by admins -->
                    <div
                        v-if="userDetailsStore.role == 'admin'"
                        class="row pe-4 ps-4 ps-md-0 skill-description"
                    >
                        <p>{{ skill.description }}</p>
                    </div>
                </div>
            </div>
            <div v-if="skill.type != 'domain'">
                <!-- A line divide -->
                <div class="row">
                    <div class="col col-md-8 p-4 p-md-0">
                        <hr
                            id="hr-parent"
                            class="border border-2 opacity-100"
                        />
                    </div>
                </div>
                <!-- Level -->
                <div class="mt-3 d-flex flex-column">
                    <div class="h1-tile">Level</div>
                    <span v-if="skill.level == 'grade_school'"
                        >Grade School</span
                    >
                    <span v-else-if="skill.level == 'middle_school'"
                        >Middle School</span
                    >
                    <span v-else-if="skill.level == 'high_school'"
                        >High School</span
                    >
                    <span v-else-if="skill.level == 'college'">College</span>
                    <span v-else-if="skill.level == 'phd'">PHD</span>
                </div>
                <!-- Mastery Requirements -->
                <div class="mt-3 d-flex flex-column">
                    <div class="h1-tile">Mastery Requirements</div>
                    <div class="mastery-requirements">
                        <div v-html="skill.mastery_requirements"></div>
                    </div>
                </div>
                <div class="row mt-3 me-1">
                    <!-- Flag the skill button -->
                    <div class="d-flex flex-row-reverse">
                        <div
                            @click="showModal = true"
                            type="button"
                            class="me-1"
                            b-tooltip.hover
                            title="Report this skill to the admin if it has errors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                class="flag-icon"
                            >
                                <path
                                    fill="#8f7bd6"
                                    d="M64 32C64 14.3 49.7 0 32 0S0 14.3 0 32V64 368 480c0 17.7 14.3 32 32 32s32-14.3 32-32V352l64.3-16.1c41.1-10.3 84.6-5.5 122.5 13.4c44.2 22.1 95.5 24.8 141.7 7.4l34.7-13c12.5-4.7 20.8-16.6 20.8-30V66.1c0-23-24.2-38-44.8-27.7l-9.6 4.8c-46.3 23.2-100.8 23.2-147.1 0c-35.1-17.6-75.4-22-113.5-12.5L64 48V32z"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
            <!-- A line divide -->
            <div v-if="userDetailsStore.role == 'admin'">
                <div class="row">
                    <div class="col col-md-8 p-4 p-md-0">
                        <hr
                            id="hr-parent"
                            class="border border-2 opacity-100"
                        />
                    </div>
                </div>
                <!-- Filters -->
                <div class="row mt-3">
                    <div class="h1-tile">Filter</div>
                    <label
                        v-for="tag in tagsStore.tagsList"
                        class="control control-checkbox"
                    >
                        <span class="my-auto mx-2 me-4"> {{ tag.name }}</span>
                        <input
                            type="checkbox"
                            :value="tag.id"
                            v-model="filters"
                            disabled
                        />
                        <div class="control_indicator"></div>
                    </label>
                </div>
            </div>
            <!-- A line divide -->
            <div
                v-if="
                    userDetailsStore.role == 'admin' && skill.type != 'domain'
                "
            >
                <div class="row">
                    <div class="col col-md-8 p-4 p-md-0">
                        <hr
                            id="hr-parent"
                            class="border border-2 opacity-100"
                        />
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="h1-tile">Assessment</div>
                    <div class="col ms-1">
                        <router-link
                            v-if="skill.type != 'super'"
                            class="btn purple-btn mt-3 me-3"
                            :to="skillId + '/question-bank'"
                            >Question Bank&nbsp;&nbsp;
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
                                    fill="#FFFFFF"
                                />
                                <path
                                    d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
                                    fill="#FFFFFF"
                                />
                                <path
                                    d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
                                    fill="#FFFFFF"
                                />
                            </svg>
                        </router-link>
                        <span v-else
                            >This assessment will draw questions from its
                            cluster nodes' question banks.</span
                        >
                    </div>
                </div>
            </div>
        </div>
        <div v-if="skill.type != 'domain'">
            <div id="resource-hr">
                <hr class="border border-1 opacity-100" />
            </div>
            <div class="row mt-3 mb-3">
                <Forum />
            </div>
        </div>
        <p>&nbsp;</p>
    </div>
    <!-- The flagging Modal -->
    <div v-if="showModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
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
                    <p>Are you sure you want to flag this skill</p>
                </div>
                <div
                    class="d-flex justify-content-lg-between justify-content-md-end justify-content-between gap-2"
                >
                    <button
                        type="button"
                        class="btn red-btn modal-btn"
                        @click="showModal = false"
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
                        @click="flagSkill"
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
    <!-- Thanks You Modal After User Flagging -->
    <div v-if="showThankModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <div class="d-flex gap-4 text-center">
                    <p>
                        Thank you for flagging this skill. We will take a look
                        as soon as possible !!
                    </p>
                </div>
                <div class="d-flex justify-content-center">
                    <button
                        type="button"
                        class="btn green-btn w-25"
                        @click="showThankModal = false"
                    >
                        <span> OK </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.image-attribution-text {
    font-size: smaller;
}

.skill-name {
    font-family: 'Poppins', sans-serif;
    font-size: 40px;
    margin-top: -12px;
    color: #a48be6;
    font-weight: 800;
}

.skill-description {
    font-family: 'Poppins', sans-serif;
    color: #888;
}

.h1-tile {
    color: #a48be6;
    font-size: 30px;
    font-weight: 700;
    margin-bottom: 5px;
}

.mastery-requirements {
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: rgba(255, 255, 255, 0.692);
    border-radius: 5px;
    width: 98%;
}

#hr-parent {
    border-color: #aea3ce !important;
}

#resource-hr {
    margin-top: 46px;
    margin-bottom: 46px;
}

#skill-image {
    max-width: 600px;
}

#skill-info-container {
    background-color: #f2edffcc;
    border-radius: 12px;
    padding-top: 20px;
    padding-left: 48px;
    padding-bottom: 10px;
}

.domain {
    border-width: 4px;
    border-color: black;
    border-style: solid;
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

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.green-btn:hover {
    background-color: #3eb3a3;
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
}

.btn-icon {
    height: fit-content !important;
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
    width: 320px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}
/* End of Warning modal styling */

.flag-icon {
    height: 20px !important;
}

.modal-btn {
    width: 25%;
}

/* Specific phone view css */
@media (max-width: 576px) {
    img {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 50%;
    }

    h1,
    h2 {
        text-align: center;
    }

    h1 {
        font-size: 2.5rem;
        padding-left: 50px;
        padding-right: 50px;
    }

    #skill-info-container {
        background-color: #f2edffcc;
        border-radius: 12px;
        padding-top: 20px;
        padding-left: 0px;
        padding-right: 0px;
    }

    #skill-image {
        width: 75%;
        height: auto;
        margin: auto;
    }

    .mastery-requirements {
        width: 90%;
        margin-left: 20px;
    }

    .skill-name {
        margin-top: 5px;
        font-size: 25px;
        text-align: center;
        margin: 0px 5px;
    }

    .modal-content {
        margin-top: 100%;
        width: 90%;
    }

    .skill-description {
        font-size: 16px;
        text-align: center;
        margin-top: 5px;
    }

    .h1-tile {
        font-size: 20px;
        margin-left: 4px;
    }

    .modal-btn {
        width: fit-content;
    }
}

/* ************************* */
/* Tablet Styling */
@media (min-width: 577px) and (max-width: 1023px) {
    .modal-content {
        margin-top: 60%;
        width: 70%;
    }

    #skill-info-container {
        padding-left: 15px;
        padding-right: 15px;
    }

    .modal-btn {
        width: fit-content;
    }
}

/* h2 {
    color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
    font-size: 1.75rem;
} */
</style>
