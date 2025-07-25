<script>
import UsersList from '../../components/students-and-users/UsersList.vue';
import UserDetails from '../../components/students-and-users/UserDetails.vue';

// Import the stores.
import { useTeacherAnalyticsStore } from '../../../stores/TeacherAnalyticsStore';
import { useUsersStore } from '../../../stores/UsersStore';
import { useCohortsStore } from '../../../stores/CohortsStore';
import { useInstructorStudentsStore } from '../../../stores/InstructorStudentsStore';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import SearchUserBar from '../../components/users-list/SearchUserBar.vue';

export default {
    setup() {
        const usersStore = useUsersStore();
        const cohortsStore = useCohortsStore();
        const instructorStudentsStore = useInstructorStudentsStore();
        const userDetailsStore = useUserDetailsStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        return {
            usersStore,
            cohortsStore,
            instructorStudentsStore,
            userDetailsStore,
            teacherAnalyticsStore
        };
    },
    data() {
        return {
            user: {
                id: null,
                firstName: null,
                lastName: null,
                username: null,
                avatar: null,
                role: null,
                isSkillsLocked: false,
                isLowActivity: false
            },
            // Only for users with the "student" role.
            instructor: null,
            // Flag to show user details when in phone view
            showDetails: false,
            students: [],
            // Flag to decide whether to show the details panel. Will be false if there are no users,
            showUserInfo: true,
            isLoading: true,
            currentUserId: '',
            subjectFilters: [],
            // Tutorial tooltips
            showTutorialTip1: false,
            showTutorialTip2: false,
            isTutorialComplete: false,
            // Flag to prevent initial selection from triggering updates
            isInitializing: true
        };
    },
    components: {
        UsersList,
        UserDetails,
        SearchUserBar
    },
    async created() {
        this.checkIfTutorialComplete();
        console.log(this.user);
        // Load data
        if (
            this.userDetailsStore.role === 'platform_admin' ||
            this.userDetailsStore.role === 'instructor' ||
            this.userDetailsStore.role === 'partner'
        ) {
            if (this.usersStore.users.length < 1) {
                await this.usersStore.getUsers();
            }
        } else if (this.userDetailsStore.role === 'editor') {
            if (this.usersStore.editors.length < 1) {
                await this.usersStore.getEditors();
            }
        }

        if (this.userDetailsStore.role !== 'editor') {
            await this.instructorStudentsStore.getInstructorStudentsList();
        }

        if (
            this.userDetailsStore.role === 'instructor' ||
            this.userDetailsStore.role === 'partner'
        ) {
            await this.getStudents();
        }

        this.isLoading = false;

        // Handle initial user selection
        this.initializeSelectedUser();

        // Mark initialization as complete
        this.$nextTick(() => {
            this.isInitializing = false;
        });
    },
    methods: {
        initializeSelectedUser() {
            const selectedId = this.usersStore.selectedUserId;
            let userFound = false;

            // Try to use previously selected user if available
            if (selectedId) {
                if (this.userDetailsStore.role === 'platform_admin') {
                    const selectedUser = this.usersStore.users.find(
                        (user) => user.id === selectedId
                    );
                    if (selectedUser) {
                        userFound = true;
                        this.updateUserDetails(selectedUser, true);
                    }
                } else if (
                    this.userDetailsStore.role === 'instructor' ||
                    this.userDetailsStore.role === 'partner'
                ) {
                    const selectedStudent = this.students.find(
                        (student) => student.id === selectedId
                    );
                    if (selectedStudent) {
                        userFound = true;
                        this.updateUserDetails(selectedStudent, true);
                    }
                } else if (this.userDetailsStore.role === 'editor') {
                    const selectedEditor = this.usersStore.editors.find(
                        (editor) => editor.id === selectedId
                    );
                    if (selectedEditor) {
                        userFound = true;
                        this.updateUserDetails(selectedEditor, true);
                    }
                } else if (this.userDetailsStore.role === 'school_admin') {
                    const selectedStudent =
                        this.usersStore.studentsPerTenant.find(
                            (student) => student.id === selectedId
                        );
                    if (selectedStudent) {
                        userFound = true;
                        this.updateUserDetails(selectedStudent, true);
                    }
                }
            }

            // Default to first user if no selection or selected user not found
            if (!userFound) {
                if (
                    this.userDetailsStore.role === 'platform_admin' &&
                    this.usersStore.users.length > 0
                ) {
                    this.updateUserDetails(this.usersStore.users[0], true);
                    if (this.$refs.usersListRef) {
                        this.$refs.usersListRef.selectedItemId =
                            this.usersStore.users[0].id;
                    }
                } else if (
                    (this.userDetailsStore.role === 'instructor' ||
                        this.userDetailsStore.role === 'partner') &&
                    this.students.length > 0
                ) {
                    this.updateUserDetails(this.students[0], true);
                    if (this.$refs.usersListRef) {
                        this.$refs.usersListRef.selectedItemId =
                            this.students[0].id;
                    }
                } else if (
                    this.userDetailsStore.role === 'editor' &&
                    this.usersStore.editors.length > 0
                ) {
                    this.updateUserDetails(this.usersStore.editors[0], true);
                    if (this.$refs.usersListRef) {
                        this.$refs.usersListRef.selectedItemId =
                            this.usersStore.editors[0].id;
                    }
                } else if (
                    this.userDetailsStore.role === 'school_admin' &&
                    this.usersStore.studentsPerTenant.length > 0
                ) {
                    this.updateUserDetails(
                        this.usersStore.studentsPerTenant[0],
                        true
                    );
                    if (this.$refs.usersListRef) {
                        this.$refs.usersListRef.selectedItemId =
                            this.usersStore.studentsPerTenant[0].id;
                    }
                }
            }
        },
        // Updated method to handle both initial setup and user selections
        async updateUserDetails(selectedUser, isInitial = false) {
            if (!selectedUser) return;

            // Update local state
            this.user.id = selectedUser.id;
            this.user.firstName = selectedUser.first_name;
            this.user.lastName = selectedUser.last_name;
            this.user.username = selectedUser.username;
            this.user.email = selectedUser.email;
            this.user.avatar = selectedUser.avatar;
            this.user.role = selectedUser.role;

            if (selectedUser.isSkillsLocked !== undefined) {
                this.user.isSkillsLocked = selectedUser.isSkillsLocked;
            }

            // Update store directly during initialization to avoid triggering watches
            if (isInitial) {
                this.usersStore.selectedUserId = selectedUser.id;
            } else {
                // Regular update through the action
                this.usersStore.setSelectedUser(selectedUser.id);
            }

            // Show details
            if (window.innerWidth < 769) {
                this.showDetails = true;
                console.log('test');
            }

            console.log(this.user);

            // Get instructor info if needed
            if (
                this.user.role === 'student' ||
                this.userDetailsStore.role === 'instructor' ||
                this.userDetailsStore.role === 'partner'
            ) {
                this.getInstructor();
            }

            // Get student analytics
            if (
                this.userDetailsStore.role === 'instructor' ||
                this.userDetailsStore.role === 'partner'
            ) {
                // For student analytics
                await this.teacherAnalyticsStore.getStudentMultipleFails(
                    this.user.id
                );

                await this.teacherAnalyticsStore.getSkillActivityReport(
                    this.user.id
                );

                this.checkIfLowActivity();
            }

            if (this.userDetailsStore.role === 'school_admin') {
                let tenantId = this.userDetailsStore.tenantId;

                if (this.usersStore.studentsPerTenant.length < 1) {
                    await this.usersStore.getStudentsPerTenant(tenantId);
                }
            }
        },
        getInstructor() {
            // Get the instructor's user id.
            var instructorId;
            for (
                let i = 0;
                i < this.instructorStudentsStore.instructorStudentsList.length;
                i++
            ) {
                if (
                    this.instructorStudentsStore.instructorStudentsList[i]
                        .student_id == this.user.id
                ) {
                    instructorId =
                        this.instructorStudentsStore.instructorStudentsList[i]
                            .instructor_id;
                }
            }
            // Get the instructor's username.
            for (let i = 0; i < this.usersStore.users.length; i++) {
                if (this.usersStore.users[i].id == instructorId) {
                    this.instructor = this.usersStore.users[i].username;
                }
            }
        },
        async getStudents() {
            this.students = [];
            var instructorStudentData = [];
            for (
                let i = 0;
                i < this.instructorStudentsStore.instructorStudentsList.length;
                i++
            ) {
                if (
                    this.instructorStudentsStore.instructorStudentsList[i]
                        .instructor_id == this.userDetailsStore.userId
                ) {
                    instructorStudentData.push({
                        id: this.instructorStudentsStore.instructorStudentsList[
                            i
                        ].student_id,
                        isSkillsLocked:
                            this.instructorStudentsStore.instructorStudentsList[
                                i
                            ].is_skills_locked
                    });
                }
            }
            for (let i = 0; i < this.usersStore.users.length; i++) {
                for (let j = 0; j < instructorStudentData.length; j++) {
                    if (
                        this.usersStore.users[i].id ==
                        instructorStudentData[j].id
                    ) {
                        this.usersStore.users[i].isSkillsLocked =
                            instructorStudentData[j].isSkillsLocked;
                        this.students.push(this.usersStore.users[i]);
                    }
                }
            }
        },
        updateShowUserDetails(newUser) {
            this.setUserState(newUser);
            this.usersStore.selectedUserId = newUser.id;
        },
        // Tutorial methods unchanged
        async checkIfTutorialComplete() {
            const result = await fetch(
                '/users/check-tutorial-progress/users/' +
                    this.userDetailsStore.userId
            );
            const data = await result.json();
            if (data == 0) {
                this.isTutorialComplete = false;
                this.showTutorialTip1 = true;
            } else if (data == 1) {
                this.isTutorialComplete = true;
            }
        },
        progressTutorial(step) {
            if (step == 1) {
                this.showTutorialTip1 = false;
                this.showTutorialTip2 = true;
            }
            if (step == 2) {
                this.showTutorialTip2 = false;
                this.markTutorialComplete();
            }
        },
        restartTutorial() {
            this.showTutorialTip2 = false;
            this.showTutorialTip1 = true;
        },
        markTutorialComplete() {
            let url =
                '/users/mark-tutorial-complete/users/' +
                this.userDetailsStore.userId;
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            };
            fetch(url, requestOptions);
        },
        updateSkillsLock() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    isSkillsLocked: this.user.isSkillsLocked
                })
            };

            fetch(
                '/instructor-students/' +
                    this.user.id +
                    '/update-locked-skills',
                requestOptions
            ).then(() => this.getStudents());
        },
        skipTutorial() {
            this.showTutorialTip1 = false;
            this.showTutorialTip2 = false;
            this.isTutorialComplete = true;
            this.markTutorialComplete();
        },
        checkIfLowActivity() {
            let lastVisitedDates = [];
            // Get dates of last visited skills
            for (
                let i = 0;
                i < this.teacherAnalyticsStore.skillActivities.length;
                i++
            ) {
                lastVisitedDates.push(
                    new Date(
                        this.teacherAnalyticsStore.skillActivities[i].endDate
                    )
                );
            }

            this.teacherAnalyticsStore.isLowActivity = true;
            // Get date one week before
            const daysBefore = new Date();
            daysBefore.setDate(daysBefore.getDate() - 3);
            // Check if any dates are more than 3 days ago
            for (let i = 0; i < lastVisitedDates.length; i++) {
                if (lastVisitedDates[i].getTime() > daysBefore.getTime()) {
                    this.teacherAnalyticsStore.isLowActivity = false;
                }
            }
        }
    },
    // Only watch for changes after initial setup
    watch: {
        'usersStore.selectedUserId': {
            handler(newId) {
                if (newId && this.initialSetupComplete) {
                    this.updateUserFromStore(newId);
                }
            }
        }
    }
};
</script>

