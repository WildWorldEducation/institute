<script>
// import components.
import StudentProgress from '../components/StudentProgress.vue';
import LastVisitedSkills from '../components/LastVisitedSkills.vue';
import Notifications from '../components/Notifications.vue';
import News from '../components/News.vue';
import MarkAssessment from '../components/MarkAssessment.vue';
import CheckStudentQuestions from '../components/CheckStudentQuestions.vue';

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
        CheckStudentQuestions,
        LastVisitedSkills
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
    <div id="banner">
        <img src="/images/banners/general-banner.png" class="" />
    </div>
    <div class="container post-login-container min-vh-100">
        <div class="row text-center text-md-start">
            <h1 id="user-name">{{ name }}</h1>
        </div>
        <div class="row content-row">
            <div class="col-lg-4 col-md-5 mb-4 pb-4 column mx-0">
                <!-- Avatar image -->
                <img
                    id="profile-img"
                    :src="userDetailsStore.avatar"
                    class="img-fluid rounded"
                />
            </div>
            <div class="col-lg-4 col-md-7 mb-4 pb-4">
                <StudentProgress
                    v-if="userDetailsStore.role == 'student'"
                    :userId="userDetailsStore.userId"
                />
                <MarkAssessment
                    v-else-if="userDetailsStore.role == 'instructor'"
                />
                <div v-else>
                    <router-link to="/content-edits">Approve edits</router-link>
                </div>
            </div>
            <div class="col-lg-4 col-md-7 mb-4 pb-4">
                <LastVisitedSkills
                    v-if="userDetailsStore.role == 'student'"
                    :userId="userDetailsStore.userId"
                />
                <!-- Student Added Questions -->
                <CheckStudentQuestions
                    v-else-if="
                        userDetailsStore.role == 'instructor' ||
                        userDetailsStore.role == 'admin'
                    "
                />
            </div>
            <div class="col-lg-3 col-md-5 mb-4 pb-4 column">
                <Notifications />
            </div>
            <div class="col-lg-9 col-md-6 mb-4 pb-4 column d-none d-lg-block">
                <img src="/images/post-login.png" class="img-fluid" />
            </div>
        </div>
        <div id="news-row" class="row">
            <News />
        </div>
    </div>
</template>

<style>
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

.post-login-container {
    padding-top: 23px;
}

h1 {
    color: #8f7bd6;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
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

    .post-login-container {
        padding-top: 23px;
        padding-left: 20px;
        padding-right: 20px;
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

    .post-login-container {
        padding-top: 23px;
        display: relative;
    }

    /* #news-row {
        min-height: 40vh;
    } */

    #news-row > div {
        margin-bottom: 10px;
    }
}
</style>
