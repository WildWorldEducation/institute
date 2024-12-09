<script>
import { RouterLink } from 'vue-router';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useUsersStore } from '../../stores/UsersStore.js';
import ApproveNewSkillModal from '../components/newSkillDetails/modals/ApproveNewSkillModal.vue';
import DismissModal from '../components/newSkillDetails/modals/DismissModal.vue';
import WaitLoadingModal from '../components/share-components/WaitLoadingModal.vue';
import SuccessModal from '../components/share-components/SuccessModal.vue';
import FailsModal from '../components/share-components/FailsModal.vue';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const usersStore = useUsersStore();

        return {
            skillsStore,
            usersStore
        };
    },
    data() {
        return {
            id: this.$route.params.id,
            newSkillAwaitingApproval: {},
            showApproveModal: false,
            showDisMissModal: false,
            severLoading: false,
            showSuccessModal: false,
            showFailsModal: false,
            message: ''
        };
    },
    async created() {
        if (this.skillsStore.skillsList.length == 0)
            await this.skillsStore.getSkillsList();
        if (this.usersStore.users.length == 0) await this.usersStore.getUsers();

        this.getNewSkillAwaitingApproval();
    },
    components: {
        ApproveNewSkillModal,
        DismissModal,
        WaitLoadingModal,
        SuccessModal,
        FailsModal
    },
    methods: {
        async getNewSkillAwaitingApproval() {
            await fetch('/new-skills-awaiting-approval/show/' + this.id)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.newSkillAwaitingApproval = data;
                    // Change wording for type.
                    if (this.newSkillAwaitingApproval.type == 'domain') {
                        this.newSkillAwaitingApproval.type = 'category';
                    }
                    // Get parent name.
                    for (
                        let i = 0;
                        i < this.skillsStore.skillsList.length;
                        i++
                    ) {
                        if (
                            this.skillsStore.skillsList[i].id ==
                            this.newSkillAwaitingApproval.parent
                        ) {
                            this.newSkillAwaitingApproval.parentName =
                                this.skillsStore.skillsList[i].name;
                            this.newSkillAwaitingApproval.parentUrl =
                                this.skillsStore.skillsList[i].url;
                        }
                    }
                    // Get user's name.
                    for (let i = 0; i < this.usersStore.users.length; i++) {
                        if (
                            this.usersStore.users[i].id ==
                            this.newSkillAwaitingApproval.user_id
                        ) {
                            this.newSkillAwaitingApproval.userName =
                                this.usersStore.users[i].username;
                        }
                    }
                });
        },
        dismissSkill() {
            const result = fetch(
                '/new-skills-awaiting-approval/' + this.id + '?action=dismiss',
                {
                    method: 'DELETE'
                }
            );

            if (result.error) {
                this.message = 'Failed to dismiss suggested skill';
                this.showFailsModal = true;
                return;
            }

            this.message = 'Successfully dismissed suggested skill';
            this.showSuccessModal = true;
        },
        approveSkill() {
            this.severLoading = true;
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.newSkillAwaitingApproval.name,
                    mastery_requirements:
                        this.newSkillAwaitingApproval.mastery_requirements,
                    icon_image: this.newSkillAwaitingApproval.icon_image,
                    type: this.newSkillAwaitingApproval.type,
                    level: this.newSkillAwaitingApproval.level
                })
            };

            var url = `/new-skills-awaiting-approval/accept/${this.newSkillAwaitingApproval.id}`;

            fetch(url, requestOptions).then((response) => {
                console.log('Fetched');
                if (response.error || response.status === 500) {
                    this.message = 'Failed to add new skill';
                    this.showFailsModal = true;
                }
                // Delete it afterwards.
                const result = fetch(
                    '/new-skills-awaiting-approval/' +
                        this.id +
                        '?action=approve',
                    {
                        method: 'DELETE'
                    }
                );

                if (result.error) {
                    console.err(result.error);
                    this.message =
                        'Failed to remove from list of suggested new skills';
                    this.showFailsModal = true;
                    return;
                }
                this.message = 'Successfully added skill';
                this.severLoading = false;
                this.showSuccessModal = true;
            });
        },
        handleSaveBtnClick() {
            this.showApproveModal = true;
        },
        hideApproveModal() {
            this.showApproveModal = false;
        },
        handleDisMissBtnClick() {
            this.showDisMissModal = true;
        },
        hideDismissModal() {
            this.showDisMissModal = false;
        },
        handleSuccessOKclick() {
            this.$router.push('/todo?nav=newSkillsList');
        },
        handleFailsOKclick() {
            this.showFailsModal = false;
        }
    }
};
</script>

