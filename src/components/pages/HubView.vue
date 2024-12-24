<script>
// import components.
import StudentProgress from '../components/hub-components/StudentProgress.vue';
import LastVisitedSkills from '../components/hub-components/LastVisitedSkills.vue';
import Goals from '../components/hub-components/Goals.vue';
import Notifications from '../components/hub-components/Notifications.vue';
import News from '../components/hub-components/News.vue';
import MarkAssessment from '../components/hub-components/MarkAssessment.vue';
import HubStudentQuestionList from '../components/hub-components/HubStudentQuestionList.vue';

// Import store.
import { useUserDetailsStore } from '../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        // Run the GET request.
        userDetailsStore.getUserDetails();
        return {
            userDetailsStore
        };
    },
    data() {
        return {};
    },
    components: {
        News,
        Notifications,
        StudentProgress,
        MarkAssessment,
        LastVisitedSkills,
        Goals,
        HubStudentQuestionList
    },
    computed: {
        name() {
            return (
                this.userDetailsStore.firstName +
                ' ' +
                this.userDetailsStore.lastName
            );
        }
    },
    methods: {}
};
</script>

<template>
    <div class="container min-vh-100">
        <div class="row content-row">
            <!-- Available Skills / Mark Assessments -->
            <div
                class="col-lg-4 col-md-6 mb-2"
                v-if="userDetailsStore.role != 'editor'"
            >
                <div class="hub-component h-100">
                    <StudentProgress
                        v-if="userDetailsStore.role == 'student'"
                        :userId="userDetailsStore.userId"
                    />
                    <MarkAssessment
                        v-else-if="userDetailsStore.role == 'instructor'"
                    />
                </div>
            </div>
            <!-- Last Visited Skills / Student Suggested Questions -->
            <div
                class="col-lg-4 col-md-6 mb-2 "
                v-if="userDetailsStore.role != 'editor'"
            >
                <div class="hub-component h-100">
                    <LastVisitedSkills
                        v-if="userDetailsStore.role == 'student'"
                        :userId="userDetailsStore.userId"
                    />
                    <!-- Student Added Questions List -->
                    <HubStudentQuestionList
                        v-else-if="userDetailsStore.role == 'instructor'"
                    />
                </div>
            </div>
            <div
                v-if="userDetailsStore.role == 'student'"
                class="col-lg-4 col-md-6 mb-2 "
            >
                <div class="hub-component h-100">
                    <Goals />
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-4 col-md-6 mb-2">
                <div class="hub-component h-100">
                    <Notifications />
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col">
                <div class="hub-component h-100">
                    <News />
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.hub-component {
    background-color: white;
    border-radius: 10px;
    padding: 10px;
}
/**Some how the image-fluid bootstrap does not work
*  So we have to implement it
*/
.img-fluid {
    width: 100%;
    height: auto;
}

.content-row {
    /* padding-bottom: 51px; */
}

#banner {
    width: 100%;
}

#user-name {
    font-size: 2.375rem;
}

/* Because Boostrap doesn`t support the gap between column
   So we have do it manual here
*/

#middle-profile-column {
    padding-right: 42px;
}

#notif-col {
    margin-top: 51px;
}

#sub-image {
    margin-top: 51px;
    padding-left: 23px;
}

/* View Specific On Phone */
@media (min-width: 320px) and (max-width: 576px) {
    #profile-image-column {
        padding-right: 66px;
        padding-left: 66px;
    }

    #middle-profile-column {
        margin-top: 36px;
        padding-left: 12px;
        padding-right: 12px;
    }

    #user-name {
        padding-left: 100px;
        padding-right: 100px;
    }

    #notif-col {
        margin-top: 0px;
    }
}

/* View Specific On Tablet */
@media (min-width: 577px) and (max-width: 1023px) {
    .content-row {
        padding-bottom: 0px;
        /* margin-bottom: 39px; */
    }

    #notif-col {
        margin-top: 37px;
        padding-right: 0px;
    }

    #profile-image-column {
        padding-left: 0px;
    }

    #middle-profile-column {
        padding-right: 0px;
        margin-right: 0px;
    }

    #user-name {
        padding-left: 0px;
        padding-right: 0px;
    }
}
</style>
