<script>
export default {
    setup() {},
    data() {
        return {
            hoverOn: false
        };
    },
    props: ['revision', 'skill'],
    methods: {},
    async mounted() {}
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
            <div class="position-relative">
                <Transition name="appear">
                    <div
                        class="revision-hover-detail appear-center"
                        v-if="hoverOn"
                    >
                        <div class="bubble triangle-top">
                            Lorem ipsum dolor sit amet, consectetur adipisicing
                            elit. Rerum earum exercitationem impedit,
                            consequuntur est ea. Dolore sequi illo fugiat
                            molestiae fugit error commodi, eius excepturi eum
                            consectetur blanditiis delectus voluptate?
                        </div>
                    </div>
                </Transition>
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
    left: 30px;
    width: 400px;
    z-index: 100;
}

.bubble {
    width: 500px;
    margin: 50px auto;
    background: white;
    padding: 20px;
    text-align: center;
    font-weight: 900;
    color: #64748b;
    border: 1px solid #64748b;
    border-radius: 5px;
    position: relative;
}

.appear-top {
    top: -50%;
}

.appear-center {
    top: -65%;
}

/*  */

.triangle-top:before {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border: 20px solid transparent;
    border-right-color: #334155;
    left: -40px;
    top: 6px;
}

.triangle-top::after {
    content: '';
    width: 0px;
    height: 0px;
    position: absolute;
    border: 20px solid transparent;
    border-right-color: white;
    left: -39px;
    top: 6px;
}
</style>
