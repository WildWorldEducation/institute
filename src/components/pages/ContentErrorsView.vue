<script>
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useResourcesStore } from '../../stores/ResourcesStore.js';
import { useMCQuestionsStore } from '../../stores/MCQuestionsStore.js';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const resourcesStore = useResourcesStore();
        const mcQuestionsStore = useMCQuestionsStore();

        return {
            skillsStore,
            resourcesStore,
            mcQuestionsStore
        };
    },
    data() {
        return {
            contentFlags: [],
            skillFlags: [],
            resourcesFlags: [],
            mcQuestionFlags: []
        };
    },
    components: {},
    async created() {},
    async mounted() {
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
            console.log('1');
        }
        if (this.resourcesStore.resourcesList.length == 0) {
            await this.resourcesStore.getResourcesList();
            console.log('2');
        }
        if (this.mcQuestionsStore.mcQuestionsList.length == 0) {
            await this.mcQuestionsStore.getMCQuestionsList();
            console.log('3');
        }

        await this.getContentFlags();
    },
    methods: {
        async getContentFlags() {
            fetch('/content-flags/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.contentFlags = data;
                    console.log(this.contentFlags);
                })
                .then(() => {
                    for (let i = 0; i < this.contentFlags.length; i++) {
                        if (this.contentFlags[i].content_type == 'skill') {
                            for (
                                let j = 0;
                                j < this.skillsStore.skillsList.length;
                                j++
                            ) {
                                if (
                                    this.contentFlags[i].content_id ==
                                    this.skillsStore.skillsList[j].id
                                ) {
                                    this.skillFlags.push(
                                        this.skillsStore.skillsList[j]
                                    );
                                }
                            }
                        } else if (
                            this.contentFlags[i].content_type == 'resource'
                        ) {
                            for (
                                let j = 0;
                                j < this.resourcesStore.resourcesList.length;
                                j++
                            ) {
                                if (
                                    this.contentFlags[i].content_id ==
                                    this.resourcesStore.resourcesList[j].id
                                ) {
                                    this.resourcesFlags.push(
                                        this.resourcesStore.resourcesList[j]
                                    );
                                }
                            }
                        } else if (
                            this.contentFlags[i].content_type == 'mc_question'
                        ) {
                            for (
                                let j = 0;
                                j <
                                this.mcQuestionsStore.mcQuestionsList.length;
                                j++
                            ) {
                                if (
                                    this.contentFlags[i].content_id ==
                                    this.mcQuestionsStore.mcQuestionsList[j].id
                                ) {
                                    this.mcQuestionFlags.push(
                                        this.mcQuestionsStore.mcQuestionsList[j]
                                    );
                                }
                            }
                        }
                    }
                    console.log(this.mcQuestionFlags);
                    console.log(this.resourcesFlags);
                    console.log(this.skillFlags);
                });
        }
    }
};
</script>

<template>
    <h1 class="mt-3">Content Flags</h1>
    <h2>MC Question Flags</h2>
    <div v-for="(question, index) in mcQuestionFlags" class="flag-container">
        <h5>Flag {{ index + 1 }}:</h5>
        <p><strong>Question:</strong> {{ question.question }}</p>
        <p><strong>Correct Answer:</strong> {{ question.correct_answer }}</p>
        <p>
            <strong>Incorrect Answer 1:</strong>
            {{ question.incorrect_answer_1 }}
        </p>
        <p>
            <strong>Incorrect Answer 2:</strong>
            {{ question.incorrect_answer_2 }}
        </p>
        <p>
            <strong>Incorrect Answer 3:</strong>
            {{ question.incorrect_answer_3 }}
        </p>
        <p>
            <strong>Incorrect Answer 4:</strong>
            {{ question.incorrect_answer_4 }}
        </p>
        <p><strong>Explanation:</strong> {{ question.explanation }}</p>
        <div class="d-flex justify-content-end mt-3">
            <button class="btn purple-btn">
                Edit&nbsp;
                <!-- Pencil icon -->
                <svg
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
                        fill="white"
                    />
                    <path
                        d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
                        fill="white"
                    />
                    <path
                        d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
                        fill="white"
                    />
                </svg></button
            >&nbsp;&nbsp;
            <button class="btn red-btn">
                Dismiss&nbsp;
                <!-- X icon -->
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z"
                        fill="white"
                    />
                </svg>
            </button>
        </div>
    </div>
    <h2 class="mt-3">Sources Flags</h2>
    <div v-for="(resource, index) in resourcesFlags" class="flag-container">
        <h5>Flag {{ index + 1 }}:</h5>
        <div class="d-flex justify-content-end mt-3">
            <button class="btn purple-btn">
                Edit&nbsp;
                <!-- Pencil icon -->
                <svg
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
                        fill="white"
                    />
                    <path
                        d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
                        fill="white"
                    />
                    <path
                        d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
                        fill="white"
                    />
                </svg></button
            >&nbsp;&nbsp;
            <button class="btn red-btn">
                Dismiss&nbsp;
                <!-- X icon -->
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z"
                        fill="white"
                    />
                </svg>
            </button>
        </div>
    </div>
    <h2 class="mt-3">Skill Mastery Requirements Flags</h2>
    <div v-for="(skill, index) in skillFlags" class="flag-container">
        <h5>Flag {{ index + 1 }}:</h5>
        <p><strong>Skill: </strong>{{ skill.name }}</p>
        <p><strong>Mastery Requirements: </strong></p>
        <div v-html="skill.mastery_requirements"></div>
        <div class="d-flex justify-content-end mt-3">
            <button class="btn purple-btn">
                Edit&nbsp;
                <!-- Pencil icon -->
                <svg
                    width="19"
                    height="20"
                    viewBox="0 0 19 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
                        fill="white"
                    />
                    <path
                        d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
                        fill="white"
                    />
                    <path
                        d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
                        fill="white"
                    />
                </svg></button
            >&nbsp;&nbsp;
            <button class="btn red-btn">
                Dismiss&nbsp;
                <!-- X icon -->
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z"
                        fill="white"
                    />
                </svg>
            </button>
        </div>
    </div>
</template>

<style>
h1 {
    color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

h2 {
    color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

.flag-container {
    background-color: #f2edff;
    border-radius: 12px;
    padding: 5px;
    padding-top: 25px;
    padding-bottom: 30px;
}

.purple-btn {
    background-color: #a48be6;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.purple-btn:hover {
    background-color: #7f56d9 !important;
}

.red-btn {
    background-color: #da7033;
    color: white;
    border: 1px solid #7f56d9;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.red-btn:hover {
    background-color: rgb(209, 96, 15);
}
</style>