<template>
    <div class="container mt-3">
        <div
            id="user-alert"
            b-on-hoover
            title="Click on the user name to see their user details"
        >
            <div>Submitted by</div>
            <RouterLink
                class="normal-text-link"
                :to="`/users?username=${newSkillAwaitingApproval.userName}`"
            >
                {{ newSkillAwaitingApproval.userName }}
            </RouterLink>
        </div>
    </div>
    <div class="container mt-3">
        <div id="skill-info-container">
            <!-- Name -->
            <div>
                <h1 class="heading">
                    {{ newSkillAwaitingApproval.name }}
                </h1>
                <!-- A line divide -->
                <hr class="border border-2 opacity-100 hr" />
            </div>
            <!-- Content -->
            <div class="row">
                <!-- Mastery Requirements -->
                <div
                    class="col-md-8 order-2 order-md-1 info-box"
                    v-if="newSkillAwaitingApproval.type != 'category'"
                >
                    <div class="d-flex flex-column">
                        <div class="mastery-requirements">
                            <div
                                v-html="
                                    newSkillAwaitingApproval.mastery_requirements
                                "
                            ></div>
                        </div>
                    </div>
                </div>
                <!-- Infobox -->
                <div class="col-md-4 order-1 order-md-2">
                    <div class="info-box p-2 mb-2">
                        <!-- feature image -->

                        <img
                            v-if="newSkillAwaitingApproval.icon_image"
                            :src="newSkillAwaitingApproval.icon_image"
                            class="rounded img-fluid"
                        />
                        <div
                            class="d-flex flex-column align-items-center"
                            v-else
                        >
                            <div class="no-image-warn">
                                This Skill Does Not Have Icon Image.
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
                        <!-- Parent -->
                        <div class="mt-3 d-flex flex-column align-items-center">
                            <h2 class="h4 heading">Parent</h2>
                            <RouterLink
                                b-on-hoover
                                title="Click on parent name to see it details"
                                class="normal-text-link"
                                :to="`/skills/${newSkillAwaitingApproval.parentUrl}`"
                            >
                                {{ newSkillAwaitingApproval.parentName }}
                            </RouterLink>
                        </div>
                        <!-- Type -->
                        <div class="mt-3 d-flex flex-column align-items-center">
                            <h2 class="h4 heading">Type</h2>
                            <div>
                                {{ newSkillAwaitingApproval.type }}
                            </div>
                        </div>
                        <!-- Grade level -->
                        <div
                            class="mt-3 d-flex flex-column align-items-center"
                            v-if="newSkillAwaitingApproval.type != 'category'"
                        >
                            <h2 class="h4 heading">Level</h2>
                            <!-- <div class="h1-title">Level</div> -->
                            <span
                                v-if="
                                    newSkillAwaitingApproval.level ==
                                    'grade_school'
                                "
                                >Grade School</span
                            >
                            <span
                                v-else-if="
                                    newSkillAwaitingApproval.level ==
                                    'middle_school'
                                "
                                >Middle School</span
                            >
                            <span
                                v-else-if="
                                    newSkillAwaitingApproval.level ==
                                    'high_school'
                                "
                                >High School</span
                            >
                            <span
                                v-else-if="
                                    newSkillAwaitingApproval.level == 'college'
                                "
                                >College</span
                            >
                            <span
                                v-else-if="
                                    newSkillAwaitingApproval.level == 'phd'
                                "
                                >PHD</span
                            >
                        </div>
                    </div>
                </div>
            </div>
            <p>&nbsp;</p>
            <div class="d-flex justify-content-end gap-3">
                <button class="btn red-btn" @click="handleDisMissBtnClick">
                    Dismiss
                </button>
                <router-link
                    class="btn primary-btn"
                    :to="'/new-skill-awaiting-approval/edit/' + id"
                >
                    Edit
                </router-link>
                <button class="btn secondary-btn" @click="handleSaveBtnClick">
                    Approve
                </button>
            </div>
        </div>
    </div>
    <!-- Modals for better UX -->
    <ApproveNewSkillModal
        :showApproveModal="showApproveModal"
        :approveSkill="approveSkill"
        :closeModal="hideApproveModal"
    />
    <DismissModal
        :dismissSkill="dismissSkill"
        :closeDismissModal="hideDismissModal"
        :showDismissModal="showDisMissModal"
    />
    <WaitLoadingModal v-if="severLoading" />
    <SuccessModal
        v-if="showSuccessModal"
        :message="message"
        :handleOkClick="handleSuccessOKclick"
    />
    <FailsModal
        v-if="showFailsModal"
        :message="message"
        :handleOkClick="handleFailsOKclick"
    />
</template>

<style scoped>
.img-fluid {
    width: 100%;
}

.info-box {
    border-radius: 5px;
    color: black;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.normal-text-link {
    text-decoration: none;
    color: inherit;
    margin-left: 5px;
}

.normal-text-link:hover {
    cursor: pointer;
    text-decoration: underline;
}

.no-image-warn {
    color: #a16207;
}

.skill-name {
    font-family: 'Poppins', sans-serif;
    font-size: 40px;
    color: var(--primary-color);
    font-weight: 800;
    margin-bottom: 0px;
    text-align: start;
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

.hr {
    border-color: #aea3ce !important;
}

#skill-info-container {
    background-color: #f2edff;
    border-radius: 12px;
    padding: 30px;
}

#user-alert {
    display: flex;
    flex-wrap: wrap;
    background-color: #fef9c3;
    border-radius: 12px;
    padding: 15px 30px;
    width: fit-content;
    color: #ca8a04;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    display: flex;
    align-items: center;
    max-width: fit-content;
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

/* Specific phone view css */
@media (max-width: 576px) {
    h1 {
        font-size: 2.5rem;
    }

    #skill-info-container {
        background-color: #f2edffcc;
        border-radius: 12px;
        padding: 20px;
    }

    .mastery-requirements {
        width: 100%;
        margin-left: 0px;
        padding-left: 0px;
        padding-right: 0px;
    }

    .skill-name {
        margin-top: 5px;
        font-size: 25px;
        margin: 0px 5px;
    }

    .h1-title {
        font-size: 20px;
        margin-left: 4px;
    }
}

/* ************************* */
/* Tablet Styling */
@media (min-width: 577px) and (max-width: 1023px) {
    #skill-info-container {
        padding: 15px;
    }
}
</style>