<template>
    <!-- Top row -->
    <div class="container-fluid">
        <div
            v-if="userDetailsStore.role == 'platform_admin'"
            id="first-content-row"
            class="d-flex justify-content-between"
        >
            <router-link class="btn primary-btn" to="/users/add"
                >Add&nbsp;
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
            <SearchUserBar :updateUserDetails="updateShowUserDetails" />
        </div>
        <div
            v-if="
                userDetailsStore.role === 'editor' ||
                userDetailsStore.role === 'instructor' ||
                userDetailsStore.role === 'partner'
            "
            class="d-flex justify-content-end"
        >
            <SearchUserBar :updateUserDetails="updateShowUserDetails" />
            <button class="btn primary-btn" @click="restartTutorial">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 192 512"
                    width="20"
                    height="20"
                    fill="white"
                >
                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc. -->
                    <path
                        d="M48 80a48 48 0 1 1 96 0A48 48 0 1 1 48 80zM0 224c0-17.7 14.3-32 32-32l64 0c17.7 0 32 14.3 32 32l0 224 32 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 512c-17.7 0-32-14.3-32-32s14.3-32 32-32l32 0 0-192-32 0c-17.7 0-32-14.3-32-32z"
                    />
                </svg>
            </button>
        </div>
    </div>
    <!-- Loading animation -->
    <div
        v-if="isLoading == true"
        class="loading-animation d-flex justify-content-center align-items-center py-4"
    >
        <span class="loader"></span>
    </div>
    <div v-else id="user-container" class="container-fluid">
        <div class="row position-relative">
            <div class="col-lg-4 col-md-5">
                <UsersList ref="usersListRef" />
            </div>
            <!-- User detail view for PC and Tablet View -->
            <div class="col-lg-8 col-md-7 d-none d-md-block">
                <div class="row user-form-data-row">
                    <UserDetails
                        v-if="
                            userDetailsStore.role == 'platform_admin' ||
                            (userDetailsStore.role == 'editor' &&
                                usersStore.editors.length > 0)
                        "
                        :userId="user.id"
                    />
                    <UserDetails
                        v-else-if="userDetailsStore.role == 'school_admin'"
                        :userId="user.id"
                    />
                    <UserDetails
                        v-else-if="
                            (userDetailsStore.role == 'instructor' ||
                                userDetailsStore.role === 'partner') &&
                            students.length > 0
                        "
                        :userId="user.id"
                    />
                    <div v-else>
                        <h1
                            v-if="
                                (userDetailsStore.role == 'instructor' ||
                                    userDetailsStore.role === 'partner') &&
                                students.length > 0
                            "
                            class="text-muted py-5"
                        >
                            You have no students
                        </h1>
                        <h1
                            v-else-if="userDetailsStore.role == 'editor'"
                            class="text-muted py-5"
                        >
                            There are no other editors currently
                        </h1>
                    </div>
                </div>
            </div>
            <!-- User detail view specific for phone -->
            <div
                v-if="showDetails"
                class="col-md-7 d-block d-md-none"
                id="user-detail-section"
            >
                <div class="row">
                    <UserDetails :userId="user.id" />
                </div>
            </div>
        </div>
    </div>

    <!-- Instructor Introduction modal -->
    <div
        v-if="
            (userDetailsStore.role == 'instructor' ||
                userDetailsStore.role === 'partner') &&
            (showTutorialTip1 || showTutorialTip2)
        "
        class="modal"
    >
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>This page shows a list of your students.</p>
                <p>Click on the student's name to see their details.</p>
                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(1)"
                    >
                        next
                    </button>
                    <button class="btn red-btn" @click="skipTutorial">
                        exit tutorial
                    </button>
                </div>
            </div>
            <div v-if="showTutorialTip2">
                <p>Under the heading "Progress" you will find 3 buttons:</p>
                <p>
                    "Vertical Tree" will provide a look at the student's
                    progress in the full tree view.
                </p>
                <p>
                    "Collapsible Tree" takes you to a page similar to your own
                    collapsible tree. Here you can see the student's progress
                    and set goals for students.
                </p>
                <p>
                    "Goals" will navigate to a page that displays all the
                    students goals and the progress they have made towards them.
                </p>

                <button class="btn primary-btn" @click="progressTutorial(2)">
                    close
                </button>
            </div>
        </div>
    </div>

    <!-- Editor Introduction modal -->
    <div
        v-if="
            userDetailsStore.role == 'editor' &&
            (showTutorialTip1 || showTutorialTip2)
        "
        class="modal"
    >
        <div class="modal-content">
            <div v-if="showTutorialTip1">
                <p>This page shows a list of all the other editors.</p>
                <p>Click on an editor's name to see their details.</p>

                <div class="d-flex justify-content-between">
                    <button
                        class="btn primary-btn"
                        @click="progressTutorial(1)"
                    >
                        next
                    </button>

                    <button class="btn red-btn" @click="skipTutorial">
                        exit tutorial
                    </button>
                </div>
            </div>
            <div v-if="showTutorialTip2">
                <p>
                    Click on the 'Activity Report' button to see what your
                    fellow editor has been up to.
                </p>

                <button class="btn primary-btn" @click="progressTutorial(2)">
                    close
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
#first-content-row {
    margin-top: -10px;
    padding-left: 46px;
    padding-top: 16px;
    padding-bottom: 17px;
    padding-right: 46px;
    height: 77px;
}

