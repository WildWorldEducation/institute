<script>
import UsersList from '../components/UsersList.vue';
import UserDetails from '../components/UserDetails.vue';
import WriteMessage from '../components/WriteMessage.vue';

// Import the users store.
import { useUsersStore } from '../../stores/UsersStore';
import { useInstructorStudentsStore } from '../../stores/InstructorStudentsStore';

export default {
  setup() {
    const usersStore = useUsersStore();
    const instructorStudentsStore = useInstructorStudentsStore();
    return {
      usersStore,
      instructorStudentsStore,
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
      },
      // Only for users with the "student" role.
      instructor: null,
      // Flag to show user details when in phone view
      showDetails: false,
    };
  },
  components: {
    UsersList,
    UserDetails,
    WriteMessage,
  },
  async created() {
    // Set up the first user in the array to be selected on the page initially.
    if (this.usersStore.users.length < 1) await this.usersStore.getUsers();

    this.user.id = this.usersStore.users[0].id;
    this.user.firstName = this.usersStore.users[0].first_name;
    this.user.lastName = this.usersStore.users[0].last_name;
    this.user.username = this.usersStore.users[0].username;
    this.user.email = this.usersStore.users[0].email;
    this.user.avatar = this.usersStore.users[0].avatar;
    this.user.role = this.usersStore.users[0].role;

    // Get the instructor student list, if not yet loaded.
    if (this.instructorStudentsStore.instructorStudentsList.length == 0) {
      await this.instructorStudentsStore.getInstructorStudentsList();
    }
  },
  methods: {
    changeUserId(user) {
      this.user.id = user.id;
      this.user.firstName = user.first_name;
      this.user.lastName = user.last_name;
      this.user.username = user.username;
      this.user.email = user.email;
      this.user.avatar = user.avatar;
      this.user.role = user.role;
      // turn on the show details flag
      this.showDetails = true;
      if (this.user.role == 'student') this.getInstructor();
    },
    turnOffDetailsPopup() {},
    getInstructor() {
      // Get the instructor's user id.
      var instructorId;
      for (
        let i = 0;
        i < this.instructorStudentsStore.instructorStudentsList.length;
        i++
      ) {
        if (
          this.instructorStudentsStore.instructorStudentsList[i].student_id ==
          this.user.id
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
  },
};
</script>

<template>
  <div id="banner">
    <img src="/images/banners/students-banner.png" class="img-fluid" />
  </div>
  <div id="first-content-row" class="d-flex justify-content-between">
    <router-link class="btn purple-btn" to="/users/add"
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
    <router-link class="btn purple-btn" :to="'/user-skills/edit/' + user.id"
      >Edit Skill Mastery
    </router-link>
  </div>
  <div id="user-container" class="container-fluid">
    <div class="row position-relative">
      <div class="col-md-4">
        <UsersList @changeUserId="changeUserId($event)" />
      </div>
      <!-- User detail view for PC and Tablet View -->
      <div class="col-md-7 d-none d-md-block">
        <div class="row">
          <UserDetails :userId="user.id" :userRole="user.role" />
        </div>
        <div class="row">
          <WriteMessage :userId="user.id" />
        </div>
      </div>
      <!-- User detail view specific for phone -->
      <div
        v-if="showDetails"
        class="col-md-7 d-block d-md-none"
        id="user-detail-section"
      >
        <div class="row">
          <UserDetails :userId="user.id" :userRole="user.role" />
        </div>
        <div class="row">
          <WriteMessage :userId="user.id" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.purple-btn {
  background-color: #a48be6;
  color: white;
  border: 1px solid #7f56d9;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  display: flex;
  align-items: center;
  max-width: fit-content;
}

.purple-btn:hover {
  background-color: #7f56d9 !important;
}

#first-content-row {
  margin-top: -10px;
  padding-left: 46px;
  padding-top: 16px;
  padding-bottom: 17px;
  padding-right: 46px;
  height: 77px;
  background-color: rgb(164, 139, 230, 0.25);
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

  /* In the figma design I think in mobile the use detail will be a popup */
  #user-detail-section {
    position: absolute;
    top: -10px;
  }
}

/* Tablets */
@media (min-width: 481px) and (max-width: 1024px) {
}
</style>
