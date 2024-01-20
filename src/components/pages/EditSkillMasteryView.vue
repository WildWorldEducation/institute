<script>
// Import the users store.
import { useUsersStore } from '../../stores/UsersStore';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useUserSkillsStore } from '../../stores/UserSkillsStore';

export default {
    setup() {
        const usersStore = useUsersStore();
        const skillsStore = useSkillsStore();
        const userSkillsStore = useUserSkillsStore();
        return {
            usersStore,
            skillsStore,
            userSkillsStore,
        };
    },
    data() {
        return {
            user: {
                id: null,
                username: null,
                avatar: null,
            },
            inputText: '',
            suggestSkills: [],
            selectedSkillId: null,
            checkUnlock: false,
            checkMastered: false,
        };
    },
    async created() {
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
        const chooseUserId = this.$route.params.id;
        // Search for user info in users store
        this.usersStore.users.forEach((user) => {
            if (user.id == chooseUserId) {
                this.user.id = user.id;
                this.user.username = user.username;
                this.user.avatar = user.avatar;
            }
        });
    },
    methods: {
        getReferenceSkill() {
            // Only show the suggestion if the user type in 2 word
            if (this.inputText.length < 2) {
                this.suggestSkills = [];
            } else {
                this.suggestSkills = this.skillsStore.skillsList.filter((skill) => {
                    // Lower case so the result wont be case sensitive
                    return skill.name
                        .toLowerCase()
                        .includes(this.inputText.toLowerCase());
                });
            }
        },

        handleChooseSuggestSkill(skill) {
            this.inputText = skill.name;
            this.selectedSkillId = skill.id;
            this.suggestSkills = [];
        },

        handleSubmitForm() {
            // call method in user skill store base on form check state
            this.checkUnlock &&
                this.userSkillsStore.MakeAccessible(this.user.id, this.selectedSkillId);
            this.checkMastered &&
                this.userSkillsStore.MakeMastered(this.user.id, this.selectedSkillId);
            alert('your action is submitted');
        },
    },
};
</script>

<template>
    <div id="banner">
        <img src="/images/banners/edit-mastery-skill-banner.png" class="image-fluid" />
    </div>
    <div id="main-container" class="container">
        <!-- Header Section -->
        <div class="row">
            <div class="col-10 d-flex align-items-end">
                <h2 id="header-tile">Edit Skill Mastery</h2>
                <img src="/images/recurso-69.png" id="header-icon" />
            </div>
        </div>
        <!-- Skill Mastery Info Container -->
        <div id="edit-skill-mastery" class="container-fluid mt-5 p-3 p-xl-5 pt-5">
            <div class="row">
                <div class="col-12 col-md-4 col-xl-2 d-flex align-content-center">
                    <img class="avatar" :src="this.user.avatar" />
                </div>
                <div class="col-12 col-md-6 col-xl-3 mt-5 mt-xl-0">
                    <div class="mb-3" id="student-form-name">
                        <label class="form-label">Student Name:</label>
                        <input class="form-control" type="text" v-model="this.user.username" disabled />
                    </div>
                </div>
            </div>
            <div class="row mt-3 mt-md-4 mt-xl-5">
                <div class="col col-md-10 col-xl-5 mb-3 mt-md-3 mt-xl-5 position-relative">
                    <input id="skill-input" v-model="inputText" @input="getReferenceSkill" placeholder="type skill name" />
                    <div v-if="suggestSkills.length > 0" id="suggest-skills" class="flex flex-column position-absolute">
                        <div class="suggest-option" v-for="skill in suggestSkills" @click="handleChooseSuggestSkill(skill)">
                            {{ skill.name }}
                        </div>
                    </div>
                </div>
            </div>
            <div class="row mt-2">
                <div class="col col-md-10 col-xl-5 row pe-0">
                    <!-- <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="nodeType"
              id="regularSkillRadio"
              value="regular"
            />
            <label class="form-check-label" for="regularSkillRadio">
              Unlocked
            </label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="nodeType"
              id="superSkillRadio"
              value="super"
            />
            <label class="form-check-label" for="superSkillRadio">
              Mastered
            </label>
          </div> -->
                    <div class="col">
                        <label class="control control-checkbox">
                            <span class="my-auto mx-2 me-4">Unlocked</span>
                            <input type="checkbox" name="nodeType" id="regularSkillRadio" value="regular"
                                v-model="checkUnlock" />
                            <div class="control_indicator"></div>
                        </label>
                    </div>
                    <div class="col">
                        <label class="control control-checkbox">
                            <span class="my-auto mx-2">Mastered</span>
                            <input type="checkbox" name="nodeType" id="superSkillRadio" value="super"
                                v-model="checkMastered" />
                            <div class="control_indicator"></div>
                        </label>
                    </div>
                    <div class="col pe-0">
                        <button id="submit-btn" class="btn purple-btn" @click="handleSubmitForm">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
            <p>&nbsp;</p>
        </div>
        <hr class="mt-3 mb-5 d-none d-md-block" />
    </div>
</template>

<style scoped>
input:focus {
    outline: none;
}

#edit-skill-mastery {
    background-color: #e4ecf4;
    border-radius: 12px;
}

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
}

