<script>
// Import the stores.
import { useSettingsStore } from '../../stores/SettingsStore.js';
import { useTagsStore } from '../../stores/TagsStore';

export default {
    setup() {
        const settingsStore = useSettingsStore();
        settingsStore.getSettings();
        const tagsStore = useTagsStore();
        if (tagsStore.tagsList.length == 0) tagsStore.getTagsList();
        return {
            settingsStore,
            tagsStore
        };
    },
    data() {
        return {
            filters: []
        };
    },
    async created() {
        // Load the filters
        if (this.tagsStore.tagsList.length == 0)
            await this.tagsStore.getTagsList();
        for (let i = 0; i < this.tagsStore.tagsList.length; i++) {
            if (this.tagsStore.tagsList[i].is_active == 'active')
                this.filters.push(this.tagsStore.tagsList[i].id);
        }
    }
};
</script>

<template>
    <div class="container mt-3 pb-3 px-3 px-lg-0">
        <section>
            <hr />
            <h1>Settings</h1>
            <p>
                time for student skills to degrade (in days):
                {{ settingsStore.skillDegradationDays }}
            </p>
            <p>
                max number of questions per quiz:
                {{ settingsStore.quizMaxQuestions }}
            </p>
            <p class="mt-4">
                <router-link
                    to="/settings/edit"
                    class="btn green-btn"
                    role="button"
                >
                    Edit&nbsp;
                    <!-- Pencil icon -->
                    <svg
                        width="19"
                        height="20"
                        viewBox="0 0 19 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
                            fill="white"
                        />
                        <path
                            d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
                            fill="white"
                        />
                        <path
                            d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
                            fill="white"
                        />
                    </svg>
                </router-link>
            </p>
        </section>
        <section class="mt-5">
            <hr />
            <h1>Skill Filters</h1>
            <div class="col">
                <label
                    v-for="tag in tagsStore.tagsList"
                    class="control control-checkbox"
                >
                    <span class="my-auto mx-2 me-4"> {{ tag.name }}</span>
                    <input
                        type="checkbox"
                        :value="tag.id"
                        v-model="filters"
                        disabled
                    />
                    <div class="control_indicator"></div>
                </label>
            </div>
            <p class="mt-4">
                <router-link
                    to="/tags/select"
                    class="btn green-btn"
                    role="button"
                >
                    Select Filters
                </router-link>
            </p>
        </section>
    </div>
</template>

<style scoped>
.form-label {
    font-family: 'Poppins' sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0em;
    text-align: left;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
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

.plus-svg:hover {
    cursor: pointer;
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

.control-checkbox input + .control_indicator::before {
    animation: s-ripple 250ms ease-out;
}
.control-checkbox input:checked + .control_indicator::before {
    animation-name: s-ripple-dup;
}
/* End of check box styling */
</style>
