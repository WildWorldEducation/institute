<script>
// import store
import { useSkillsStore } from '../../stores/SkillsStore.js';
// Nested component.
import EditUserSkillsChild from './EditUserSkillsChild.vue';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        return {
            skillsStore
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
        MakeMastered(skillId) {
            var url = "/user-skills/mastered/" + this.studentId + "/" + skillId;
            fetch(url)
                .then(() => {
                    // Get all the child skills, as have to make them unlocked.
                    const childSkills = []
                    for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                        if (this.skillsStore.skillsList[i].parent == skillId) {
                            childSkills.push(this.skillsStore.skillsList[i].id)
                        }
                    }
                    // Make them accessible/unlocked.
                    for (let i = 0; i < childSkills.length; i++) {
                        this.MakeAccessible(childSkills[i])
                    }
                })
                .then(response => this.GetStudentSkills());
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