<script>
// Import the stores.
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useSkillTreeStore } from '../../stores/SkillTreeStore.js';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import { useUsersStore } from '../../stores/UsersStore';

// Nested components.
import SkillsListChildStudent from './SkillsListChildStudent.vue';
import SkillsListChildNonStudent from './SkillsListChildNonStudent.vue';
import SkillsListChildInstructorMode from './SkillsListChildInstructorMode.vue';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const userDetailsStore = useUserDetailsStore();
        const skillTreeStore = useSkillTreeStore();
        const usersStore = useUsersStore();

        return {
            skillsStore,
            userDetailsStore,
            skillTreeStore,
            usersStore
        };
    },
    data() {
        return {
            userSkills: [],
            // For instructors to view student's skill trees
            studentId: this.$route.params.studentId,
            studentName: null,
            instructorMode: false,
            studentUserSkills: [],
            // For the loading animation.
            isLoading: true,
            path: []
        };
    },
    computed: {},
    async created() {
        // Check if regular or instructor mode.
        if (typeof this.studentId == 'string') {
            this.instructorMode = true;
        }
        if (this.instructorMode == false) {
            // Admins.
            if (this.userDetailsStore.role == 'admin')
                await this.skillsStore.getNestedSkillsList();
            // Instructors and Editors.
            else if (
                this.userDetailsStore.role == 'instructor' ||
                this.userDetailsStore.role == 'editor'
            )
                await this.skillsStore.getFilteredNestedSkillsList();
            // Students.
            else if (this.userDetailsStore.role == 'student') {
                if (this.skillTreeStore.userSkills.length == 0) {
                    await this.skillTreeStore.getUserSkills();
                }
                this.userSkills = this.skillTreeStore.userSkills;
            }
        }
        // For instructors to view student's skill trees
        else {
            if (this.usersStore.users.length == 0)
                await this.usersStore.getUsers();

            for (let i = 0; i < this.usersStore.users.length; i++) {
                if (this.usersStore.users[i].id == this.studentId) {
                    this.studentName = this.usersStore.users[i].username;
                }
            }

            await this.skillTreeStore.getStudentSkills(this.studentId);
            this.studentUserSkills = this.skillTreeStore.studentSkills;
        }

        // For the loading animation.
        this.isLoading = false;
    },
    methods: {
        async DeleteSkill(id) {
            await this.skillsStore.deleteSkill(id);
            await this.skillsStore.getNestedSkillsList();
        },
        findNode(name) {
            if (this.instructorMode === false) {
                // Admins.
                if (this.userDetailsStore.role == 'admin') {
                    this.path = this.findPathInNestedSkillTree(
                        name,
                        this.skillsStore.nestedSkillsList
                    );
                }
                // Students.
                else if (this.userDetailsStore.role == 'student') {
                    this.path = this.findPathInNestedSkillTree(
                        name,
                        this.userSkills
                    );
                }
            }
        },
        // for finding the path to a specific node in admin nested skill list
        // Implement of DFS algorithm for tree searching
        findPathInNestedSkillTree(name, initialSkillList) {
            this.findNodeLoading = true;
            // the return array that contains path to desire node
            let path = [];
            // stop condition when the node is found
            let finish = false;
            // stack contain node that need to check. Initial data is child of root node
            let serveStack = [...initialSkillList];
            // stack contain node that we have visited
            let visited = [];
            while (!finish) {
                const currentNode = serveStack.pop();
                if (currentNode) {
                    // check if current node is already visited
                    const visitedNode = visited.some(
                        (node) => node.id === currentNode.id
                    );

                    // skip the visited node
                    if (!visitedNode) {
                        // add current node children to serveStack
                        currentNode.children?.forEach((childNode) => {
                            serveStack.push(childNode);
                        });
                        // also add the current node to visited node
                        visited.push(currentNode);
                        if (
                            currentNode.name === name ||
                            currentNode.skill_name === name
                        ) {
                            // we find the path that lead to the found node
                            let parentId = currentNode.parent;
                            // add the node to the head of the array for easier read
                            path = [currentNode, ...path];
                            let pathNode = currentNode;
                            while (parentId !== 0) {
                                // Find parent in visit stack
                                pathNode = visited.find(
                                    (node) => node.id === pathNode.parent
                                );
                                // add the node to the head of the array for easier read
                                path = [pathNode, ...path];
                                parentId = pathNode.parent;
                            }
                            // stop the search loop
                            finish = true;
                        }
                    }
                } else {
                    // if the serve stack is empty that mean we search for the whole tree
                    finish = true;
                }
                if (serveStack.length === 0) {
                    finish;
                }
            }
            this.findNodeLoading = false;
            return path;
        }
    },
    components: {
        SkillsListChildStudent,
        SkillsListChildNonStudent,
        SkillsListChildInstructorMode
    },
    watcher: {}
};
</script>

