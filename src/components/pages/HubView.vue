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
import { useAssessmentsStore } from '../../stores/AssessmentsStore.js';
import { useUsersStore } from '../../stores/UsersStore.js';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useInstructorStudentsStore } from '../../stores/InstructorStudentsStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const assessmentsStore = useAssessmentsStore();
        const usersStore = useUsersStore();
        const skillsStore = useSkillsStore();
        const instructorStudentsStore = useInstructorStudentsStore();
        // Run the GET request.
        userDetailsStore.getUserDetails();
        return {
            userDetailsStore,
            assessmentsStore,
            usersStore,
            skillsStore,
            instructorStudentsStore
        };
    },
    data() {
        return {
            assessments: [],
            questions: [],
            studentIds: []
        };
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
    async created() {
        await this.fetchAssessments();
        await this.getStudentMCQuestions();
    },
    methods: {
        async fetchAssessments() {
            // Create the assessments array ---------------------------------
            // Get unmarked assessments if there no assessment store before
            await this.assessmentsStore.getAssessments();

            // Get the instructor student list, if not yet loaded.
            if (
                this.instructorStudentsStore.instructorStudentsList.length == 0
            ) {
                await this.instructorStudentsStore.getInstructorStudentsList();
            }

            // Just get the students that this instructors teaches.
            for (
                let i = 0;
                i < this.instructorStudentsStore.instructorStudentsList.length;
                i++
            ) {
                if (
                    this.userDetailsStore.userId ==
                    this.instructorStudentsStore.instructorStudentsList[i]
                        .instructor_id
                ) {
                    this.studentIds.push(
                        this.instructorStudentsStore.instructorStudentsList[i]
                            .student_id
                    );
                }
            }
            // Get the assessments for those students.
            for (let i = 0; i < this.assessmentsStore.assessments.length; i++) {
                for (let j = 0; j < this.studentIds.length; j++) {
                    if (
                        this.assessmentsStore.assessments[i].student_id ==
                        this.studentIds[j]
                    ) {
                        this.assessments.push(
                            this.assessmentsStore.assessments[i]
                        );
                    }
                }
            }

            // Date.
            for (let i = 0; i < this.assessments.length; i++) {
                let date = new Date(this.assessments[i].date).toDateString();
                this.assessments[i].date = date;
            }

            // Get users.
            if (this.usersStore.users.length == 0) {
                await this.usersStore.getUsers();
            }
            // Add the student name.
            for (let i = 0; i < this.assessments.length; i++) {
                for (let j = 0; j < this.usersStore.users.length; j++) {
                    if (
                        this.assessments[i].student_id ==
                        this.usersStore.users[j].id
                    ) {
                        this.assessments[i].studentUsername =
                            this.usersStore.users[j].username;
                    }
                }
            }

            // Get skills.
            if (this.skillsStore.skillsList.length == 0) {
                await this.skillsStore.getSkillsList();
            }
            // Add the skill name.
            for (let i = 0; i < this.assessments.length; i++) {
                for (let j = 0; j < this.skillsStore.skillsList.length; j++) {
                    if (
                        this.assessments[i].skill_id ==
                        this.skillsStore.skillsList[j].id
                    ) {
                        this.assessments[i].skillName =
                            this.skillsStore.skillsList[j].name;
                    }
                }
            }
        },
        formatDate(unformattedDate) {
            // Prep the date and time data ---------------
            // Split timestamp into [ Y, M, D, h, m, s ]
            var date = unformattedDate.replace('T', ' ');
            date = date.replace('Z', ' ');
            let newDate = date.split(/[- :]/);
            // Apply each element to the Date function
            var finalDate = new Date(
                Date.UTC(
                    newDate[0],
                    newDate[1] - 1,
                    newDate[2],
                    newDate[3],
                    newDate[4],
                    newDate[5]
                )
            );
            var options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            };
            finalDate = finalDate.toLocaleDateString('en-US', options);
            return finalDate;
        },
        async getStudentMCQuestions() {
            const result = await fetch(
                '/questions/student-mc-questions/full-data-list'
            );
            const data = await result.json();
            this.questions = data;
        }
    }
};
</script>

<template>
    <div class="container min-vh-100">
        <div class="row content-row">
            <!-- Available Skills / Mark Assessments -->
            <div
                class="col-lg-4 col-md-6 mb-2"
                v-if="userDetailsStore.role != 'editor'"
                :class="{
                    'd-none':
                        userDetailsStore.role == 'instructor' &&
                        assessments.length === 0
                }"
            >
                <div class="hub-component">
                    <StudentProgress
                        v-if="userDetailsStore.role == 'student'"
                        :userId="userDetailsStore.userId"
                    />
                    <MarkAssessment
                        v-else-if="userDetailsStore.role == 'instructor'"
                        :assessments="assessments"
                    />
                </div>
            </div>
            <!-- Last Visited Skills / Student Suggested Questions -->
            <div
                class="col-lg-4 col-md-6 mb-2"
                v-if="userDetailsStore.role != 'editor'"
                :class="{
                    'd-none':
                        userDetailsStore.role == 'instructor' &&
                        questions.length === 0
                }"
            >
                <div class="hub-component">
                    <LastVisitedSkills
                        v-if="userDetailsStore.role == 'student'"
                        :userId="userDetailsStore.userId"
                    />
                    <!-- Student Added Questions List -->
                    <HubStudentQuestionList
                        v-else-if="userDetailsStore.role == 'instructor'"
                        :questions="questions"
                    />
                </div>
            </div>
            <div
                v-if="userDetailsStore.role == 'student'"
                class="col-lg-4 col-md-6 mb-2"
            >
                <div class="hub-component">
                    <Goals />
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-lg-4 col-md-6 mb-2">
                <div class="hub-component">
                    <Notifications />
                </div>
            </div>
        </div>
        <div class="row">
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
