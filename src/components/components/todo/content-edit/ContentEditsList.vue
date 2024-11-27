<script>
import { useUsersStore } from '../../../../stores/UsersStore';
import { useUserDetailsStore } from '../../../../stores/UserDetailsStore';
import McQuestionsEditList from './McQuestionsEditList.vue';
import SkillEditsList from './SkillEditsList.vue';
import WrittenQuestionEditsList from './WrittenQuestionEditsList.vue';
import ImageQuestionEditsList from './ImageQuestionEditsList.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userDetailsStore = useUserDetailsStore();

        return {
            usersStore,
            userDetailsStore
        };
    },
    props: ['settingStore'],
    data() {
        return {
            skillEdits: [],
            mcQuestionEdits: [],
            essayQuestionEdits: [],
            imageQuestionEdits: [],
            activeList: 'skills',
            showDropDown: false,
            // Flag to pass to child list for loading indicate
            skillEditsLoading: true,
            mcQuestionEditsLoading: true,
            essayQuestionEditsLoading: true,
            imageQuestionEditsLoading: true,
            mobileNavCurrentLabel: 'skills'
        };
    },
    components: {
        McQuestionsEditList,
        SkillEditsList,
        WrittenQuestionEditsList,
        ImageQuestionEditsList
    },
    async created() {
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
        await this.getSkillEditsSubmittedForReview();
        await this.getMCQuestionEditsSubmittedForReview();
        await this.getEssayQuestionEditsSubmittedForReview();
        await this.getImageQuestionsSubmittedForReview();
        // Get navigation state from URL
        const list = this.$route.query.list;
        if (list) {
            this.activeList = list;
        }
    },
    methods: {
        // Get the skill edits that have been submitted for review.
        async getSkillEditsSubmittedForReview() {
            await fetch('/skills/submitted-for-review/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = this.formatDate(data[i].date);
                        data[i].userName = this.findUserName(data[i].user_id);
                        this.skillEdits.push(data[i]);
                    }
                    this.skillEditsLoading = false;
                });
        },
        // Get the multiple choice question edits that have been submitted for review.
        async getMCQuestionEditsSubmittedForReview() {
            await fetch('/questions/mc/submitted-for-review/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = this.formatDate(data[i].date);
                        data[i].userName = this.findUserName(data[i].user_id);
                        this.mcQuestionEdits.push(data[i]);
                    }
                    this.mcQuestionEditsLoading = false;
                });
        },
        // Get the essay question edits that have been submitted for review.
        async getEssayQuestionEditsSubmittedForReview() {
            await fetch('/questions/essay/submitted-for-review/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = this.formatDate(data[i].date);
                        data[i].userName = this.findUserName(data[i].user_id);
                        this.essayQuestionEdits.push(data[i]);
                    }
                    this.essayQuestionEditsLoading = false;
                });
        },

        // Get image question edits that have been submitted for review
        async getImageQuestionsSubmittedForReview() {
            await fetch('/questions/image-question/submitted-for-review/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    for (let i = 0; i < data.length; i++) {
                        data[i].date = this.formatDate(data[i].date);
                        data[i].userName = this.findUserName(data[i].user_id);
                        this.imageQuestionEdits.push(data[i]);
                    }

                    this.imageQuestionEditsLoading = false;
                });
        },

        formatDate(unformattedDate) {
            // Prep the date and time data ---------------
            // Split timestamp into [ Y, M, D, h, m, s ]
            var date = unformattedDate.replace('T', ' ');
            date = date.replace('Z', ' ');
            let newDate = date.split(/[- :]/);
            // Apply each element to the Date function
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
            finalDate = finalDate.toLocaleDateString('en-US', options);
            return finalDate;
        },
        findUserName(userId) {
            var userName = '';
            for (let i = 0; i < this.usersStore.users.length; i++) {
                if (this.usersStore.users[i].id == userId) {
                    userName = this.usersStore.users[i].username;
                }
            }
            return userName;
        },
        handleDropDownNavChoose(value) {
            // Prettify the value to show
            const result = value.replace(/([A-Z])/g, ' $1');
            const finalResult =
                result.charAt(0).toUpperCase() + result.slice(1);
            this.mobileNavCurrentLabel = finalResult;
            this.activeList = value;
            this.showDropDown = false;
            this.$router.push({ query: { list: value, nav: 'editList' } });
        }
    }
};
</script>

