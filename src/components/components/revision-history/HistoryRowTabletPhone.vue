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
                    <div
                        class="origin-badge d-flex gap-1 align-items-center ms-2"
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
                    <svg
                        class="ms-1 my-auto chevron-icon"
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
            </div>
        </div>
        <div v-if="showDetail" class="d-flex flex-column">Show Detail</div>
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
</style>
