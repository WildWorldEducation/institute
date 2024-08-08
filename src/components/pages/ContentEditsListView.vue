<script>
import { useUsersStore } from '../../stores/UsersStore';

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
            essayQuestionEdits: []
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
    <div id="banner">
        <img src="/images/banners/general-banner.png" class="image-fluid" />
    </div>
    <div class="container">
        <div class="mt-4 mb-4">
            <h1 class="page-title">List of edits waiting for approval</h1>
            <!-- Nav bar  -->
            <div
                class="nav flex-column nav-pills me-3"
                id="v-pills-tab"
                role="tablist"
                aria-orientation="vertical"
            >
                <button
                    class="nav-link"
                    id="v-pills-home-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#v-pills-home"
                    type="button"
                    role="tab"
                    aria-controls="v-pills-home"
                    aria-selected="true"
                >
                    Home
                </button>
                <button
                    class="nav-link"
                    id="v-pills-profile-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#v-pills-profile"
                    type="button"
                    role="tab"
                    aria-controls="v-pills-profile"
                    aria-selected="false"
                >
                    Profile
                </button>
                <button
                    class="nav-link"
                    id="v-pills-messages-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#v-pills-messages"
                    type="button"
                    role="tab"
                    aria-controls="v-pills-messages"
                    aria-selected="false"
                >
                    Messages
                </button>
                <button
                    class="nav-link"
                    id="v-pills-settings-tab"
                    data-bs-toggle="pill"
                    data-bs-target="#v-pills-settings"
                    type="button"
                    role="tab"
                    aria-controls="v-pills-settings"
                    aria-selected="false"
                >
                    Settings
                </button>
            </div>
            <h2>Skills</h2>
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
            <h2>Multiple Choice Questions</h2>
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
            <h2>Written Questions</h2>
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

<style scope>
.page-title {
    color: #a48be7;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
}
</style>
