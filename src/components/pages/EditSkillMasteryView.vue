<script>
// Import the users store.
import { useUsersStore } from '../../stores/UsersStore'
import { useSkillsStore } from '../../stores/SkillsStore.js';

export default {
    setup() {
        const usersStore = useUsersStore();
        const skillsStore = useSkillsStore();

        return {
            usersStore, skillsStore
        }
    },
    data() {
        return {
            user: {
                id: null,
                username: null,
                avatar: null,
            }
        }
    },
    async created() {
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList()
        }
        if (this.usersStore.users.length < 1)
            await this.usersStore.getUsers()

        this.user.id = this.usersStore.users[0].id;
        this.user.username = this.usersStore.users[0].username;
        this.user.avatar = this.usersStore.users[0].avatar;
    }
}
</script>

<template>
    <div id="edit-skill-mastery" class="container mt-3">
        <div class="row">
            <div class="col-6 d-flex flex-column">
                <img class="avatar" :src="this.user.avatar">
            </div>
            <div class="col-6">
                <div class="mb-3">
                    <label class="form-label">Student Name:</label>
                    <input class="form-control" type="text" v-model="this.user.username" disabled>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="mb-3">
                <select class="form-select">
                    <option v-for="skill in this.skillsStore.skillsList" :value="skill.id">
                        {{ skill.name }}
                    </option>
                </select>
            </div>
            <div class="form-check col-4">
                <input class="form-check-input" type="radio" name="nodeType" id="regularSkillRadio" value="regular">
                <label class="form-check-label" for="regularSkillRadio">
                    Unlocked
                </label>
            </div>
            <div class="form-check col-4">
                <input class="form-check-input" type="radio" name="nodeType" id="superSkillRadio" value="super">
                <label class="form-check-label" for="superSkillRadio">
                    Mastered
                </label>
            </div>
            <button class="btn purple-btn">Submit</button>


        </div>
        <p>&nbsp;</p>
        <hr />
    </div>
</template>
  
<style>
#edit-skill-mastery {
    background-color: #E4ECF4;
    border-radius: 12px;
}

.purple-btn {
    background-color: #A48BE6;
    color: white;
    border: 1px solid #7F56D9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.avatar {
    max-width: 200px;
}
</style>
  