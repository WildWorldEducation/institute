<script>
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { diffWords } from 'diff';

export default {
    setup() {},
    data() {
        return {
            hoverOn: false,
            dateFromNow: '',
            added: 0,
            removed: 0,
            changed: {
                name: false,
                description: false,
                mastery_requirements: false
            }
        };
    },
    props: ['revision', 'skill'],
    methods: {
        extractContent(html) {
            return new DOMParser().parseFromString(html, 'text/html')
                .documentElement.textContent;
        },
        countDiff() {
            const plainTextMastery = this.extractContent(
                this.revision.mastery_requirements
            );
            const plainTextPreviousMastery = this.extractContent(
                this.revision.lastRevision?.mastery_requirements
            );

            const masteryDiff = diffWords(
                plainTextPreviousMastery,
                plainTextMastery
            );

            const nameDiff = diffWords(
                this.revision.lastRevision?.name,
                this.revision.name
            );

            const descriptionDiff = diffWords(
                this.revision.lastRevision?.description,
                this.revision.description
            );

            masteryDiff.forEach((element) => {
                if (element.added) {
                    this.added = this.added + 1;
                    this.changed.mastery_requirements = true;
                }
                if (element.removed) {
                    this.removed = this.removed + 1;
                    this.changed.mastery_requirements = true;
                }
            });

            nameDiff.forEach((element) => {
                if (element.added) {
                    this.added = this.added + 1;
                    this.changed.name = true;
                }
                if (element.removed) {
                    this.removed = this.removed + 1;
                    this.changed.name = true;
                }
            });

            descriptionDiff.forEach((element) => {
                if (element.added) {
                    this.added = this.added + 1;
                    this.changed.description = true;
                }
                if (element.removed) {
                    this.removed = this.removed + 1;
                    this.changed.description = true;
                }
            });
        }
    },
    async mounted() {
        dayjs.extend(relativeTime);
        this.dateFromNow = dayjs(this.revision.timeStamp).fromNow();
        if (this.revision.lastRevision) {
            this.countDiff();
        }
    }
};
</script>

<template>
    <div
        @mouseover="hoverOn = true"
        @mouseleave="hoverOn = false"
        class="d-flex"
    >
        <div class="revision-header">
            <div class="row-header-circle">
                <div v-if="hoverOn" class="inner-row-header-circle"></div>
            </div>
        </div>
        <div class="d-flex">
            <router-link
                class="d-flex flex-column ms-3 revision-data"
                :to="`/skills/${skill.url}/revision/${revision.version_number}`"
            >
                <div class="d-flex align-items-start">
                    <div class="me-1 edit-date">
                        {{ revision.edited_date }}
                    </div>
                    <div class="revision-comment">
                        -
                        {{ revision.comment ? revision.comment : 'no comment' }}
                    </div>
                    <div
                        class="current-badge d-flex gap-1 align-items-center ms-2"
                        v-if="revision.isCurrentRevision"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            heigh="15"
                            width="15"
                            fill="white"
                        >
                            <path
                                d="M448 256A192 192 0 1 0 64 256a192 192 0 1 0 384 0zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zm256 80a80 80 0 1 0 0-160 80 80 0 1 0 0 160zm0-224a144 144 0 1 1 0 288 144 144 0 1 1 0-288zM224 256a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"
                            />
                        </svg>
                        <div>Current Version</div>
                    </div>
                </div>
                <div class="by-user">By {{ revision.username }}</div>
            </router-link>
            <!-- revision detail appear when user hover over the row -->
            <div>
                <div class="position-relative">
                    <Transition name="appear">
                        <div
                            class="revision-hover-detail"
                            :class="{
                                'appear-top': revision.isCurrentRevision,
                                'appear-center':
                                    !revision.isCurrentRevision &&
                                    revision.lastRevision,
                                'appear-bottom': revision.isOrigin
                            }"
                            v-if="hoverOn"
                        >
                            <div
                                class="bubble"
                                :class="{
                                    'triangle-top': revision.isCurrentRevision,
                                    'triangle-center':
                                        !revision.isCurrentRevision &&
                                        revision.lastRevision,
                                    'triangle-bottom':
                                        !revision.lastRevision &&
                                        !revision.isCurrentRevision
                                }"
                            >
                                <div class="d-flex align-items-center px-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 512 512"
                                        width="15"
                                        height="15"
                                        fill="#64748b"
                                    >
                                        <path
                                            d="M406.5 399.6C387.4 352.9 341.5 320 288 320l-64 0c-53.5 0-99.4 32.9-118.5 79.6C69.9 362.2 48 311.7 48 256C48 141.1 141.1 48 256 48s208 93.1 208 208c0 55.7-21.9 106.2-57.5 143.6zm-40.1 32.7C334.4 452.4 296.6 464 256 464s-78.4-11.6-110.5-31.7c7.3-36.7 39.7-64.3 78.5-64.3l64 0c38.8 0 71.2 27.6 78.5 64.3zM256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-272a40 40 0 1 1 0-80 40 40 0 1 1 0 80zm-88-40a88 88 0 1 0 176 0 88 88 0 1 0 -176 0z"
                                        />
                                    </svg>
                                    <div class="mx-1 d-flex align-items-center">
                                        {{ revision.username }},
                                        <div class="d-flex align-items-center">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 512 512"
                                                width="12"
                                                height="12"
                                                class="mx-1"
                                                fill="#64748b"
                                            >
                                                <path
                                                    d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9L0 168c0 13.3 10.7 24 24 24l110.1 0c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24l0 104c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65 0-94.1c0-13.3-10.7-24-24-24z"
                                                />
                                            </svg>
                                            <div>
                                                {{ dateFromNow }}
                                            </div>
                                        </div>
                                        ({{ revision.edited_date }})
                                    </div>
                                </div>
                                <div class="mt-2 px-2 break-line">
                                    {{
                                        revision.isOrigin
                                            ? 'Origin created by admin.'
                                            : revision.comment
                                            ? revision.comment
                                            : 'No Comment'
                                    }}
                                </div>

                                <div class="hover-sub-info px-2">
                                    Changed:
                                    {{
                                        changed.name
                                            ? changed.description
                                                ? 'name,'
                                                : 'name'
                                            : ''
                                    }}
                                    {{
                                        changed.description
                                            ? changed.mastery_requirements
                                                ? 'description, '
                                                : 'description'
                                            : ''
                                    }}
                                    {{
                                        changed.mastery_requirements
                                            ? 'mastery requirements'
                                            : ''
                                    }}
                                </div>
                                <div class="hover-sub-info px-2 break-line">
                                    <span
                                        class="insert"
                                        b-on-hoover
                                        title="number of words added"
                                        >+{{ added }} insertion,</span
                                    >
                                    <span
                                        class="removed ms-1"
                                        b-on-hoover
                                        title="number of words removed"
                                        >-{{ removed }} deletion</span
                                    >
                                </div>
                                <router-link
                                    class="ms-2"
                                    :to="`/skills/${skill.url}/revision/${revision.version_number}`"
                                    >see this edited version</router-link
                                >
                            </div>
                        </div>
                    </Transition>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.revision-data {
    text-decoration: none;
    color: #334155;
}

