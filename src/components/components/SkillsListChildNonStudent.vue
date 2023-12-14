<script>
import { useSkillsStore } from '../../stores/SkillsStore.js';
// Import
import router from "../../router";

export default {
    setup() {
        const skillsStore = useSkillsStore();
        return {
            skillsStore
        }
    },
    data() {
        return {
            showChildren: false,
            showSubskills: false,
            showModal: false,
            isSuperSkill: false,
            childrenNotSubskills: [],
            subSkills: []
        };
    },
    props: ['id', 'children', 'name', 'firstAncestor', 'type', 'depth', 'role', 'DeleteSkill'],
    computed: {
        indent() {
            var amount = 0;
            if (screen.width <= 480) {
                if (this.depth == 1) {
                    amount = 25
                }
                else {
                    amount = 20;
                }
            }
            else {
                amount = 50;
            }

            // For regular skills.
            if (this.type != 'sub') {
                return { transform: `translate(${(this.depth * amount) - 35.2}px)` }
            }
            // For subskills. They should be indented to the same amount as their main skill.
            else {
                return { transform: `translate(${((this.depth - 1) * amount) - 35.2}px)` }
            }
        }
    },
    async created() {
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }

        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillsStore.skillsList[i].type == 'sub') {
                var superSkillId = this.skillsStore.skillsList[i].parent
                for (let j = 0; j < this.skillsStore.skillsList.length; j++) {
                    if (this.id == superSkillId) {
                        this.isSuperSkill = true
                    }
                }
            }
        }

        for (let i = 0; i < this.children.length; i++) {
            if (this.children[i].type == 'sub') {
                this.subSkills.push(this.children[i])
            }
            else {
                this.childrenNotSubskills.push(this.children[i])
            }
        }
    },
    methods: {
        toggleChildren() {
            this.showChildren = !this.showChildren;
        },
        toggleSubSkills() {
            this.showSubskills = !this.showSubskills;
        },
        ShowMobileButtonsModal() {
            this.showModal = true;
        },
        HideMobileButtonsModal() {
            this.showModal = false;
        }
    }
}
</script>    

