<script>
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

export default {
    setup() {},
    data() {
        return {
            hoverOn: false,
            dateFromNow: ''
        };
    },
    props: ['revision', 'skill'],
    methods: {},
    async mounted() {
        dayjs.extend(relativeTime);
        this.dateFromNow = dayjs(this.revision.timeStamp).fromNow();
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
                </div>
                <div class="by-user">By {{ revision.username }}</div>
            </router-link>
            <!-- revision detail appear when user hover over the row -->
            <div>
                <div class="position-relative anchor">
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
                                <div class="d-flex align-items-center">
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
                                    <div class="mx-1">
                                        {{ revision.username }},
                                        {{ dateFromNow }}
                                        ({{ revision.edited_date }})
                                    </div>
                                </div>
                                <div class="mt-3">
                                    {{
                                        revision.isOrigin
                                            ? 'Origin created by admin.'
                                            : revision.comment
                                    }}
                                </div>
                                <hr />
                                <div>100 insertion, 200 deletion</div>
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
    padding: 3px 10px;
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
</style>