<template>
    <h1 v-if="instructorMode">{{ studentName }}</h1>
    <!-- Loading animation -->
    <div
        v-if="isLoading == true"
        class="loading-animation d-flex justify-content-center align-items-center py-4"
    >
        <span class="loader"></span>
    </div>
    <div v-else class="container mt-3" style="overflow: auto">
        <!-- Students -->
        <div
            v-if="this.userDetailsStore.role == 'student'"
            v-for="skill in this.userSkills"
        >
            <SkillsListChildStudent
                :id="skill.id"
                :children="skill.children"
                :depth="1"
                :name="skill.skill_name"
                :isUnlocked="skill.is_accessible"
                :isMastered="skill.is_mastered"
                :type="skill.type"
                :level="skill.level"
                :role="userDetailsStore.role"
                :path="this.path"
            >
            </SkillsListChildStudent>
        </div>
        <!-- Instructors and Editors -->
        <div
            v-else-if="
                this.userDetailsStore.role == 'instructor' ||
                this.userDetailsStore.role == 'editor'
            "
            v-for="skill in this.skillsStore.filteredNestedSkillsList"
        >
            <SkillsListChildNonStudent
                :id="skill.id"
                :children="skill.children"
                :depth="1"
                :name="skill.name"
                :type="skill.type"
                :level="skill.level"
                :role="userDetailsStore.role"
                :path="this.path"
            >
            </SkillsListChildNonStudent>
        </div>
        <!-- Admins -->
        <div v-else v-for="skill in this.skillsStore.nestedSkillsList">
            <SkillsListChildNonStudent
                :id="skill.id"
                :children="skill.children"
                :depth="1"
                :name="skill.name"
                :type="skill.type"
                :level="skill.level"
                :isFiltered="skill.is_filtered"
                :role="userDetailsStore.role"
                :DeleteSkill="DeleteSkill"
                :path="this.path"
            >
            </SkillsListChildNonStudent>
        </div>
        <!-- Instructor View -->
        <div v-if="this.instructorMode" v-for="skill in studentUserSkills">
            <SkillsListChildInstructorMode
                :id="skill.id"
                :children="skill.children"
                :depth="1"
                :name="skill.skill_name"
                :isUnlocked="skill.is_accessible"
                :isMastered="skill.is_mastered"
                :type="skill.type"
                :level="skill.level"
                :role="userDetailsStore.role"
                :path="this.path"
            >
            </SkillsListChildInstructorMode>
        </div>
    </div>
</template>

<style scoped>
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid #a48be5;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

:deep(.result-button) {
    color: red;
    text-decoration: underline;
    border: dashed 4px red !important;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

@media screen and (min-width: 992px) {
    /* Loading animation */
    .loading-animation {
        min-height: 100%;
        position: fixed;
        top: 50%;
        left: 50%;
        -webkit-transform: translate(-50%, -50%);
        transform: translate(-50%, -50%);
    }
}
</style>
