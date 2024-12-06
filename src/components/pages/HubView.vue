<script>
// import components.
import StudentProgress from '../components/StudentProgress.vue';
import LastVisitedSkills from '../components/LastVisitedSkills.vue';
import Notifications from '../components/Notifications.vue';
import News from '../components/News.vue';
import MarkAssessment from '../components/MarkAssessment.vue';
import HubStudentQuestionList from '../components/HubStudentQuestionList.vue';

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
            <div
                class="col-lg-4 col-md-6 mb-4 pb-4"
                v-if="userDetailsStore.role != 'editor'"
            >
                <div class="hub-component">
                    <StudentProgress
                        v-if="userDetailsStore.role == 'student'"
                        :userId="userDetailsStore.userId"
                    />
                    <MarkAssessment
                        v-else-if="userDetailsStore.role == 'instructor'"
                    />
                </div>
            </div>
            <div
                class="col-lg-4 col-md-6 mb-4 pb-4"
                v-if="userDetailsStore.role != 'editor'"
            >
                <div class="hub-component">
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
            <div class="col-lg-4 col-md-6 mb-4 pb-4">
                <div class="hub-component">
                    <Notifications />
                </div>
            </div>
        </div>
        <div id="news-row" class="row">
            <div class="col">
                <div class="hub-component">
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

#banner > img {
    width: 100%;
    height: auto;
}

#purple-banner {
    height: 77px;
    background-color: #a48be640;
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

#news-row {
    height: 100%;
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

    /* #news-row {
        min-height: 40vh;
    } */

    #news-row > div {
        margin-bottom: 10px;
    }
}
</style>
