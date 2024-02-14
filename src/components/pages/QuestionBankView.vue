<script>
import QuestionsBankQuestionList from '../components/QuestionsBankQuestionList.vue';
import { useSkillsStore } from '../../stores/SkillsStore.js';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        return {
            skillsStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.id,
            skillName: null,
            isMultipleChoice: true,
            isEssay: true
        };
    },
    async created() {
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }

        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillId == this.skillsStore.skillsList[i].id) {
                this.skillName = this.skillsStore.skillsList[i].name;
            }
        }
    },
    components: {
        QuestionsBankQuestionList
    }
};
</script>

<template>
    <div id="banner">
        <img src="/images/banners/general-banner.png" class="image-fluid" />
    </div>
    <!-- Purple Banner Row -->
    <div class="row" id="purple-banner">
        <div class="col d-flex">
            <router-link
                class="purple-btn btn"
                :to="'/skills/' + skillId + '/question-bank/add'"
            >
                Add &ThickSpace;
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    fill="white"
                    width="20"
                    height="20"
                >
                    <path
                        d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                    />
                </svg>
            </router-link>
        </div>
    </div>
    <div class="container mt-5">
        <!-- Tile Row  -->
        <div class="row mt-3">
            <div class="col">
                <h1>{{ skillName }} Question Bank</h1>
            </div>
        </div>
        <!-- question type checker row -->
        <div class="row mt-5 pt-3 pb-3">
            <div class="col row">
                <!-- <div class="d-flex">
                    <div class="form-check">
                        <input
                            class="form-check-input"
                            type="checkbox"
                            value="true"
                            v-model="isMultipleChoice"
                        />
                        <label class="form-check-label">
                            Multiple choice
                        </label>
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <div class="form-check">
                        <input
                            class="form-check-input"
                            type="checkbox"
                            value="true"
                            v-model="isEssay"
                        />
                        <label class="form-check-label"> Essay </label>
                    </div>
                </div> -->
                <div class="col">
                    <label class="control control-checkbox">
                        <span class="my-auto mx-2 me-4">Multiple Choice</span>
                        <input
                            type="checkbox"
                            name="nodeType"
                            id="regularSkillRadio"
                            value="regular"
                            v-model="isMultipleChoice"
                        />
                        <div class="control_indicator"></div>
                    </label>
                </div>
                <div class="col">
                    <label class="control control-checkbox">
                        <span class="my-auto mx-2">Essay</span>
                        <input
                            type="checkbox"
                            name="nodeType"
                            id="superSkillRadio"
                            value="super"
                            v-model="isEssay"
                        />
                        <div class="control_indicator"></div>
                    </label>
                </div>
            </div>
        </div>
        <!-- Question content row -->
        <div class="row mt-4">
            <div class="col">
                <QuestionsBankQuestionList
                    :isMultipleChoice="isMultipleChoice"
                    :isEssay="isEssay"
                />
            </div>
        </div>
        <div class="row mt-3">
            <div class="d-flex justify-content-between">
                <a class="btn red-btn" @click="$router.go(-1)">Cancel</a>
            </div>
        </div>
    </div>
</template>

<style>
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
    background-color: #9c7eec;
    color: white !important;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
}

.red-btn:hover {
    background-color: #cc3535;
}

#purple-banner {
    margin-top: -10px;
    margin-right: 0px;
    margin-left: 0px;
    padding-left: 46px;
    padding-top: 16px;
    padding-bottom: 17px;
    padding-right: 46px;
    height: 77px;
    width: 100%;
    background-color: rgb(164, 139, 230, 0.25);
}

/**-------------------------------------  */
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

.control > span {
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

.control:hover input ~ .control_indicator,
.control input:focus ~ .control_indicator {
    background: #e7ddf6;
}

.control input:checked ~ .control_indicator {
    background: #f9f5ff;
}

.control:hover input:not([disabled]):checked ~ .control_indicator,
.control input:checked:focus ~ .control_indicator {
    background: #f9f5ff;
}

.control input:disabled ~ .control_indicator {
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

.control input:checked ~ .control_indicator:after {
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

.control-checkbox input:disabled ~ .control_indicator:after {
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

.control-checkbox input + .control_indicator::before {
    animation: s-ripple 250ms ease-out;
}

.control-checkbox input:checked + .control_indicator::before {
    animation-name: s-ripple-dup;
}

/* End of check box styling */
</style>
