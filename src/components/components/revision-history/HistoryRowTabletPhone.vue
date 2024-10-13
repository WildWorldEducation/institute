<script>
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { diffWords } from 'diff';

export default {
    setup() {},
    data() {
        return {
            dateFromNow: '',
            added: 0,
            showDetail: false,
            removed: 0,
            shortDate: '',
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
        this.countDiff();
        this.shortDate = dayjs(this.revision.timeStamp).format('DD-MM-YYYY');
    }
};
</script>

<template>
    <div class="d-flex">
        <div class="revision-header">
            <div class="row-header-circle">
                <div v-if="showDetail" class="inner-row-header-circle"></div>
            </div>
        </div>
        <div class="d-flex">
            <div class="d-flex flex-column ms-3 revision-data">
                <div
                    class="d-flex align-items-start"
                    @click="showDetail = !showDetail"
                >
                    <router-link
                        :to="`/skills/${skill.url}/revision/${revision.version_number}`"
                        class="me-1 edit-date"
                    >
                        {{ shortDate }}
                    </router-link>
                    <div class="revision-comment">
                        -
                        {{ revision.comment ? revision.comment : 'no comment' }}
                    </div>
                    <div
                        class="current-badge d-flex gap-1 align-items-center ms-2 d-none"
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
                    <div
                        class="origin-badge d-flex gap-1 align-items-center ms-2 d-none"
                        v-if="revision.isOrigin"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            fill="white"
                            height="15"
                            width="15"
                        >
                            <path
                                d="M502.3 159.7l-234-156c-8-4.9-16.5-5-24.6 0l-234 156C3.7 163.7 0 170.8 0 178v156c0 7.1 3.7 14.3 9.7 18.3l234 156c8 4.9 16.5 5 24.6 0l234-156c6-4 9.7-11.1 9.7-18.3V178c0-7.1-3.7-14.3-9.7-18.3zM278 63.1l172.3 114.9-76.9 51.4L278 165.7V63.1zm-44 0v102.6l-95.4 63.7-76.9-51.4L234 63.1zM44 219.1l55.1 36.9L44 292.8v-73.7zm190 229.7L61.7 334l76.9-51.4L234 346.3v102.6zm22-140.9l-77.7-52 77.7-52 77.7 52-77.7 52zm22 140.9V346.3l95.4-63.7 76.9 51.4L278 448.8zm190-156l-55.1-36.9L468 219.1v73.7z"
                            />
                        </svg>
                        <div>Origin</div>
                    </div>
                    <!-- Chevron Icon -->
                    <svg
                        class="ms-1 my-auto chevron-icon"
                        :class="{
                            'chevron-down': showDetail,
                            'chevron-up': !showDetail
                        }"
                        width="14"
                        height="14"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                    >
                        <path
                            d="M233.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L256 173.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"
                        />
                    </svg>
                </div>
                <div class="by-user">By {{ revision.username }}</div>
                <div class="position-relative">
                    <div
                        v-if="showDetail"
                        class="d-flex flex-column details-div triangle-upper"
                    >
                        <div
                            class="d-flex flex-column flex-md-row align-items-md-center px-2 align-items-start"
                        >
                            <div
                                class="d-flex align-items-center justify-content-start"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="15"
                                    height="15"
                                    fill="#64748b"
                                    class="me-1"
                                >
                                    <path
                                        d="M406.5 399.6C387.4 352.9 341.5 320 288 320l-64 0c-53.5 0-99.4 32.9-118.5 79.6C69.9 362.2 48 311.7 48 256C48 141.1 141.1 48 256 48s208 93.1 208 208c0 55.7-21.9 106.2-57.5 143.6zm-40.1 32.7C334.4 452.4 296.6 464 256 464s-78.4-11.6-110.5-31.7c7.3-36.7 39.7-64.3 78.5-64.3l64 0c38.8 0 71.2 27.6 78.5 64.3zM256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-272a40 40 0 1 1 0-80 40 40 0 1 1 0 80zm-88-40a88 88 0 1 0 176 0 88 88 0 1 0 -176 0z"
                                    />
                                </svg>
                                {{ revision.username }},
                            </div>
                            <div
                                class="ms-0 ms-md-1 d-flex flex-column flex-md-row align-items-md-center align-items-start"
                            >
                                <div class="d-flex align-items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 512 512"
                                        width="12"
                                        height="12"
                                        class="mx-md-1 me-1"
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
                                <div class="ms-0 ms-md-1">
                                    ({{ revision.edited_date }})
                                </div>
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
                        <div class="d-flex">
                            <div
                                class="current-badge d-flex gap-1 align-items-center ms-2 d-md-none"
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
                            <div
                                class="origin-badge d-flex gap-1 align-items-center ms-2 d-md-none"
                                v-if="revision.isOrigin"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    fill="white"
                                    height="15"
                                    width="15"
                                >
                                    <path
                                        d="M502.3 159.7l-234-156c-8-4.9-16.5-5-24.6 0l-234 156C3.7 163.7 0 170.8 0 178v156c0 7.1 3.7 14.3 9.7 18.3l234 156c8 4.9 16.5 5 24.6 0l234-156c6-4 9.7-11.1 9.7-18.3V178c0-7.1-3.7-14.3-9.7-18.3zM278 63.1l172.3 114.9-76.9 51.4L278 165.7V63.1zm-44 0v102.6l-95.4 63.7-76.9-51.4L234 63.1zM44 219.1l55.1 36.9L44 292.8v-73.7zm190 229.7L61.7 334l76.9-51.4L234 346.3v102.6zm22-140.9l-77.7-52 77.7-52 77.7 52-77.7 52zm22 140.9V346.3l95.4-63.7 76.9 51.4L278 448.8zm190-156l-55.1-36.9L468 219.1v73.7z"
                                    />
                                </svg>
                                <div>Origin</div>
                            </div>
                            <router-link
                                class="ms-2"
                                :to="`/skills/${skill.url}/revision/${revision.version_number}`"
                                >see this edited version</router-link
                            >
                        </div>
                    </div>
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
    overflow: hidden;
    white-space: nowrap;
    max-width: 340px;
}

.details-div {
    width: 600px;
    background-color: white;
    border: 1px gray solid;
    border-radius: 6px;
    padding: 5px 0px;
    position: absolute;
    top: 10px;
    left: 0px;
    z-index: 500;
}

.break-line {
    border-bottom: 1px #94a3b8 solid;
    margin-bottom: 5px;
    margin-top: 5px;
}

.insert {
    color: #6c9777;
}

.removed {
    color: #c74e39;
}

.triangle-upper:before {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-top: 10px solid transparent;
    border-bottom: 10px solid #334155;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    left: 20px;
    top: -21px;
}

.triangle-upper::after {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border-top: 10px solid transparent;
    border-bottom: 10px solid white;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    left: 20px;
    top: -20px;
}

/* The chevron animation */
.chevron-up {
    animation: rotationBack 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.chevron-down {
    animation: rotation 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

/* The animation key frame */
@keyframes rotation {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(180deg);
    }
}

@keyframes rotationBack {
    from {
        transform: rotate(180deg);
    }

    to {
        transform: rotate(0deg);
    }
}

/* View Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    .details-div {
        max-width: 400px;
        left: -20px;
        box-shadow: 2px 2px 2px rgb(105, 104, 104);
    }

    .revision-comment {
        max-width: 220px;
    }
}
</style>
