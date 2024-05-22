<script>
export default {
    setup() {},
    data() {
        return {};
    },
    props: ['skill'],
    computed: {},
    methods: {
        hideInfoPanel() {
            // If panel is showing.
            if (this.$parent.isSkillInfoPanelShown) {
                // Responsive.
                // Laptop etc.
                if (screen.width > 800) {
                    document.getElementById('skillInfoPanel').style.width =
                        '0px';
                }
                // Mobile device.
                else {
                    document.getElementById('skillInfoPanel').style.height =
                        '0px';
                }
                // Hide the background.
                document.getElementById('sidepanel-backdrop').style.display =
                    'none';

                this.$parent.isSkillInfoPanelShown = false;
            }
        }
    }
};
</script>

<template>
    <div id="skillInfoPanel" class="skillInfoPanel">
        <div class="closeButtonContainer">
            <a
                href="javascript:void(0)"
                class="closebtn"
                @click="this.hideInfoPanel()"
                >&times;</a
            >
        </div>
        <div id="skillInfoPanelContainer">
            <h1>{{ skill?.name }}</h1>
            <div class="form-check">
                <!-- 'pointer-events: none' to make checkbox unclickable, without it being greyed out (disabled). -->
                <input
                    id="mastery-checkbox"
                    class="form-check-input"
                    type="checkbox"
                    value="skill?.isMastered"
                    style="pointer-events: none"
                />
                <label
                    class="form-check-label"
                    style="color: #9c7eec; pointer-events: none"
                >
                    Attained
                </label>
            </div>
            <div v-if="skill?.type != 'domain'" class="mt-4">
                <h2>Mastery Requirements</h2>
                <div
                    class="truncate-overflow"
                    v-html="skill?.masteryRequirements"
                ></div>
            </div>
            <div v-if="skill.type == 'super'" class="mt-2">
                <h2>Outer cluster nodes</h2>
                <ul>
                    <li v-for="subskill in skill.subskills">
                        <router-link
                            target="_blank"
                            id="skillLink"
                            :to="'/skills/' + subskill.id"
                            >{{ subskill.skill_name }}
                        </router-link>
                    </li>
                </ul>
            </div>
            <hr v-if="skill.type != 'domain'" />
            <router-link
                v-if="skill.type != 'domain'"
                class="btn green-btn"
                target="_blank"
                id="skillLink"
                :to="'/skills/' + skill.id"
                >See More&nbsp;
                <!-- Plus sign -->
                <svg
                    width="18"
                    height="18"
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
            <div v-if="skill?.type == 'domain'" class="mt-4">
                <p>
                    This is a larger subject holding a series of more specific
                    skills; click through to the skills within it to master each
                    one!
                </p>
                <!-- <p>
                    To master this subject, you need to master all the skills
                    within it.
                </p> -->
            </div>
        </div>
        <!-- Image: character with a sign. -->
        <!-- <img src="/images/char-with-sign.svg" /> -->
    </div>
</template>

<style scoped>
/* The sidepanel menu */
.skillInfoPanel {
    position: absolute;
    z-index: 1;
    background-color: #fff;
    /* Disable horizontal scroll */
    overflow-x: hidden;
    /* 0.5 second transition effect to slide in the sidepanel */
    transition: 0.5s;
    background: #e4ecf4;
    /* So it is above the darkened background. */
    z-index: 1072;
}

/* The sidepanel header */
#skillHeading {
    color: #9c7eec;
    font-size: 32px;
    font-weight: 600;
}

#skillDescription {
    color: #bca3ff;
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

/* The sidepanel container */
#skillInfoPanelContainer {
    padding: 20px;
    /* height: calc(100% - 40px); */
}

.skillInfoPanel img {
    position: absolute;
    bottom: 20px;
    right: 20px;
}

@media (min-width: 801px) {
    .skillInfoPanel {
        height: 100%;
        /* This will be changed with JavaScript */
        width: 0;
        top: 0;
        right: 0;
    }
}

@media (max-width: 800px) {
    .skillInfoPanel {
        /* This will be changed with JavaScript */
        height: 0;
        width: 100%;
        bottom: 0;
    }
}

.closeButtonContainer {
    height: 29px;
    width: 100%;
    text-align: center;
    display: flex;
    justify-content: right;
    padding: 5px;
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

/* To truncate the Mastery Requirements section to 3 lines */
.truncate-overflow {
    overflow: hidden;
    display: -webkit-box;
    -webkit-line-clamp: 3; /* number of lines to show */
    line-clamp: 3;
    -webkit-box-orient: vertical;
}
/* Mastery Requirements header */
h2 {
    color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
    font-size: x-large;
}
</style>
