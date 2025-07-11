<script>
// Import the stores.
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useSkillTreeStore } from '../../stores/SkillTreeStore.js';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';

// Nested components.
import SkillsListChildStudent from './SkillsListChildStudent.vue';
import SkillsListChildNonStudent from './SkillsListChildNonStudent.vue';
import SkillsListChildInstructorMode from './SkillsListChildInstructorMode.vue';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const userDetailsStore = useUserDetailsStore();
        const skillTreeStore = useSkillTreeStore();

        return {
            skillsStore,
            userDetailsStore,
            skillTreeStore
        };
    },
    data() {
        return {
            userSkills: [],
            // For instructors to view student's skill trees
            studentId: this.$route.params.studentId,
            instructorMode: false,
            studentUserSkills: [],
            isStudentSkillsLocked: null,
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
            // Platform Admins.
            if (this.userDetailsStore.role == 'platform_admin')
                await this.skillsStore.getNestedSkillsList();
            // Instructors and Editors.
            else if (
                this.userDetailsStore.role == 'instructor' ||
                this.userDetailsStore.role == 'editor' ||
                this.userDetailsStore.role == 'partner'
            )
                await this.skillsStore.getFilteredNestedSkillsList();
            // Students.
            else if (this.userDetailsStore.role == 'student') {
                await this.skillTreeStore.getUserSkills();
            }
        }
        // For instructors to view student's skill trees
        else {
            await this.skillTreeStore.getStudentSkills(this.studentId);
            this.studentUserSkills = this.skillTreeStore.studentSkills;
            await this.checkIfStudentSkillsLocked();
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
                // Platform admins.
                if (this.userDetailsStore.role == 'platform_admin') {
                    this.path = this.findPathInNestedSkillTree(
                        name,
                        this.skillsStore.nestedSkillsList
                    );
                }
                // Students.
                else if (this.userDetailsStore.role == 'student') {
                    this.path = this.findPathInNestedSkillTree(
                        name,
                        this.skillTreeStore.userSkills
                    );
                }
                // Instructor and editor
                if (
                    this.userDetailsStore.role == 'instructor' ||
                    this.userDetailsStore.role == 'editor' ||
                    this.userDetailsStore.role == 'partner'
                ) {
                    this.path = this.findPathInNestedSkillTree(
                        name,
                        this.skillsStore.filteredNestedSkillsList
                    );
                }
            } else {
                // instructor mode search
                this.path = this.findPathInNestedSkillTree(
                    name,
                    this.studentUserSkills
                );
            }
        },
        // for finding the path to a specific node in platform admin nested skill list
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
        },
        async checkIfStudentSkillsLocked() {
            const result = await fetch(
                '/instructor-students/' + this.studentId + '/is-skills-locked'
            );
            this.isStudentSkillsLocked = await result.json();
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
    <div class="bg-white">
        <!-- Loading animation -->
        <div
            v-if="isLoading == true"
            class="loading-animation d-flex justify-content-center align-items-center py-4"
        >
            <span class="loader"></span>
        </div>
        <div
            v-else
            style="position: absolute; width: 100%; left: -5px"
            class="content"
        >
            <!-- Students -->
            <div
                v-if="this.userDetailsStore.role == 'student'"
                v-for="skill in this.skillTreeStore.userSkills"
            >
                <SkillsListChildStudent
                    :id="skill.id"
                    :children="skill.children"
                    :depth="1"
                    :name="skill.skill_name"
                    :url="skill.url"
                    :isUnlocked="skill.is_accessible"
                    :isMastered="skill.is_mastered"
                    :type="skill.type"
                    :level="skill.level"
                    :showChildren="skill.show_children"
                    :role="userDetailsStore.role"
                    :path="this.path"
                >
                </SkillsListChildStudent>
            </div>
            <!-- Instructors and Editors -->
            <div
                v-else-if="
                    this.userDetailsStore.role == 'instructor' ||
                    this.userDetailsStore.role == 'editor' ||
                    this.userDetailsStore.role == 'partner'
                "
                v-for="skill in this.skillsStore.filteredNestedSkillsList"
            >
                <SkillsListChildNonStudent
                    :id="skill.id"
                    :children="skill.children"
                    :depth="1"
                    :name="skill.name"
                    :url="skill.url"
                    :type="skill.type"
                    :level="skill.level"
                    :role="userDetailsStore.role"
                    :path="this.path"
                >
                </SkillsListChildNonStudent>
            </div>
            <!-- Platform Admins -->
            <div v-else v-for="skill in this.skillsStore.nestedSkillsList">
                <SkillsListChildNonStudent
                    :id="skill.id"
                    :children="skill.children"
                    :depth="1"
                    :name="skill.name"
                    :url="skill.url"
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
                    :isGoal="skill.is_goal"
                    :type="skill.type"
                    :level="skill.level"
                    :role="userDetailsStore.role"
                    :path="this.path"
                    :studentId="studentId"
                    :parent="skill.parent"
                    :isStudentSkillsLocked="isStudentSkillsLocked"
                >
                </SkillsListChildInstructorMode>
            </div>
        </div>
    </div>
</template>

<style scoped>
.content {
    scrollbar-width: auto;
    scrollbar-color: #9f9f9f;
    overflow-x: auto;
}
.content::-webkit-scrollbar-thumb {
    background: #9f9f9f;
    border-radius: 5px;
}

.content::-webkit-scrollbar-track {
    background: #d8d8d8;
    border-radius: 5px;
}
.content::-webkit-scrollbar {
    width: 10px;
}
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--loading-animation-colour);
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
/* Loading animation */
.loading-animation {
    min-height: 100%;
    position: fixed;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
}
</style>