<template>
    <div class="w-100">
        <!-- Banner -->
        <!-- <div id="banner">
            <img
                v-if="userDetailsStore.theme == 'apprentice'"
                src="/images/banners/themes/apprentice/banner-2.png"
                class="img-fluid"
            />
            <img
                v-else
                src="/images/banners/themes/scholar/banner-2.png"
                class="img-fluid"
            />
        </div> -->
        <!-- Page tile -->
        <h2 class="ps-3 mt-2 page-title">Approve Content Edits</h2>
        <!-- ---- | Nav List On Desktop | ---- -->
        <div class="d-none d-lg-flex desktop-nav-bar gap-4 px-3">
            <button
                :class="[activeList === 'skills' ? 'active-nav' : 'normal-nav']"
                @click="handleDropDownNavChoose('skills')"
            >
                Skills
            </button>
            <button
                :class="[
                    activeList === 'mcQuestions' ? 'active-nav' : 'normal-nav'
                ]"
                @click="handleDropDownNavChoose('mcQuestions')"
            >
                Multiple Choice Questions
            </button>
            <button
                :class="[
                    activeList === 'writtenQuestions'
                        ? 'active-nav'
                        : 'normal-nav'
                ]"
                @click="handleDropDownNavChoose('writtenQuestions')"
            >
                Essay Questions
            </button>
            <button
                :class="[
                    activeList === 'imageQuestions'
                        ? 'active-nav'
                        : 'normal-nav'
                ]"
                @click="handleDropDownNavChoose('imageQuestions')"
            >
                Image Questions
            </button>
        </div>
        <!-- ---- | Nav List On Mobile | ---- -->
        <!-- Custom Dropdown -->
        <div class="d-flex d-lg-none flex-column mobile-nav-bar">
            <div
                :class="[
                    'text-capitalize',
                    showDropDown
                        ? 'custom-select-button-focus'
                        : 'custom-select-button'
                ]"
                @click="showDropDown = !showDropDown"
            >
                {{ mobileNavCurrentLabel }}
                <span>
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M14.2929 8.70711C14.9229 8.07714 14.4767 7 13.5858 7H6.41421C5.52331 7 5.07714 8.07714 5.70711 8.70711L9.29289 12.2929C9.68342 12.6834 10.3166 12.6834 10.7071 12.2929L14.2929 8.70711Z"
                            fill="#344054"
                        />
                    </svg>
                </span>
            </div>
            <div v-if="showDropDown" class="custom-dropdown-base">
                <div
                    class="custom-dropdown-option"
                    @click="handleDropDownNavChoose('skills')"
                >
                    Skills
                </div>
                <div
                    class="custom-dropdown-option"
                    @click="handleDropDownNavChoose('mcQuestions')"
                >
                    Multiple Choice Questions
                </div>
                <div
                    class="custom-dropdown-option"
                    @click="handleDropDownNavChoose('writtenQuestions')"
                >
                    Essay Questions
                </div>
                <div
                    class="custom-dropdown-option"
                    @click="handleDropDownNavChoose('imageQuestions')"
                >
                    Image Questions
                </div>
            </div>
        </div>
        <!-- End of custom dropdown -->
        <div class="h-100">
            <!-- Skill edits List -->
            <div v-if="activeList === 'skills'">
                <SkillEditsList
                    :skillsEditList="skillEdits"
                    :skillEditsLoading="skillEditsLoading"
                    :settingStore="settingStore"
                />
            </div>
            <!-- MC question edits list -->
            <div v-if="activeList === 'mcQuestions'">
                <McQuestionsEditList
                    :mcQuestionList="mcQuestionEdits"
                    :mcQuestionEditsLoading="mcQuestionEditsLoading"
                    :settingStore="settingStore"
                />
            </div>
            <!-- Essay question edits list -->
            <div v-if="activeList === 'writtenQuestions'">
                <WrittenQuestionEditsList
                    :writtenEditsList="essayQuestionEdits"
                    :essayQuestionEditsLoading="essayQuestionEditsLoading"
                    :settingStore="settingStore"
                />
            </div>
            <!-- Image question edits list -->
            <div v-if="activeList === 'imageQuestions'">
                <ImageQuestionEditsList
                    :imageQuestionEditsList="imageQuestionEdits"
                    :imageQuestionEditsLoading="imageQuestionEditsLoading"
                    :settingStore="settingStore"
                />
            </div>
        </div>
    </div>
