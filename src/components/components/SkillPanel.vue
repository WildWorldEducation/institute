<script>
import { useRoute } from 'vue-router';

export default {
    setup() {},
    props: ['skill', 'showSkillPanel'],
    data() {
        return {
            treeType: '',
            isImageLoading: true,
            currentSkillId: null
        };
    },
    mounted() {
        const route = useRoute();
        this.treeType = route.name;
        if (this.skill) {
            this.currentSkillId = this.skill.id;
        }
    },
    watch: {
        skill(newSkill) {
            // When skill changes, mark image as loading and update currentSkillId
            if (
                newSkill &&
                (!this.currentSkillId || newSkill.id !== this.currentSkillId)
            ) {
                this.isImageLoading = true;
                this.currentSkillId = newSkill.id;
            }
        }
    },
    computed: {},
    methods: {
        hideInfoPanel() {
            this.$parent.showSkillPanel = false;
            console.log(this.skill);
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
            this.isImageLoading = false;
        },
        imageLoaded() {
            this.isImageLoading = false;
        }
    }
};
</script>

<template>
    <Transition name="skillPanel">
        <div
            v-if="showSkillPanel"
            :class="[
                'skill-panel-container text-center overflow-auto',
                treeType === 'radial-tree' && 'radial-skill-panel'
            ]"
        >
            <div>
                <!-- Top row -->
                <div class="d-flex justify-content-between p-2">
                    <div class="d-flex">
                        <router-link
                            class="btn primary-btn"
                            target="_blank"
                            id="skillLink"
                            :to="'/skills/' + skill.url"
                            b-on-hover
                            title="Learn more"
                            >Learn More
                        </router-link>
                    </div>
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
                <hr />

                <!-- Skill name -->
                <h1 class="secondary-heading h3 text-center">
                    {{ skill?.name }}
                </h1>

                <!-- Image with loading state -->
                <div class="image-container">
                    <div v-if="isImageLoading" class="image-placeholder">
                        <div class="spinner"></div>
                    </div>
                    <img
                        v-show="!isImageLoading"
                        :src="skill.image_thumbnail_url"
                        class="rounded img-fluid mx-auto"
                        @error="imageUrlAlternative"
                        @load="imageLoaded"
                        :key="skill.id"
                    />
                </div>

                <!-- Introduction -->
                <div
                    class="skill-introduction text-start mt-1 mb-4"
                    v-html="skill.introduction"
                ></div>

                <!-- Subskills -->
                <div v-if="skill?.type == 'super'" class="skill-introduction">
                    <h2 class="h4">Subskills</h2>
                    <ul class="list-container">
                        <li v-for="subskill in skill.subskills">
                            <router-link
                                class="btn mb-2"
                                :to="'/skills/' + subskill.url"
                                >{{ subskill.name }}</router-link
                            >
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.skill-panel-container {
    background-color: #e4ecf4;
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

.image-container {
    position: relative;
    width: 50%;
    height: 150px;
    margin: auto;
    margin-bottom: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
}

img {
    max-width: 100%;
    max-height: 100%;
}

.image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f5fa;
    border-radius: 5px;
}

.spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: var(--primary-color, #4a90e2);
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.skill-introduction {
    margin-left: 20px;
    margin-right: 5px;
}
.list-container {
    list-style: none;
    padding: 0;
    text-align: start;
}

.list-container a {
    text-decoration: none;
    text-align: start;
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
