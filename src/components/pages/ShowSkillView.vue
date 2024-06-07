<script>
import ShowSkill from '../components/ShowSkill.vue';
// Import the store.
import { useSkillsStore } from '../../stores/SkillsStore';
import { useUsersStore } from '../../stores/UsersStore';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const userDetailsStore = useUsersStore();
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
    <div class="position-relative d-flex">
        <div class="container show-skill-ctnr">
            <div v-if="userDetailsStore.role == 'student'" id="btn-row">
                <!-- TODO: ADD FUNCTION TO BTN -->
                <button id="assessment-btn" class="top-btn d-none d-md-block">
                    Take Assessment
                </button>
                <button class="top-btn">Schedule Assessment</button>
            </div>
            <ShowSkill />
        </div>
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
    </div>
</template>

<style scoped>
/* some override bootstrap css */
.show-skill-ctnr {
    z-index: 10 !important;
    width: 100%;
    margin-top: 40px;
}

#banner {
    z-index: -10 !important;
    top: 0px;
    position: absolute !important;
    width: 100%;
}

.img-fluid {
    width: 100% !important;
}

.top-btn {
    width: 190px;
    height: auto;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
    border-radius: 8px;
    border-color: #7f56d9;
    border-width: 1px;
    background-color: #a48be6;
    color: white;
    font-size: 1rem;
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
        flex-direction: row;
        justify-content: center;
        width: 100%;
    }
}
</style>
