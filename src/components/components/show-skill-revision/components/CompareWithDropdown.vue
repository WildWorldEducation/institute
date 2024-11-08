<script>
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import dayjs from 'dayjs';
export default {
    data() {
        return {
            showDropDown: false
        };
    },
    props: [
        'skillRevisionHistory',
        'currentShowingVersion',
        'updateCompareWithRevision',
        'compareWithRevision'
    ],
    methods: {
        formatDate(dateString) {
            dayjs.extend(LocalizedFormat);
            const formattedDate = dayjs(dateString).format('lll');
            return formattedDate;
        },
        formatDatePhone(dateString) {
            dayjs.extend(LocalizedFormat);
            const formattedDate = dayjs(dateString).format('LL');
            return formattedDate;
        }
    },
    computed: {
        compareWithVersion() {
            if (!this.compareWithRevision) return false;
            return this.compareWithRevision;
        },
        skillRevisionHistoryMinusCurrentRevision() {
            let abridgedSkillRevisionHistory = [];
            for (let i = 0; i < this.skillRevisionHistory.length; i++) {
                if (
                    this.skillRevisionHistory[i].version_number !=
                    this.currentShowingVersion
                ) {
                    abridgedSkillRevisionHistory.push(
                        this.skillRevisionHistory[i]
                    );
                }
            }

            return abridgedSkillRevisionHistory;
        }
    }
};
</script>

<template>
    <!-- Custom Dropdown -->
    <div class="position-relative mb-4">
        <div
            class="d-flex flex-column compare-dropdown-div"
            :class="[showDropDown ? 'button-focus' : 'button-unfocus']"
        >
            <button @click="showDropDown = !showDropDown" class="dropdown-btn">
                <div class="d-flex">
                    Compare with:&nbsp;
                    <div v-if="!compareWithVersion">none</div>
                    <div v-else>
                        <div class="d-flex d-none d-md-block ms-1">
                            Version
                            <span class="revision-strong-text">{{
                                compareWithVersion.version_number
                            }}</span
                            >, edit date:
                            <span class="revision-strong-text">
                                {{
                                    formatDate(compareWithVersion.edited_date)
                                }} </span
                            >, by
                            <span class="revision-strong-text">
                                {{ compareWithVersion.user_name }}
                            </span>
                        </div>
                        <div class="d-md-none">
                            Version:
                            <span class="revision-strong-text">{{
                                compareWithVersion.version_number
                            }}</span>
                        </div>
                    </div>
                </div>

                <svg
                    :class="{
                        'expand-arrow': showDropDown,
                        'minimize-arrow': !showDropDown
                    }"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M14.2929 8.70711C14.9229 8.07714 14.4767 7 13.5858 7H6.41421C5.52331 7 5.07714 8.07714 5.70711 8.70711L9.29289 12.2929C9.68342 12.6834 10.3166 12.6834 10.7071 12.2929L14.2929 8.70711Z"
                        fill="#344054"
                    />
                </svg>
            </button>

            <Transition name="dropdown">
                <div v-if="showDropDown" class="history-versions-dropdown">
                    <div
                        v-for="revision in skillRevisionHistoryMinusCurrentRevision"
                        class="revision-row d-flex flex-column flex-lg-row align-items-lg-center align-items-start justify-content-start"
                        @click="
                            updateCompareWithRevision(revision);
                            showDropDown = false;
                        "
                    >
                        <div class="d-none d-md-block">
                            Version:
                            <span class="revision-strong-text">{{
                                revision.version_number
                            }}</span
                            >, edit date:
                            <span class="revision-strong-text">
                                {{ formatDate(revision.edited_date) }} </span
                            >, by
                            <span class="revision-strong-text">
                                {{ revision.user_name }}
                            </span>
                        </div>
                        <div class="d-md-none">
                            Version:
                            <span class="revision-strong-text">{{
                                revision.version_number
                            }}</span>
                            , edit date:
                            <span class="revision-strong-text">
                                {{ formatDatePhone(revision.edited_date) }}
                            </span>
                        </div>
                        <!-- Badge if the revision is the current showing revision -->
                        <div
                            v-if="
                                revision.version_number ===
                                currentShowingVersion
                            "
                            class="version-badge ms-2"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                fill="white"
                                width="20"
                                height="20"
                                class="hand-icon"
                            >
                                <path
                                    d="M64 128l177.6 0c-1 5.2-1.6 10.5-1.6 16l0 16-32 0L64 160c-8.8 0-16-7.2-16-16s7.2-16 16-16zm224 16c0-17.7 14.3-32 32-32c0 0 0 0 0 0l24 0c66.3 0 120 53.7 120 120l0 48c0 52.5-33.7 97.1-80.7 113.4c.5-3.1 .7-6.2 .7-9.4c0-20-9.2-37.9-23.6-49.7c4.9-9 7.6-19.4 7.6-30.3c0-15.1-5.3-29-14-40c8.8-11 14-24.9 14-40l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-40 0-40zm32-80s0 0 0 0c-18 0-34.6 6-48 16L64 80C28.7 80 0 108.7 0 144s28.7 64 64 64l82 0c-1.3 5.1-2 10.5-2 16c0 25.3 14.7 47.2 36 57.6c-2.6 7-4 14.5-4 22.4c0 20 9.2 37.9 23.6 49.7c-4.9 9-7.6 19.4-7.6 30.3c0 35.3 28.7 64 64 64l64 0 24 0c92.8 0 168-75.2 168-168l0-48c0-92.8-75.2-168-168-168l-24 0zM256 400c-8.8 0-16-7.2-16-16s7.2-16 16-16l48 0 16 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-64 0zM240 224c0 5.5 .7 10.9 2 16l-2 0-32 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l32 0 0 16zm24 64l40 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-48 0-16 0c-8.8 0-16-7.2-16-16s7.2-16 16-16l24 0z"
                                />
                            </svg>
                            You are in this version
                        </div>
                    </div>
                    <div
                        class="revision-row"
                        @click="
                            updateCompareWithRevision(null);
                            showDropDown = false;
                        "
                    >
                        None
                    </div>
                </div>
            </Transition>
        </div>
    </div>

    <!-- End of custom dropdown -->