</template>

<style scoped>
#banner {
    width: 100%;
    height: fit-content;
}

.page-title {
    color: #9c7eec;
    font-size: 30px;
    font-weight: 600;
}

.desktop-nav-bar {
    padding-top: 15px;
    padding-bottom: 15px;
    border: 1px solid #e0e0e0;
    width: fit-content;
    border-radius: 5px;
    margin-left: 15px;
}

.normal-nav {
    background-color: white;
    padding: 5px 20px;
    cursor: pointer;
    font-weight: 600;
    color: grey;
    border: none;
    border-radius: 8px;
}

.normal-nav:focus {
    outline: none;
    border: 1px solid #9c7eec;
}

.active-nav {
    background-color: #8666ca;
    border: 1px solid grey;
    border-radius: 5px;
    color: white;
    font-weight: 600;
    padding: 5px 20px;
}

.active-nav:focus {
    outline: solid 2px #4a3091;
}

/* Style For The Custom Select */
.custom-select-button {
    width: 200px;
    height: auto;
    padding: 6px 14px 6px 14px;
    border-radius: 8px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    border: 1px solid #cbccce;
    box-shadow: 0px 1px 2px 0px #1018280d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 600;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    display: flex;
    color: #8666ca;
}

.custom-select-button-focus {
    width: 200px;
    height: auto;
    padding: 6px 14px 6px 14px;
    border-radius: 8px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    border: 1px solid #9c7eec;
    box-shadow: 0px 0px 0px 4px #bca3ff4d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 600;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    display: flex;
    color: #8666ca;
}

.custom-select-button:hover {
    cursor: pointer;
    border: 1px solid #9c7eec;
}

.custom-select-button > span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotationBack 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.custom-select-button-focus > span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotation 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}

.filter-label {
    color: #888;
    font-size: 16px;
    font-weight: 400;
    margin-top: 15px;
}

.date-label {
    width: 120px;
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

.custom-select-button-focus:hover {
    cursor: pointer;
}

.custom-dropdown-base {
    border-radius: 8px;
    border: 1px;
    background: linear-gradient(0deg, #ffffff, #ffffff);
    border: 1px solid #9c7eec;
    box-shadow: 0px 4px 6px -2px #10182808;
    box-shadow: 0px 12px 16px -4px #10182814;
    width: 200px;
}

.custom-dropdown-option {
    padding: 10px 14px 10px 14px;
    gap: 8px;
    color: grey;
    font-size: 14px;
    font-weight: 600;
}

.custom-dropdown-option:hover {
    cursor: pointer;
    background: #bca3ff1a;
}

:deep(.cell-link) {
    text-decoration: none;
    color: inherit;
}

:deep(.cell-link:focus) {
    border: 1px #8f7bd6 solid;
    border-color: #4523be !important;
    border-radius: 5px;
    outline: none;
}

/* End of CSS style for Custom Select */

/* View Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    .mobile-nav-bar {
        margin-left: 15px;
        margin-top: 10px;
    }
}

/* View Specific on Tablet */
@media (min-width: 577px) and (max-width: 1380px) {
    .mobile-nav-bar {
        margin-left: 15px;
        margin-top: 10px;
    }
}
</style>