#user-container {
    padding-left: 35px;
    padding-right: 46px;
}

/* Mobile */
@media (max-width: 480px) {
    #first-content-row {
        padding-top: 20px;
        padding-left: 20px;
        padding-right: 20px;
    }

    #user-container {
        padding-left: 10px;
        padding-right: 10px;
    }

    #user-detail-section {
        position: fixed;
        top: 0px;
        left: 50%;
        transform: translate(-50%, 0);
        width: 95%;
        height: 95%;
    }
}

/* Tablets */
@media (min-width: 481px) and (max-width: 1024px) {
    #user-container {
        padding-left: 10px;
        padding-right: 10px;
    }

    .user-form-data-row {
        margin-right: 0px;
    }
}

/* Loading animation */
.loader {
    width: 48px;
    height: 48px;
    border: 5px solid var(--primary-color);
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
/* End of loading animation */

.loading-animation {
    min-height: 100%;
    position: fixed;
    top: 50%;
    left: 50%;
    -webkit-transform: translate(-50%, -50%);
    transform: translate(-50%, -50%);
}

/* Modals */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 2000;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}

/* Small devices (portrait phones) */
@media (max-width: 480px) {
    /* Modal Content/Box */
    .modal-content {
        width: 90%;
        margin-top: 30%;
    }
}
</style>
