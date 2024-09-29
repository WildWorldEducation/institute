<script>
import QuestionsBankQuestionList from '../components/QuestionsBankQuestionList.vue';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';

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
            skillUrl: this.$route.params.skillUrl,
            isMultipleChoice: true,
            isEssay: true,
            isImage: true,
            skill: {}
        };
    },
    async created() {
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }

        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillUrl == this.skillsStore.skillsList[i].url) {
                this.skill = this.skillsStore.skillsList[i];
            }
        }
    },
    components: {
        QuestionsBankQuestionList
    }
};
</script>

<template>
    <div id="banner" class="overflow-hidden">
        <img src="/images/banners/general-banner.png" class="image-fluid" />
    </div>
    <!-- Purple Banner Row -->
    <div class="row px-2 px-lg-2" id="purple-banner">
        <div class="col d-flex justify-content-between">
            <router-link
                v-if="
                    userDetailsStore.role == 'admin' ||
                    userDetailsStore.role == 'editor'
                "
                class="purple-btn btn"
                :to="'/skills/' + skill.id + '/question-bank/add'"
            >
                Add &ThickSpace;
                <!-- Plus sign -->
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M6.34811 20.0423L6.34811 13.6494L-0.0358702 13.6583C-0.320945 13.6579 -0.594203 13.5444 -0.795782 13.3428C-0.997361 13.1412 -1.11082 12.868 -1.11132 12.5829L-1.11729 7.41477C-1.1168 7.1297 -1.00334 6.85644 -0.801757 6.65486C-0.600179 6.45328 -0.326921 6.33982 -0.0418461 6.33933L6.3481 6.34231L6.3481 -0.0506238C6.34659 -0.193451 6.3736 -0.335145 6.42756 -0.467396C6.48152 -0.599646 6.56134 -0.719794 6.66234 -0.820794C6.76334 -0.921794 6.88349 -1.00161 7.01574 -1.05557C7.14799 -1.10953 7.28969 -1.13655 7.43251 -1.13503L12.5827 -1.12308C12.8678 -1.12259 13.141 -1.00913 13.3426 -0.807549C13.5442 -0.60597 13.6577 -0.332713 13.6582 -0.047637L13.6552 6.34231L20.0481 6.34231C20.3325 6.34248 20.6052 6.45552 20.8063 6.65661C21.0074 6.8577 21.1204 7.13039 21.1206 7.41477L21.1325 12.565C21.1324 12.8494 21.0193 13.122 20.8182 13.3231C20.6171 13.5242 20.3444 13.6373 20.0601 13.6374L13.6552 13.6494L13.6641 20.0334C13.6636 20.3184 13.5502 20.5917 13.3486 20.7933C13.147 20.9948 12.8738 21.1083 12.5887 21.1088L7.43252 21.1267C7.28969 21.1282 7.148 21.1012 7.01575 21.0473C6.88349 20.9933 6.76335 20.9135 6.66235 20.8125C6.56135 20.7115 6.48153 20.5913 6.42757 20.4591C6.37361 20.3268 6.34659 20.1851 6.34811 20.0423Z"
                        fill="white"
                    />
                </svg>
            </router-link>
            <div v-else></div>
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
                <h1>{{ skill.name }} Question Bank</h1>
            </div>
        </div>
        <!-- question type checker row -->
        <div class="row mt-5 pt-3 pb-3">
            <div class="col-4">
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
            <div class="col-4 ps-0 ps-lg-4">
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
            <div class="col-4 ps-0 ps-lg-4">
                <label class="control control-checkbox">
                    <span class="my-auto mx-2">Image</span>
                    <input
                        type="checkbox"
                        name="nodeType"
                        id="superRadio"
                        value="super"
                        v-model="isImage"
                    />
                    <div class="control_indicator"></div>
                </label>
            </div>
        </div>
        <!-- Question content row -->
        <div class="row mt-4">
            <div class="col">
                <QuestionsBankQuestionList
                    :isMultipleChoice="isMultipleChoice"
                    :isEssay="isEssay"
                    :isImage="isImage"
                    :skill="skill"
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