.avatar {
    max-width: 250px;
    width: 157px;
    height: 157px;
    border-radius: 12px;
    border: 1px solid #9c7eec;
    margin-left: auto;
    margin-right: auto;
}

#main-container {
    display: flex;
    flex-direction: column;
    padding: 10px 15px;
    margin-top: 50px !important;
}

#banner {
    width: 100%;
}

#banner>img {
    width: 100%;
    height: auto;
}

#skill-input {
    width: 100%;
    height: 42px;
    padding: 20px, 14px, 10px, 14px;
    padding-left: 20px;
    border-radius: 8px;
    border: 1px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    color: #667085;
    box-shadow: 0px 1px 2px 0px #1018280d;
    font-family: 'Poppins' sans-serif;
}

#suggest-skills {
    z-index: 10;
    width: 95.5%;
    margin-right: 0px;
    margin-left: auto;
    border-radius: 6.63px;
    border: 0.83px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #65e0a5, #65e0a5);
    border: 1px solid #f2f4f7;
    border: 0.83px solid #65e0a5;
    box-shadow: 0px 3.317408561706543px 4.9761128425598145px -1.6587042808532715px #10182808;
    box-shadow: 0px 9.952225685119629px 13.269634246826172px -3.317408561706543px #10182814;
}

.suggest-option {
    height: 36.59px;
    padding: 8.29px 11px 8px 12px;
    gap: 6.63px;
    color: #344054;
}

.suggest-option:hover {
    background: #65e0a51a;
    cursor: pointer;
}

#header-tile {
    color: #667085;
    font-family: 'Poppins' sans-serif;
    font-size: 2.375rem;
    font-weight: 900;
    line-height: 41px;
    letter-spacing: 0em;
    text-align: left;
    margin-top: auto;
    margin-bottom: 0px;
}

#header-icon {
    margin-left: 10px;
    width: 108px;
    height: 61px;
}

#student-form-name>label {
    color: #344054;
    font-family: Poppins;
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0em;
    text-align: left;
}

#student-form-name>input {
    box-shadow: 0px 1px 2px 0px #1018280d;
    border: 1px solid #f2f4f7;
    background: #fcfcfd !important;
}

#submit-btn {
    margin-left: auto;
    margin-right: 0px;
}

/* A lot of CSS to styling two check box */
.control {
    font-family: 'Poppins' sans-serif;
    display: block;
    position: relative;
    padding-left: 30px;
    margin-bottom: 5px;
    padding-top: 3px;
    cursor: pointer;
}

.control>span {
    font-weight: 500;
    font-size: 0.938rem;
    color: #667085;
    text-align: center;
}

.control input {
    position: absolute;
    z-index: -1;
    opacity: 0;
}

.control_indicator {
    position: absolute;
    top: 2px;
    left: 0;
    height: 29.09px;
    width: 29.09px;
    background: #f9f5ff;
    border: 1.45px solid #9c7eec;
    border-radius: 8.73px;
}

.control:hover input~.control_indicator,
.control input:focus~.control_indicator {
    background: #e7ddf6;
}

.control input:checked~.control_indicator {
    background: #f9f5ff;
}

.control:hover input:not([disabled]):checked~.control_indicator,
.control input:checked:focus~.control_indicator {
    background: #f9f5ff;
}

.control input:disabled~.control_indicator {
    background: #e6e6e6;
    opacity: 0.6;
    pointer-events: none;
}

.control_indicator:after {
    box-sizing: unset;
    content: '';
    position: absolute;
    display: none;
}

.control input:checked~.control_indicator:after {
    display: block;
}

.control-checkbox .control_indicator:after {
    left: 4px;
    top: 5px;
    width: 13.58px;
    height: 9.33px;
    border: solid #9c7eec;
    border-width: 0px 0px 2.9px 2.9px;
    transform: rotate(-45deg);
}

.control-checkbox input:disabled~.control_indicator:after {
    border-color: #7b7b7b;
}

.control-checkbox .control_indicator::before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 4.5rem;
    height: 4.5rem;
    margin-left: -1.3rem;
    margin-top: -1.3rem;
    background: #9c7eec;
    border-radius: 3rem;
    opacity: 0.6;
    z-index: 99999;
    transform: scale(0);
}

@keyframes s-ripple {
    0% {
        transform: scale(0);
    }

    20% {
        transform: scale(1);
    }

    100% {
        opacity: 0;
        transform: scale(1);
    }
}

@keyframes s-ripple-dup {
    0% {
        transform: scale(0);
    }

    30% {
        transform: scale(1);
    }

    60% {
        transform: scale(1);
    }

    100% {
        opacity: 0;
        transform: scale(1);
    }
}

.control-checkbox input+.control_indicator::before {
    animation: s-ripple 250ms ease-out;
}

.control-checkbox input:checked+.control_indicator::before {
    animation-name: s-ripple-dup;
}

@media (min-width: 768px) and (max-width: 1025px) {
    .avatar {
        margin-left: 0px;
        margin-right: 0px;
        width: 100%;
        height: auto;
    }

    #suggest-skills {
        width: 96%;
    }
}

/* CSS Specific for phone view */
@media (max-width: 767px) {
    #submit-btn {
        margin-left: auto;
        margin-right: auto;
        margin-top: 40px;
    }

    #suggest-skills {
        width: 93%;
    }
}
</style>