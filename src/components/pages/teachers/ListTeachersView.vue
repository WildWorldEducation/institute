<script>
import InstructorsList from '../../components/instructors/InstructorsList.vue';
import InstructorDetails from '../../components/instructors/InstructorDetails.vue';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';
import { useUsersStore } from '../../../stores/UsersStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const usersStore = useUsersStore();
        return { userDetailsStore, usersStore };
    },
    data() {
        return {
            selectedTeacher: {
                name: null,
                id: null
            },
            newTeacher: {
                name: null
            },
            teachers: [],
            studentsOfInstructor: [],
            // Flag to show user details when in phone view
            showDetails: false
        };
    },
    components: { InstructorsList, InstructorDetails },
    async created() {
        await this.getInstructorsPerTenant(this.userDetailsStore.tenantId);
    },
    methods: {
        async getInstructorsPerTenant(tenantId) {
            await this.usersStore.getTeacherPerTenant(tenantId);
            this.teachers = this.usersStore.instructorPerTenant;
            if (this.teachers.length > 0) {
                this.updateTeacherDetails(this.teachers[0]);
            }
            this.selectedTeacher = this.teachers[0];
        },
        // Updated method to handle both initial setup and user selections
        async updateTeacherDetails(selectedTeacher) {
            if (!selectedTeacher) return;
            // Update local state
            this.selectedTeacher.id = selectedTeacher.id;
            this.selectedTeacher.name = selectedTeacher.first_name;
            // get list of students for the selected teacher
            await this.usersStore.getStudentsOfUser(selectedTeacher.id);
            console.log(
                'Fetched students for instructor:',
                this.usersStore.studentsOfInstructor
            );
            this.studentsOfInstructor = this.usersStore.studentsOfInstructor;
        }
    }
};
</script>

<template>
    <div class="container-fluid">
        <div class="row position-relative" v-if="teachers.length > 0">
            <div class="col-lg-4 col-md-5">
                <InstructorsList ref="tenantsListRef" />
            </div>
            <!-- Tenant detail view for PC and Tablet View -->
            <div class="col-lg-8 col-md-7 d-none d-md-block">
                <div class="row user-form-data-row">
                    <InstructorDetails
                        :teacherId="selectedTeacher.id"
                        :studentOfInstructor="studentsOfInstructor"
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
                    <InstructorDetails :tenantId="selectedTenant.id" />
                </div>
            </div>
        </div>
        <div class="container" v-else>
            <p>There are no teachers yet.</p>
            <!-- Add Teacher Link -->
            <RouterLink to="/teachers/add" class="d-block mb-2 btn primary-btn">
                Add teacher
            </RouterLink>
        </div>
    </div>
</template>

<style scoped>
/* Mobile */
@media (max-width: 480px) {
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
    .user-form-data-row {
        margin-right: 0px;
    }
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
