<script>
import ShowSkill from '../components/ShowSkill.vue';
// Import the store.
import { useSkillsStore } from '../../stores/SkillsStore';
import { useUsersStore } from '../../stores/UsersStore';
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            skillsStore,
            userDetailsStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.id,
            bannerImage: null
        };
    },
    async mounted() {
        // Call the API to get list of skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }

        // Find the correct skill path (first ancestor skill), and level, to choose the banner img file.
        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillId == this.skillsStore.skillsList[i].id) {
                this.bannerImage = this.skillsStore.skillsList[i].banner_image;
            }
        }
    },
    components: {
        ShowSkill
    }
};
</script>

<template>
    <div id="banner">
        <!--TODO: Assign banner dynamically -->
        <img v-bind:src="bannerImage" class="img-fluid" />
        <!-- Show a static img if skill have no banner image -->
        <img
            v-if="!bannerImage"
            src="/images/banners/institute-collins-2.png"
            class="img-fluid"
        />
    </div>
    <div class="container">
        <!-- Comment below code for now until I figured out what to with INSTRUCTOR ROLE -->
        <!-- <div v-if="userDetailsStore.role == 'student'" id="btn-row">
            <button id="assessment-btn" class="btn purple-btn">
                Take Assessment
            </button>
            <button class="btn purple-btn">Schedule Assessment</button>
        </div> -->
    </div>
    <ShowSkill />
</template>

<style>
#banner img {
    max-height: 200px;
}
/* some over ride bootstrap css */
.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.top-btn:hover {
    background-color: #7f56d9;
}

#btn-row {
    padding-top: 21px;
    display: flex;
    flex-direction: row;
    justify-content: end;
    width: 100%;
}

#assessment-btn {
    margin-right: 15px;
}

/* View Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    #btn-row {
        padding-top: 21px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        width: 100%;
        gap: 10px;
    }

    #assessment-btn {
        margin-right: 0px;
    }
}
</style>
