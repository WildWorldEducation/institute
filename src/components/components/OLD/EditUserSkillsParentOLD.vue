<script>
// import store
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useUserSkillsStore } from '../../stores/UserSkillsStore.js';
// Nested component.
import EditUserSkillsChild from './EditUserSkillsChild.vue';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const userSkillsStore = useUserSkillsStore();
        return {
            skillsStore, userSkillsStore
        }
    },
    data() {
        return {
            studentId: this.$route.params.id,
            student: {},
            studentSkillTree: {},
        };
    },
    async created() {
        // Load the skills if hanent been yet.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList()
        }

        this.GetStudentDetails();
        // GET request using fetch with async/await
        const response = await fetch('/user-skills/' + this.studentId);
        const data = await response.json();
        this.studentSkillTree.children = data;
    },
    components: {
        EditUserSkillsChild
    },
    methods: {
        GetStudentDetails() {
            fetch("/users/show/" + this.studentId)
                .then(function (response) {
                    return response.json();
                })
                .then(data => this.student = data).then(() => {
                    this.studentSkillTree.skill_name = this.student.username;
                });
        },
        GetStudentSkills() {
            fetch('/user-skills/' + this.studentId)
                .then(function (response) {
                    return response.json();
                })
                .then(data => this.studentSkillTree.children = data).then(() => {
                    this.isFetching = true;
                });
        },
        MakeAccessible(skillId) {
            var url = "/user-skills/accessible/" + this.studentId + "/" + skillId;
            fetch(url)
                .then(response => this.GetStudentSkills());
        },
        MakeInaccessible(skillId) {
            var url = "/user-skills/inaccessible/" + this.studentId + "/" + skillId;
            fetch(url)
                .then(response => this.GetStudentSkills());
        },
        async MakeMastered(skillId) {
            await this.userSkillsStore.MakeMastered(this.studentId, skillId)
            this.GetStudentSkills()
        },
        MakeUnmastered(skillId) {
            var url = "/user-skills/unmastered/" + this.studentId + "/" + skillId;
            fetch(url)
                .then(response => this.GetStudentSkills());
        },
        SubmitGrade(skillId, grade) {
            console.log(grade)
            var url = "/user-skills/grade/" + this.studentId + "/" + skillId + "/" + grade;
            fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'content/type'
                },
                body: {}
            }).then(response => this.GetStudentSkills());
        }
    }
}
</script> 

<template>
    <EditUserSkillsChild :children="studentSkillTree.children" :depth="0" :skill_name="studentSkillTree.skill_name"
        :is_mastered="studentSkillTree.is_mastered" :is_accessible="studentSkillTree.is_accessible"
        :grade="studentSkillTree.grade" :id="studentSkillTree.id" :MakeAccessible="MakeAccessible"
        :MakeInaccessible="MakeInaccessible" :MakeMastered="MakeMastered" :MakeUnmastered="MakeUnmastered"
        :SubmitGrade="SubmitGrade">
    </EditUserSkillsChild>
</template>


<style scoped></style> 