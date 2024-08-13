<script>
import { useUsersStore } from '../../../../stores/UsersStore';
import McQuestionsEditList from './McQuestionsEditList.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        return {
            usersStore
        };
    },
    data() {
        return {
            skillEdits: [],
            mcQuestionEdits: [],
            essayQuestionEdits: [],
            activeList: 'skills',
            showDropDown: false
        };
    },
    components: {
        McQuestionsEditList
    },
    async created() {
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
        await this.getSkillEditsSubmittedForReview();
        await this.getMCQuestionEditsSubmittedForReview();
        await this.getEssayQuestionEditsSubmittedForReview();
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
                        console.log(this.essayQuestionEdits);
                    }
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
            this.activeList = value;
            this.showDropDown = false;
        }
    }
};
</script>

<template>
    <div class="content-edit-page">
        <!-- Banner -->
        <div id="banner">
            <img src="/images/banners/general-banner.png" class="img-fluid" />
        </div>
        <!-- Page tile -->
        <div class="ps-3 page-tile">User Edit Content List</div>
        <!-- ---- | Nav List On Desktop | ---- -->
        <div class="d-none d-lg-flex desktop-nav-bar gap-4 px-3">
            <div
                :class="[activeList === 'skills' ? 'active-nav' : 'normal-nav']"
                @click="activeList = 'skills'"
            >
                Skills
            </div>
            <div
                :class="[
                    activeList === 'mcQuestions' ? 'active-nav' : 'normal-nav'
                ]"
                @click="activeList = 'mcQuestions'"
            >
                Multiple Choice Questions
            </div>
            <div
                :class="[
                    activeList === 'writtenQuestions'
                        ? 'active-nav'
                        : 'normal-nav'
                ]"
                @click="activeList = 'writtenQuestions'"
            >
                Written Questions
            </div>
        </div>
        <!-- ---- | Nav List On Mobile | ---- -->
        <!-- Custom Dropdown -->
        <div class="d-flex d-lg-none flex-column mobile-nav-bar">
            <div
                :class="[
                    showDropDown
                        ? 'custom-select-button-focus'
                        : 'custom-select-button'
                ]"
                @click="showDropDown = !showDropDown"
            >
                {{ activeList }}
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
                    skill
                </div>
                <div
                    class="custom-dropdown-option"
                    @click="handleDropDownNavChoose('mcQuestions')"
                >
                    Multiple choice question
                </div>
                <div
                    class="custom-dropdown-option"
                    @click="handleDropDownNavChoose('writtenQuestions')"
                >
                    Written Question
                </div>
            </div>
        </div>
        <!-- End of custom dropdown -->

        <!-- Skill edits List -->
        <div v-if="activeList === 'skills'">
            <ul>
                <li v-for="skillEdit in skillEdits">
                    <router-link
                        :to="
                            '/content-edit/' +
                            skillEdit.skill_id +
                            '/' +
                            skillEdit.user_id +
                            '/comparison?type=skill'
                        "
                        >User: {{ skillEdit.userName }}, Skill:
                        {{ skillEdit.skill_id }}, Date:
                        {{ skillEdit.date }}</router-link
                    >
                </li>
            </ul>
        </div>
        <!-- MC question edits list -->
        <div v-if="activeList === 'mcQuestions'">
            <McQuestionsEditList :mcQuestionList="mcQuestionEdits" />
        </div>
        <!-- Written question edits list -->
        <div v-if="activeList === 'writtenQuestions'">
            <ul>
                <li v-for="essayQuestionEdit in essayQuestionEdits">
                    <router-link
                        :to="
                            '/content-edit/' +
                            essayQuestionEdit.essay_question_id +
                            '/' +
                            essayQuestionEdit.user_id +
                            '/comparison?type=essayquestion'
                        "
                        >User: {{ essayQuestionEdit.userName }}, Question:
                        {{ essayQuestionEdit.essay_question_id }}, Date:
                        {{ essayQuestionEdit.date }}</router-link
                    >
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
#banner {
    width: 100%;
    height: fit-content;
}

.content-edit-page {
    min-width: 700px;
    overflow: auto;
}

.page-tile {
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
    background-color: inherit;
    padding: 5px 20px;
    cursor: pointer;
    font-weight: 600;
    color: grey;
}

.active-nav {
    background-color: #8666ca;
    border: 1px solid grey;
    border-radius: 5px;
    color: white;
    font-weight: 600;
    padding: 5px 20px;
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

/* End of CSS style for Custom Select */

/* View Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    .mobile-nav-bar {
        margin-left: 15px;
        margin-top: 10px;
    }
}
</style>
