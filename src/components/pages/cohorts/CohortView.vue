<script>
// import { useSkillsStore } from '../../../stores/SkillsStore.js';

export default {
    setup() {
        // const skillsStore = useSkillsStore();
        // return {
        //     skillsStore
        // };
    },
    data() {
        return {
            cohortId: this.$route.params.cohortId,
            cohort: {},
            members: []
        };
    },
    async created() {
        await this.getCohort();
        await this.getCohortMembers();
        // if (this.skillsStore.nestedSkillsList.length == 0) {
        //     await this.skillsStore.getNestedSkillsList();
        // }
        // console.log(this.skillsStore.nestedSkillsList);
        // this.renderList(
        //     document.getElementById('nested-skills'),
        //     this.skillsStore.nestedSkillsList
        // );
    },
    methods: {
        async getCohort() {
            fetch('/cohorts/' + this.cohortId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.cohort = data;
                });
        },
        async getCohortMembers() {
            fetch('/cohorts/' + this.cohortId + '/members')
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.members = data;
                });
        }
        // renderList(parent, array) {
        //     array.forEach((skill) => {
        //         var li = document.createElement('li'),
        //             ul;

        //         li.textContent = skill.name;
        //         parent.appendChild(li);
        //         if (skill.children) {
        //             ul = document.createElement('ul');
        //             li.appendChild(ul);
        //             this.renderList(ul, skill.children);
        //         }
        //     });
        // }
    }
};
</script>

<template>
    <div class="container">
        <h1>Cohorts: {{ cohort.name }}</h1>
        <h2>Filters</h2>
        <h2>Members</h2>
        <ul>
            <li v-for="member in members">{{ member.username }}</li>
        </ul>
        <ul id="nested-skills"></ul>
    </div>
</template>

<style scoped></style>
