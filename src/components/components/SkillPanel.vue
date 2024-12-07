<script>
import { useRoute } from 'vue-router';

export default {
    setup() {},
    props: ['skill', 'showSkillPanel'],
    data() {
        return {
            treeType: ''
        };
    },
    mounted() {
        const route = useRoute();
        this.treeType = route.name;
    },
    computed: {},
    methods: {
        hideInfoPanel() {
            this.$parent.showSkillPanel = false;
        },
        toggleChildNodes() {
            if (this.skill.show_children == 0) {
                this.$parent.toggleShowChildren(this.skill);
            } else {
                this.$parent.toggleHideChildren(this.skill);
            }
        },
        imageUrlAlternative(event) {
            event.target.src = '';
        }
    }
};
</script>

<template>
    <Transition name="skillPanel">
        <div
            v-if="showSkillPanel"
            :class="[
                'skill-panel-container',
                treeType === 'radial-tree' && 'radial-skill-panel'
            ]"
        >
            <div class="skill-info-panel-top">
                <div class="closeButtonContainer">
                    <button
                        class="closebtn"
                        @click="hideInfoPanel"
                        b-on-hover
                        title="Close Panel "
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 384 512"
                            fill="#888"
                            width="20"
                            height="20"
                        >
                            <path
                                d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                            />
                        </svg>
                    </button>
                </div>
                <!-- Skill name -->
                <h1 class="skill-name heading">{{ skill?.name }}</h1>
                <img
                    :src="
                        'https://institute-skill-infobox-image-thumbnails.s3.amazonaws.com/' +
                        skill.url
                    "
                    class="rounded img-fluid"
                    @error="imageUrlAlternative"
                />
                <!-- Mastery requirements -->
                <div
                    class="skill-mastery-requirement"
                    v-html="skill.masteryRequirements"
                ></div>
                <div
                    v-if="skill?.type == 'domain'"
                    class="skill-mastery-requirement"
                >
                    <p>
                        This is a larger subject holding a series of more
                        specific skills; click through to the skills within it
                        to master each one!
                    </p>
                </div>
                <!-- Subskills -->
                <div
                    v-if="skill?.type == 'super'"
                    class="skill-mastery-requirement"
                >
                    <h2 class="h4">Subskills</h2>
                    <ul>
                        <li v-for="subskill in skill.subskills">
                            <router-link :to="'/skills/' + subskill.url">{{
                                subskill.name
                            }}</router-link>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="skill-info-panel-bottom">
                <hr v-if="skill.type != 'domain'" />
                <div class="d-flex justify-content-between">
                    <button
                        v-if="skill.hasChildren"
                        class="secondary-btn ms-2 btn"
                        @click="toggleChildNodes"
                    >
                        Toggle child nodes
                    </button>
                    <router-link
                        v-if="skill.type != 'domain'"
                        class="btn secondary-btn me-2"
                        :class="{ 'ms-auto': !skill.hasChildren }"
                        target="_blank"
                        id="skillLink"
                        :to="'/skills/' + skill.url"
                        b-on-hover
                        title="To Skill Details Page"
                        >See More&nbsp;
                        <!-- Plus sign -->
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 20 20"
                            fill="primary-icon"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M6.34811 20.0423L6.34811 13.6494L-0.0358702 13.6583C-0.320945 13.6579 -0.594203 13.5444 -0.795782 13.3428C-0.997361 13.1412 -1.11082 12.868 -1.11132 12.5829L-1.11729 7.41477C-1.1168 7.1297 -1.00334 6.85644 -0.801757 6.65486C-0.600179 6.45328 -0.326921 6.33982 -0.0418461 6.33933L6.3481 6.34231L6.3481 -0.0506238C6.34659 -0.193451 6.3736 -0.335145 6.42756 -0.467396C6.48152 -0.599646 6.56134 -0.719794 6.66234 -0.820794C6.76334 -0.921794 6.88349 -1.00161 7.01574 -1.05557C7.14799 -1.10953 7.28969 -1.13655 7.43251 -1.13503L12.5827 -1.12308C12.8678 -1.12259 13.141 -1.00913 13.3426 -0.807549C13.5442 -0.60597 13.6577 -0.332713 13.6582 -0.047637L13.6552 6.34231L20.0481 6.34231C20.3325 6.34248 20.6052 6.45552 20.8063 6.65661C21.0074 6.8577 21.1204 7.13039 21.1206 7.41477L21.1325 12.565C21.1324 12.8494 21.0193 13.122 20.8182 13.3231C20.6171 13.5242 20.3444 13.6373 20.0601 13.6374L13.6552 13.6494L13.6641 20.0334C13.6636 20.3184 13.5502 20.5917 13.3486 20.7933C13.147 20.9948 12.8738 21.1083 12.5887 21.1088L7.43252 21.1267C7.28969 21.1282 7.148 21.1012 7.01575 21.0473C6.88349 20.9933 6.76335 20.9135 6.66235 20.8125C6.56135 20.7115 6.48153 20.5913 6.42757 20.4591C6.37361 20.3268 6.34659 20.1851 6.34811 20.0423Z"
                            />
                        </svg>
                    </router-link>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.skill-panel-container {
    background-color: #e4ecf4;
    color: #888;
    z-index: 1072;
    position: absolute;
    top: 0px;
    right: 0px;
    width: 30%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.radial-skill-panel {
    height: 100%;
}

.skill-info-panel-top {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.closeButtonContainer {
    height: 29px;
    width: 100%;
    text-align: center;
    display: flex;
    justify-content: right;
    padding: 5px;
    flex-shrink: 0;
}

/* Position and style the close button (top right corner) */
.closebtn {
    font-family: 'Poppins900';
    text-decoration: none;
    color: #c8d7da;
    border: 1.45px solid #c8d7da;
    border-radius: 5px;
    width: 29px;
    height: 29px;
    font-size: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #edf5fd;
}

.closebtn:hover {
    background-color: #dce1eb;
}

.skill-name {
    color: var(--primary-color) !important;
    font-weight: 600;
    font-size: 33px;
    margin-left: 20px;
}

img {
    width: 50%;
    margin: auto;
    margin-bottom: 5px;
}

.skill-mastery-requirement {
    margin-left: 20px;
    margin-right: 5px;
}

.skill-info-panel-bottom {
    margin-bottom: 10px;
}

/* Slide left animation */
@keyframes slideY {
    0% {
        opacity: 0;
        transform: scaleX(0);
    }

    100% {
        opacity: 1;
        transform: scaleX(1);
    }
}
.skillPanel-enter-active {
    transform-origin: right center;
    animation: slideY 0.5s;
}
.skillPanel-leave-active {
    transform-origin: right center;
    animation: slideY 0.5s reverse;
}

/* View Specific On Phone */
@media (min-width: 320px) and (max-width: 576px) {
    /* Slide down animation */
    @keyframes slideY {
        0% {
            opacity: 0;
            transform: scaleY(0);
        }

        100% {
            opacity: 1;
            transform: scaleY(1);
        }
    }
    .skillPanel-enter-active {
        transform-origin: bottom;
        animation: slideY 0.5s;
    }
    .skillPanel-leave-active {
        transform-origin: bottom;
        animation: slideY 0.5s reverse;
    }
}

/* Small devices (portrait phones) */
@media (max-width: 800px) {
    .skill-panel-container {
        width: 100%;
        height: 100%;
    }

    .radial-skill-panel {
        height: 100%;
    }
}

/* View Specific On Tablet */
@media (min-width: 577px) and (max-width: 1020px) {
    .skill-panel-container {
        width: 80%;
        height: 100%;
    }
}
</style>