<template>
    <button :style="indent" :class="{
        'top-level-skills': depth == 1,
        // Colors and background images for top level skills.
        'spoken-language-domain': id == 1,
        'written-language-domain': id == 2,
        'mathematics-domain': id == 3,
        'science-domain': id == 4,
        'history-domain': id == 5,
        'life-domain': id == 6,
        'sub-skill-button': type == 'sub'

    }" class="skill-button d-flex justify-content-between" @click="toggleChildren">
        <span style="text-align: left">{{ name }}</span>
        <!-- Buttons -->
        <div id="buttons" class="d-flex">

            <button v-if="isSuperSkill" type="button" @click.stop="toggleSubSkills" class="btn me-2 ci-btn">
                <!-- Plus sign -->
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M6.34811 20.0423L6.34811 13.6494L-0.0358702 13.6583C-0.320945 13.6579 -0.594203 13.5444 -0.795782 13.3428C-0.997361 13.1412 -1.11082 12.868 -1.11132 12.5829L-1.11729 7.41477C-1.1168 7.1297 -1.00334 6.85644 -0.801757 6.65486C-0.600179 6.45328 -0.326921 6.33982 -0.0418461 6.33933L6.3481 6.34231L6.3481 -0.0506238C6.34659 -0.193451 6.3736 -0.335145 6.42756 -0.467396C6.48152 -0.599646 6.56134 -0.719794 6.66234 -0.820794C6.76334 -0.921794 6.88349 -1.00161 7.01574 -1.05557C7.14799 -1.10953 7.28969 -1.13655 7.43251 -1.13503L12.5827 -1.12308C12.8678 -1.12259 13.141 -1.00913 13.3426 -0.807549C13.5442 -0.60597 13.6577 -0.332713 13.6582 -0.047637L13.6552 6.34231L20.0481 6.34231C20.3325 6.34248 20.6052 6.45552 20.8063 6.65661C21.0074 6.8577 21.1204 7.13039 21.1206 7.41477L21.1325 12.565C21.1324 12.8494 21.0193 13.122 20.8182 13.3231C20.6171 13.5242 20.3444 13.6373 20.0601 13.6374L13.6552 13.6494L13.6641 20.0334C13.6636 20.3184 13.5502 20.5917 13.3486 20.7933C13.147 20.9948 12.8738 21.1083 12.5887 21.1088L7.43252 21.1267C7.28969 21.1282 7.148 21.1012 7.01575 21.0473C6.88349 20.9933 6.76335 20.9135 6.66235 20.8125C6.56135 20.7115 6.48153 20.5913 6.42757 20.4591C6.37361 20.3268 6.34659 20.1851 6.34811 20.0423Z"
                        fill="#9C7EEC" />
                </svg>
            </button>
            <button @click.stop="$router.push('/skills/' + id)" class="btn me-2 ci-btn">
                <!-- Eye icon -->
                <svg xmlns="http://www.w3.org/2000/svg" height="25" width="30"
                    viewBox="0 0 576 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                    <path
                        d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"
                        fill="#9C7EEC" />
                </svg>
            </button>
            <button v-if="role == 'admin'" @click.stop="$router.push('/skills/edit/' + id)" class="btn me-2 ci-btn">
                <!-- Pencil icon -->
                <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
                        fill="#9C7EEC" />
                    <path d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
                        fill="#9C7EEC" />
                    <path
                        d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
                        fill="#9C7EEC" />
                </svg>
            </button>
            <button v-if="role == 'admin'" type="button" @click.stop="DeleteSkill(id)" class="btn delete-btn me-2 ci-btn">
                <!-- X icon -->
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z"
                        fill="#9C7EEC" />
                </svg>
            </button>
        </div>
        <button class="d-none btn" :class="{
            'top-level-skills-mobile-buttons': depth == 1,
            'mobile-buttons': depth > 1
        }" @click.stop="ShowMobileButtonsModal()">
            <svg width=" 25" height="9" viewBox="0 0 25 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="3.09803" cy="3.09803" r="3.09803"
                    transform="matrix(0.653216 -0.757172 -0.757172 -0.653216 5.19141 8.73889)" fill="#FFFFFF" />
                <circle cx="3.09803" cy="3.09803" r="3.09803"
                    transform="matrix(0.653216 -0.757172 -0.757172 -0.653216 12.8223 8.73889)" fill="#FFFFFF" />
                <circle cx="3.09803" cy="3.09803" r="3.09803"
                    transform="matrix(0.653216 -0.757172 -0.757172 -0.653216 20.4531 8.73889)" fill="#FFFFFF" />
            </svg>
        </button>
    </button>
    <!-- Modal for mobile ellipsis buttons -->
    <div v-if="showModal" id="button-modal" class="modal" @click="HideMobileButtonsModal()">
        <!-- Modal content -->
        <div class="modal-content d-flex">
            <!-- Buttons -->
            <router-link :to="'/skills/' + id" class="btn me-2" role="button">
                <!-- Eye icon -->
                <svg xmlns="http://www.w3.org/2000/svg" height="25" width="30"
                    viewBox="0 0 576 512"><!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                    <path
                        d="M288 32c-80.8 0-145.5 36.8-192.6 80.6C48.6 156 17.3 208 2.5 243.7c-3.3 7.9-3.3 16.7 0 24.6C17.3 304 48.6 356 95.4 399.4C142.5 443.2 207.2 480 288 480s145.5-36.8 192.6-80.6c46.8-43.5 78.1-95.4 93-131.1c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C433.5 68.8 368.8 32 288 32zM144 256a144 144 0 1 1 288 0 144 144 0 1 1 -288 0zm144-64c0 35.3-28.7 64-64 64c-7.1 0-13.9-1.2-20.3-3.3c-5.5-1.8-11.9 1.6-11.7 7.4c.3 6.9 1.3 13.8 3.2 20.7c13.7 51.2 66.4 81.6 117.6 67.9s81.6-66.4 67.9-117.6c-11.1-41.5-47.8-69.4-88.6-71.1c-5.8-.2-9.2 6.1-7.4 11.7c2.1 6.4 3.3 13.2 3.3 20.3z"
                        fill="#9C7EEC" />
                </svg>
            </router-link>
            <router-link v-if="role == 'admin'" :to="'/skills/edit/' + id" class="btn me-2" role="button">
                <!-- Pencil icon -->
                <svg width="19" height="20" viewBox="0 0 19 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
                        fill="#9C7EEC" />
                    <path d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
                        fill="#9C7EEC" />
                    <path
                        d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
                        fill="#9C7EEC" />
                </svg>
            </router-link>
            <button v-if="role == 'admin'" type="button" @click="DeleteSkill(id).stop" class="btn me-2">
                <!-- X icon -->
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z"
                        fill="#9C7EEC" />
                </svg>
            </button>
        </div>
    </div>

    <!-- Sub skills -->
    <SkillsListChildNonStudent v-if="showSubskills" v-for="    subSkill     in     subSkills    " :id="subSkill.id"
        :children="subSkill.children" :firstAncestor="firstAncestor" :type="subSkill.type" :name="subSkill.name"
        :role="role" :DeleteSkill="DeleteSkill" :depth="depth + 1">
    </SkillsListChildNonStudent>

    <!-- Recursive nesting of component -->
    <SkillsListChildNonStudent v-if="showChildren" v-for="    child     in     childrenNotSubskills    " :id="child.id"
        :children="child.children" :firstAncestor="firstAncestor" :type="child.type" :name="child.name" :role="role"
        :DeleteSkill="DeleteSkill" :depth="depth + 1">
    </SkillsListChildNonStudent>
