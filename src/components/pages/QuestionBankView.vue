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
        <div class="col d-flex justify-content-between">
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
            <div class="d-flex justify-content-between">
                <a class="btn red-btn" @click="$router.go(-1)"
                    >Exit&ThickSpace;
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 512"
                        width="20"
                        height="20"
                        fill="white"
                    >
                        <path
                            d="M208 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM123.7 200.5c1-.4 1.9-.8 2.9-1.2l-16.9 63.5c-5.6 21.1-.1 43.6 14.7 59.7l70.7 77.1 22 88.1c4.3 17.1 21.7 27.6 38.8 23.3s27.6-21.7 23.3-38.8l-23-92.1c-1.9-7.8-5.8-14.9-11.2-20.8l-49.5-54 19.3-65.5 9.6 23c4.4 10.6 12.5 19.3 22.8 24.5l26.7 13.3c15.8 7.9 35 1.5 42.9-14.3s1.5-35-14.3-42.9L281 232.7l-15.3-36.8C248.5 154.8 208.3 128 163.7 128c-22.8 0-45.3 4.8-66.1 14l-8 3.5c-32.9 14.6-58.1 42.4-69.4 76.5l-2.6 7.8c-5.6 16.8 3.5 34.9 20.2 40.5s34.9-3.5 40.5-20.2l2.6-7.8c5.7-17.1 18.3-30.9 34.7-38.2l8-3.5zm-30 135.1L68.7 398 9.4 457.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L116.3 441c4.6-4.6 8.2-10.1 10.6-16.1l14.5-36.2-40.7-44.4c-2.5-2.7-4.8-5.6-7-8.6zM550.6 153.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L530.7 224H384c-17.7 0-32 14.3-32 32s14.3 32 32 32H530.7l-25.4 25.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l80-80c12.5-12.5 12.5-32.8 0-45.3l-80-80z"
                        />
                    </svg>
                </a>
            </div>
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
    </div>
</template>

<style scoped>
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
