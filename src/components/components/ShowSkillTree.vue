<script>
// Import
// import { Tree } from '../../skilltree/skilltree.js';
import router from "../../router";

export default {
    setup() {
    },
    data() {
        return {
            userName: this.$route.params.username,
            userId: null,
            skillTree: {},
            student: {},
            date: null,
        };
    },
    async created() {
        this.GetStudentId();
        this.GetCurrentDate();
    },
    methods: {
        GetStudentId() {
            fetch("/users/showId/" + this.userName)
                .then(function (response) {
                    return response.json();
                }).then(data => {
                    this.userId = data;
                    this.GetStudent(this.userId);
                    this.GetSkillTree(this.userId);
                });
        },
        GetStudent(userId) {
            fetch("/users/show/" + userId)
                .then(function (response) {
                    return response.json();
                }).then(data => this.student = data).then(() => {
                    this.student.children = [];
                    this.student.skillTreeTheme = this.student.skilltree_theme;

                    console.log(this.student)
                });
        },
        GetSkillTree(userId) {
            fetch('/skill-tree/' + userId)
                .then(function (response) {
                    return response.json();
                }).then(data => this.skillTree = data).then(() => {
                    // Populating the children for all elements.

                    // console.log(this.skillTree)

                    for (let i = 0; i < this.skillTree.userSkills.length; i++) {
                        // Add children array element to all.
                        this.skillTree.userSkills[i].children = [];

                        if (this.skillTree.userSkills[i].parent != null && this.skillTree.userSkills[i].parent != 0) {
                            var parentId = this.skillTree.userSkills[i].parent;

                            // Go through all rows again, add children.
                            for (let j = 0; j < this.skillTree.userSkills.length; j++) {
                                if (this.skillTree.userSkills[j].id == parentId) {
                                    this.skillTree.userSkills[j].children.push(this.skillTree.userSkills[i]);
                                }
                            }
                        }
                    }

                    //console.log(this.userSkills)

                    // Build student object.
                    for (let i = 0; i < this.skillTree.userSkills.length; i++) {
                        if (this.skillTree.userSkills[i].parent == null || this.skillTree.userSkills[i].parent == 0) {
                            this.student.children.push(this.skillTree.userSkills[i]);
                        }
                    }

                    //console.log(this.student)

                    // Add the D3 chart.
                    var chart = Tree(this.student, {
                        label: d => d.name,
                        title: d => d.name, // hover text
                        width: 3000,
                        height: 3000,
                        margin: 0
                    })

                    // console.log(chart)

                    document.getElementById("user-skilltree").appendChild(chart);
                });
        },
        GetCurrentDate() {
            const date = new Date();
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let currentDate = `${month}-${day}-${year}`;
            this.date = currentDate;
        },
    }
}
</script>

<template>
    <div class="wrapper">
        <div id="user-skilltree" class="skill-tree">
        </div>
        <div id="overlay">
            <div class="skilltree-title">
                <img src="../../assets/images/logo/logo-red.png" style="width: 80px" />
                <span :class="{ 'dark-theme': student.skillTreeTheme == 'dark' }">
                    <h1>{{ student.first_name }} {{ student.last_name }}</h1>
                    <h2>{{ date }}</h2>
                </span>
            </div>
        </div>
    </div>
</template>


<style scoped>
.skill-tree {
    height: 100%;
}

.skilltree-title {
    display: flex;
    padding-top: 10px;
    position: relative;
}

.skilltree-title span {
    margin-left: 1rem;
}

.wrapper {
    position: relative;
    height: 100%;
}

#overlay {
    position: absolute;
    top: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
}

.dark-theme {
    color: white;
}
</style>