</template>
 
<style scoped>
/* The skill buttons */
.skill-button {
    padding: 10px;
    margin-bottom: 10px;
    border: 2px solid #BCA3FF;
    border-radius: 8px;
    width: 655px;
    height: 84px;
    color: #53389E;
    font-size: 16px;
    font-weight: 500;
    background-color: #F2EDFF;
}

.skill-button img {
    height: 68px;
}

/* Sub skill buttons */
.sub-skill-button {
    width: 539px;
    height: 71px;
}

.sub-skill-button img {
    height: 58px;
}


/* For the top level skills */
.top-level-skills {
    color: white;
    width: 545px;
    height: 80px;
    font-size: 20px;
    font-weight: 400;
    border-color: #7F56D9;
    flex-direction: column;
    background-position: right;
}

.top-level-skills svg path {
    fill: white;
}

/* Images for the different top level domains (skills) */
.spoken-language-domain {
    background-image: url('/images/buttons/spoken-language.jpg');
}

.written-language-domain {
    background-image: url('/images/buttons/written-language.jpg');
}

.mathematics-domain {
    background-image: url('/images/buttons/mathematics.jpg');
}

.history-domain {
    background-image: url('/images/buttons/history.jpg');
}

.science-domain {
    background-image: url('/images/buttons/science.jpg');
}

.life-domain {
    background-image: url('/images/buttons/life.jpg');
}

.user-name {
    background-color: white;
}

/* Locked, unlocked and mastered styling */
.locked-skill-styling {
    -webkit-filter: grayscale(100%);
    filter: grayscale(100%);
}

.locked {
    border-color: #C8D7DA;
    background-color: #F3F2F5;
    color: #C8D7DA
}

.locked svg path {
    fill: #C8D7DA;
}

.mastered {
    background-color: #E4DAFF;
}

/* Mobile */
/* The Modal for Mobile */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 1;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

.modal-content {
    width: 90%;
    width: 50%;
    margin: auto;
    flex-direction: row;
    justify-content: center;
    margin-top: 100px;
}

@media (max-width: 480px) {

    #buttons {
        display: none !important;
    }

    .mobile-buttons,
    .top-level-skills-mobile-buttons {
        display: flex !important;
        padding: none;
    }

    .mobile-buttons svg circle {
        fill: #9C7EEC;
    }

    .top-level-skills-mobile-buttons svg circle {
        fill: #FFFFFF;
    }

    .skill-button {
        width: 293px;
        height: 70px;
    }

    .skill-button img {
        height: 48px;
    }


    .top-level-skills {
        width: 328px;
        height: 80px;
    }
}
</style> 