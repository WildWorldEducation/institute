<script>
import { useUsersStore } from '../../../../stores/UsersStore';

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
            activeList: 'skills'
        };
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
        <h1 class="ps-3">Users Edit Content List</h1>
        <!-- Nav List On Desktop -->
        <div class="d-none d-md-flex nav-list-container gap-4 ps-3">
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
        <!-- Skill edits List -->
        <div v-if="activeList === 'skills'">
            <h3>Skills</h3>
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
            <h3>Multiple Choice Questions</h3>
            <ul>
                <li v-for="mcQuestionEdit in mcQuestionEdits">
                    <router-link
                        :to="
                            '/content-edit/' +
                            mcQuestionEdit.mc_question_id +
                            '/' +
                            mcQuestionEdit.user_id +
                            '/comparison?type=mcquestion'
                        "
                        >User: {{ mcQuestionEdit.userName }}, Question:
                        {{ mcQuestionEdit.mc_question_id }}, Date:
                        {{ mcQuestionEdit.date }}</router-link
                    >
                </li>
            </ul>
        </div>
        <!-- Written question edits list -->
        <div v-if="activeList === 'writtenQuestions'">
            <h3>Written Questions</h3>
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

.nav-list-container {
    padding-top: 15px;
    padding-bottom: 15px;
    border-top: 1px solid grey;
    border-bottom: 1px solid grey;
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
</style>
