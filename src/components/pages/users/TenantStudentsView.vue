<script>
import TenantStudentList from '../../components/students-and-users/TenantStudentList.vue';
import TenantStudentDetails from '../../components/students-and-users/TenantStudentDetails.vue';

// Import the stores.
import { useUsersStore } from '../../../stores/UsersStore';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';
import { useTeacherAnalyticsStore } from '../../../stores/TeacherAnalyticsStore';
import { useAnalyticsStore } from '../../../stores/AnalyticsStore';

export default {
    setup() {
        const usersStore = useUsersStore();
        const userDetailsStore = useUserDetailsStore();
        const teacherAnalyticsStore = useTeacherAnalyticsStore();
        const analyticsStore = useAnalyticsStore();

        return {
            usersStore,
            userDetailsStore,
            teacherAnalyticsStore,
            analyticsStore
        };
    },
    data() {
        return {
            user: {
                id: null,
                firstName: null,
                lastName: null,
                username: null,
                avatar: null
            },
            // Flag to show user details when in phone view
            showDetails: false,
            tenantStudents: [],
            // Flag to decide whether to show the details panel. Will be false if there are no users,
            showUserInfo: true,
            isLoading: true,
            currentUserId: '',
            // Flag to prevent initial selection from triggering updates
            isInitializing: true
        };
    },
    components: {
        TenantStudentList,
        TenantStudentDetails
    },
    async created() {
        await this.usersStore.getStudentsPerTenant(
            this.userDetailsStore.tenantId
        );
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
                const selectedStudent = this.usersStore.studentsPerTenant.find(
                    (student) => student.id === selectedId
                );
                if (selectedStudent) {
                    userFound = true;
                    this.updateUserDetails(selectedStudent, true);
                }
            }

            // Default to first user if no selection or selected user not found
            if (!userFound) {
                this.updateUserDetails(
                    this.usersStore.studentsPerTenant[0],
                    true
                );
                if (this.$refs.usersListRef) {
                    this.$refs.usersListRef.selectedItemId =
                        this.usersStore.studentsPerTenant[0].id;
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
            }

            let tenantId = this.userDetailsStore.tenantId;
            if (this.usersStore.studentsPerTenant.length < 1) {
                await this.usersStore.getStudentsPerTenant(tenantId);
            }
        
            // Get data for charts
            this.$refs.tenantStudentDetailsRef.studentProgress = [];
            this.$refs.tenantStudentDetailsRef.getTenantStudentProgress();
            this.$refs.tenantStudentDetailsRef.assessmentPasses = [];
            this.$refs.tenantStudentDetailsRef.getAssessmentPasses();
            this.$refs.tenantStudentDetailsRef.assessmentAttempts = [];
            this.$refs.tenantStudentDetailsRef.getAssessmentAttempts();
            this.teacherAnalyticsStore.studentMultipleFails = [];
            await this.teacherAnalyticsStore.getStudentMultipleFails(
                this.user.id
            );               
            this.$refs.tenantStudentDetailsRef.durationsPerDay = [];
            this.$refs.tenantStudentDetailsRef.getStudentDurationPerDay();
            this.teacherAnalyticsStore.skillActivities = []
                await this.teacherAnalyticsStore.getSkillActivityReport(
                   this.user.id
                );            
            this.teacherAnalyticsStore.skillActivities =
                this.teacherAnalyticsStore.skillActivities.map((skill) => {
                    return {
                        ...skill,
                        formattedQuantity: this.millisToMinutesAndSeconds(skill.quantity)
                    };
                });
            this.analyticsStore.studentRootSubjectsFailedAssessments = []            
            this.analyticsStore.getStudentFailedAssessmentsBySubject(this.user.id)
            this.analyticsStore.studentRootSubjectsPassedAssessments =[]            
            this.analyticsStore.getStudentPassedAssessmentsBySubject(this.user.id)            
            this.analyticsStore.studentRootSubjectsAttemptedAssessments =[]
            this.analyticsStore.getStudentAttemptedAssessmentsBySubject(this.user.id)
        },
        updateShowUserDetails(newUser) {
            this.usersStore.selectedUserId = newUser.id;
        },
        millisToMinutesAndSeconds(millis) {
            var minutes = Math.floor(millis / 60000);
            var seconds = ((millis % 60000) / 1000).toFixed(0);
            return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
        },    
    }
};
</script>

<template>
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
                <TenantStudentList ref="usersListRef" />
            </div>
            <!-- User detail view for PC and Tablet View -->
            <div class="col-lg-8 col-md-7 d-none d-md-block">
                <div class="row user-form-data-row">
                    <TenantStudentDetails
                        ref="tenantStudentDetailsRef"
                        :userId="user.id"
                    />
                </div>
            </div>
            <!-- User detail view specific for phone -->
            <div
                v-if="showDetails"
                class="col-md-7 d-block d-md-none"
                id="user-detail-section"
            >
                <div class="row">
                    <TenantStudentDetails :userId="user.id" />
                </div>
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