</template>

<style scoped>
.compare-dropdown-div {
    width: 70%;
    position: absolute;
    top: 0px;
    left: 0px;
    background-color: #fbf9ff;
    border: 1px solid #aca4cc;
    border-radius: 5px;
    padding: 10px;
}

.dropdown-btn {
    border: none;
    background-color: inherit;
    display: flex;
    justify-content: space-between;
    outline: none;
    color: inherit;
    font-weight: inherit;
    text-align: start;
}

.history-versions-dropdown {
    background-color: #fbf9ff;
    padding: 10px;
    width: 100%;
    margin-top: 15px;
    max-height: 400px;
    overflow-y: scroll;
}

.revision-row {
    border-top: 1px solid #aca4cc;
    border-radius: 0px;
    padding: 20px 5px;
}

.revision-strong-text {
    color: #7e59cf;
}

.revision-row:hover {
    background-color: white;
    border-radius: 5px;
    border-top: 0px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.compare-dropdown-btn:focus {
    border: 1px solid #7e59cf;
    border-radius: 8px;
}

.version-badge {
    background-color: #b3a2d6;
    padding: 5px 10px;
    border-radius: 5px;
    color: white;
}

.expand-arrow {
    animation: rotation 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    cursor: pointer;
}

.minimize-arrow {
    animation: rotationBack 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    cursor: pointer;
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

/* Style Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    .compare-dropdown-div {
        width: 100%;
    }

    .hand-icon {
        transform: rotate(90deg);
    }
}

/* Style Specific on Tablet */
@media (min-width: 577px) and (max-width: 1023px) {
    .compare-dropdown-div {
        width: 100%;
    }

    .hand-icon {
        transform: rotate(90deg);
    }
}
</style>