.edit-date {
    color: #334155;
}

.revision-header {
    position: relative;
    height: 90px;
    border-left: 2px solid #8c8c8c;
}

.row-header-circle {
    position: absolute;
    top: 0px;
    left: -11px;
    width: 20px;
    height: 20px;
    border-radius: 100%;
    border: 3px solid #81b6ef;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
}

.row-header-circle:hover {
    cursor: pointer;
}

.inner-row-header-circle {
    width: 10px;
    height: 10px;
    border-radius: 100%;
    background-color: #81b6ef;
}
.by-user {
    color: #64748b;
}

.current-badge {
    background-color: #b180d7;
    color: white;
    padding: 2px;
    border-radius: 15px;
    font-size: 14px;
}

.origin-badge {
    background-color: #ea5c00;
    color: white;
    padding: 2px;
    border-radius: 15px;
    font-size: 14px;
}

.revision-comment {
    text-overflow: ellipsis;
    max-width: 500px;
    overflow: hidden;
    white-space: nowrap;
}

.revision-hover-detail {
    position: absolute;
    left: 15px;
    z-index: 100;
}

.bubble {
    width: 500px;
    margin: 50px auto;
    background: white;
    padding: 3px 0px;
    font-weight: 500;
    font-size: 14px;
    color: #64748b;
    border: 1px solid #64748b;
    border-radius: 5px;
    position: relative;
    display: flex;
    flex-direction: column;
}

.appear-top {
    top: 0%;
    left: 10px;
    transform: translate(0, calc(-25%));
}

.appear-center {
    top: 0%;
    left: 10px;
    transform: translate(0, calc(-50% + 10px));
}

.appear-bottom {
    top: 0%;
    left: 10px;
    transform: translate(0, calc(-55% - 10px));
}

/* Styling for the triangle in bubble text */

.triangle-top:before {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 10px solid transparent;
    border-right: 10px solid #334155;
    left: -20px;
    top: 6px;
}

.triangle-top::after {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border: 13px solid transparent;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 10px solid transparent;
    border-right: 10px solid white;
    left: -19px;
    top: 6px;
}

.triangle-center:before {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 10px solid transparent;
    border-right: 10px solid #334155;
    left: -20px;
    top: calc(50% - 10px);
}

.triangle-center::after {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border: 13px solid transparent;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 10px solid transparent;
    border-right: 10px solid white;
    left: -19px;
    top: calc(50% - 10px);
}

.triangle-bottom:before {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 10px solid transparent;
    border-right: 10px solid #334155;
    left: -20px;
    bottom: 10px;
}

.triangle-bottom::after {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border: 13px solid transparent;
    border-top: 10px solid transparent;
    border-bottom: 10px solid transparent;
    border-left: 10px solid transparent;
    border-right: 10px solid white;
    left: -19px;
    bottom: 10px;
}

.break-line {
    border-bottom: 1px #94a3b8 solid;
    margin-bottom: 5px;
    margin-top: 5px;
}

.hover-sub-info {
    font-size: 14px;
    color: #94a3b8;
}

.insert {
    color: #6c9777;
}

.removed {
    color: #c74e39;
}

/* Animation for hover bubble */
.appear-enter-active,
.appear-leave-active {
    transition: opacity 0.5s ease;
}

.appear-enter-from,
.appear-leave-to {
    opacity: 0;
}
</style>
