<script>
import { useSkillsStore } from '../../stores/SkillsStore.js';

export default {
    setup() {
        const skillsStore = useSkillsStore();

        return {
            skillsStore
        };
    },
    data() {
        return {
            sources: [],
            mcQuestions: [],
            contentErrors: [],
            skillMasteryRequirementsErrors: [],
            sourcesErrors: [],
            mcQuestionsErrors: []
        };
    },
    components: {},
    async mounted() {
        await this.getSources();
        await this.getMCQuestions();

        // Load the max quiz question number setting.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }

        await this.getContentErrors();
    },
    methods: {
        getContentErrors() {
            fetch('/content-errors/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.contentErrors = data;
                    console.log(this.contentErrors);
                })
                .then(() => {
                    for (let i = 0; i < this.contentErrors.length; i++) {
                        if (
                            this.contentErrors[i].content_type ==
                            'skill_mastery_requirements'
                        ) {
                            for (
                                let j = 0;
                                j < this.skillsStore.skillsList.length;
                                j++
                            ) {
                                if (
                                    this.contentErrors[i].content_id ==
                                    this.skillsStore.skillsList[j].id
                                ) {
                                    this.skillMasteryRequirementsErrors.push(
                                        this.skillsStore.skillsList[j]
                                    );
                                }
                            }
                        }
                    }
                });
        },
        async getSources() {
            fetch('/resources/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.sources = data;
                    console.log(this.sources);
                });
        },
        async getMCQuestions() {
            fetch('/questions/mc/list')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.mcQuestions = data;
                    console.log(this.mcQuestions);
                });
        }
    }
};
</script>

<template>
    <h1>Content Errors</h1>
    <h2>Skill Mastery Requirements Errors</h2>
    <div v-for="(skill, index) in skillMasteryRequirementsErrors">
        <h3>{{ index + 1 }}: {{ skill.name }}</h3>
        <div v-html="skill.mastery_requirements"></div>
    </div>
    <h2>MC Question Errors</h2>
    <h2>Sources Errors</h2>
</template>

<style></style>
