<script>
// Import
import router from '../../router';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useUsersStore } from '../../stores/UsersStore';
import { useInstructorStudentsStore } from '../../stores/InstructorStudentsStore';

export default {
  setup() {
    const skillsStore = useSkillsStore();
    const usersStore = useUsersStore();
    const instructorStudentsStore = useInstructorStudentsStore();
    return {
      skillsStore,
      usersStore,
      instructorStudentsStore,
    };
  },
  data() {
    return {
      user: { role: 'student' },
      image: '',
      // To make the first level skills mastered for a new user.
      firstLevelSkillIds: [],
      childrenOfFirstLevelSkillsIds: [],
      // The newly created ID number fo the user, from the DB.
      newUserId: null,
      isValidated: false,
      instructors: [],
      instructorId: 0,
      instructorName: '',
      showDropDown: false,
    };
  },
  async created() {
    // Load all skills.
    if (this.skillsStore.skillsList.length < 1)
      await this.skillsStore.getSkillsList();

    // Find the first level skills - we will make these mastered.
    for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
      if (this.skillsStore.skillsList[i].hierarchy_level == 1) {
        // Add them to the local array.
        this.firstLevelSkillIds.push(this.skillsStore.skillsList[i].id);
      }
    }
    // Find the child skills of the first level skills - we will make these available/unlocked.
    for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
      for (let j = 0; j < this.firstLevelSkillIds.length; j++) {
        if (
          this.skillsStore.skillsList[i].parent == this.firstLevelSkillIds[j]
        ) {
          this.childrenOfFirstLevelSkillsIds.push(
            this.skillsStore.skillsList[i].id
          );
        }
      }
    }
  },
  async mounted() {
    // Run the GET request.
    if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
    this.getInstructors();
  },
  methods: {
    getInstructors() {
      for (let i = 0; i < this.usersStore.users.length; i++) {
        if (this.usersStore.users[i].role == 'instructor') {
          this.instructors.push(this.usersStore.users[i]);
          // if there are no instructor yet we assign one
          if (this.instructorId === 0) {
            this.instructorId = this.usersStore.users[i].id;
            this.instructorName = this.usersStore.users[i].username;
          }
        }
      }
    },
    ValidateForm() {
      if (this.user.first_name == '' || this.user.first_name == null) {
        alert('Please add a first name.');
      } else if (this.user.last_name == '' || this.user.last_name == null) {
        alert('Please add a last name.');
      } else if (this.user.username == '' || this.user.username == null) {
        alert('Please add a username.');
      } else if (this.user.email == '' || this.user.email == null) {
        alert('Please add am email address.');
      } else {
        this.Submit();
      }
    },
    ValidateEmail() {
      if (
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.user.email)
      ) {
      } else {
        alert('Please enter a valid email address');
      }
    },
    Submit() {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: this.user.first_name,
          lastname: this.user.last_name,
          username: this.user.username,
          email: this.user.email,
          avatar: this.user.avatar,
          password: this.user.password,
          role: this.user.role,
        }),
      };
      var url = '/users/add';
      fetch(url, requestOptions)
        .then(function (response) {
          return response.json();
        })
        .then((data) => {
          if (data.account == 'username already taken') {
            alert(data.account);
          } else if (data.account == 'email already taken') {
            alert(data.account);
          } else {
            alert('account created');
            this.usersStore.getUsers();
            router.push({ name: 'users' });
            this.isValidated = true;
          }
          // Get the new user's id number from the DB.
          this.newUserId = data.id;
        })
        .then((data) => {
          if (this.isValidated) {
            // Make all first level skills available
            for (let i = 0; i < this.firstLevelSkillIds.length; i++) {
              var url =
                '/user-skills/accessible/' +
                this.newUserId +
                '/' +
                this.firstLevelSkillIds[i];
              fetch(url);
            }
          }
        })
        .then((data) => {
          if (this.user.role == 'student') {
            const requestOptions = {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                instructor_id: this.instructorId,
                student_id: this.newUserId,
              }),
            };
            var url = '/users/add/instructor';
            fetch(url, requestOptions);
          }
        })
        .then(async (data) => {
          await this.instructorStudentsStore.getInstructorStudentsList();
        });
    },
    // For image upload.
    onFileChange(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      this.createImage(files[0]);
    },
    createImage(file) {
      var image = new Image();
      var reader = new FileReader();
      var vm = this;

      reader.onload = (e) => {
        vm.image = e.target.result;
        this.image = e.target.result;
        this.user.avatar = this.image;
      };
      reader.readAsDataURL(file);
    },
    removeImage: function (e) {
      this.image = '';
      this.user.avatar = this.image;
    },
  },
};
</script>

<template>
  <div class="container mt-3 pb-3">
    <div class="row">
      <div class="col-10 d-flex align-items-end">
        <h2 id="header-tile">Add User</h2>
        <img src="/images/recurso-69.png" id="header-icon" />
      </div>
    </div>
    <div class="main-content-container container-fluid mt-5 p-4">
      <div class="row">
        <div class="col-lg-4">
          <div class="mb-3 row">
            <label class="form-label">Avatar</label>
            <div v-if="!image">
              <input
                id="choose-avatar"
                type="file"
                accept="image/*"
                @change="onFileChange"
                hidden
              />
              <label class="btn green-btn" for="choose-avatar"
                >Add&nbsp;&nbsp;
                <!-- Plus sign -->
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6.34811 20.0423L6.34811 13.6494L-0.0358702 13.6583C-0.320945 13.6579 -0.594203 13.5444 -0.795782 13.3428C-0.997361 13.1412 -1.11082 12.868 -1.11132 12.5829L-1.11729 7.41477C-1.1168 7.1297 -1.00334 6.85644 -0.801757 6.65486C-0.600179 6.45328 -0.326921 6.33982 -0.0418461 6.33933L6.3481 6.34231L6.3481 -0.0506238C6.34659 -0.193451 6.3736 -0.335145 6.42756 -0.467396C6.48152 -0.599646 6.56134 -0.719794 6.66234 -0.820794C6.76334 -0.921794 6.88349 -1.00161 7.01574 -1.05557C7.14799 -1.10953 7.28969 -1.13655 7.43251 -1.13503L12.5827 -1.12308C12.8678 -1.12259 13.141 -1.00913 13.3426 -0.807549C13.5442 -0.60597 13.6577 -0.332713 13.6582 -0.047637L13.6552 6.34231L20.0481 6.34231C20.3325 6.34248 20.6052 6.45552 20.8063 6.65661C21.0074 6.8577 21.1204 7.13039 21.1206 7.41477L21.1325 12.565C21.1324 12.8494 21.0193 13.122 20.8182 13.3231C20.6171 13.5242 20.3444 13.6373 20.0601 13.6374L13.6552 13.6494L13.6641 20.0334C13.6636 20.3184 13.5502 20.5917 13.3486 20.7933C13.147 20.9948 12.8738 21.1083 12.5887 21.1088L7.43252 21.1267C7.28969 21.1282 7.148 21.1012 7.01575 21.0473C6.88349 20.9933 6.76335 20.9135 6.66235 20.8125C6.56135 20.7115 6.48153 20.5913 6.42757 20.4591C6.37361 20.3268 6.34659 20.1851 6.34811 20.0423Z"
                    fill="white"
                  />
                </svg>
              </label>
              <p style="font-size: 14px"><em>Maximum file size 15mb</em></p>
            </div>
            <div v-else>
              <p>
                <img
                  :src="image"
                  height="300"
                  style="background-color: lightgrey"
                />
              </p>
              <p>
                <button class="btn red-btn" @click="removeImage">
                  Remove Image &nbsp;
                  <!-- X icon -->
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0.312625 14.5205L4.83312 9.99999L0.312625 5.49218C0.111396 5.29025 -0.00159545 5.0168 -0.00159545 4.73172C-0.00159545 4.44665 0.111396 4.17319 0.312625 3.97126L3.96282 0.312625C4.16474 0.111396 4.4382 -0.00159545 4.72327 -0.00159545C5.00835 -0.00159545 5.2818 0.111396 5.48373 0.312625L9.99999 4.83312L14.5205 0.312625C14.6204 0.21056 14.7397 0.12947 14.8714 0.0741101C15.003 0.0187502 15.1444 -0.00976563 15.2873 -0.00976562C15.4301 -0.00976563 15.5715 0.0187502 15.7032 0.0741101C15.8349 0.12947 15.9541 0.21056 16.0541 0.312625L19.6874 3.96282C19.8886 4.16474 20.0016 4.4382 20.0016 4.72327C20.0016 5.00835 19.8886 5.2818 19.6874 5.48373L15.1669 9.99999L19.6874 14.5205C19.8883 14.7217 20.0012 14.9944 20.0012 15.2788C20.0012 15.5632 19.8883 15.836 19.6874 16.0372L16.0541 19.6874C15.8529 19.8883 15.5801 20.0012 15.2957 20.0012C15.0113 20.0012 14.7386 19.8883 14.5374 19.6874L9.99999 15.1669L5.49218 19.6874C5.29025 19.8886 5.0168 20.0016 4.73172 20.0016C4.44665 20.0016 4.17319 19.8886 3.97126 19.6874L0.312625 16.0541C0.21056 15.9541 0.12947 15.8349 0.0741101 15.7032C0.0187502 15.5715 -0.00976563 15.4301 -0.00976562 15.2873C-0.00976563 15.1444 0.0187502 15.003 0.0741101 14.8714C0.12947 14.7397 0.21056 14.6204 0.312625 14.5205Z"
                      fill="white"
                    />
                  </svg>
                </button>
              </p>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="mb-3">
            <label for="first_name" class="form-label">First Name</label>
            <input v-model="user.first_name" type="text" class="form-control" />
          </div>
          <div class="mb-3">
            <label for="last_name" class="form-label">Last Name</label>
            <input v-model="user.last_name" type="text" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Username</label>
            <input v-model="user.username" type="text" class="form-control" />
          </div>
          <div class="mb-3">
            <label class="form-label">Email address</label>
            <input
              v-model="user.email"
              type="email"
              class="form-control"
              @blur="ValidateEmail"
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Role</label>
            <select v-model="user.role" class="form-select">
              <option class="form-custom-option" value="student" selected>
                student
              </option>
              <option class="form-custom-option" value="admin">admin</option>
              <option class="form-custom-option" value="instructor">
                instructor
              </option>
            </select>
          </div>
          <div v-if="user.role == 'student'" class="mb-3">
            <label class="form-label">Instructor</label>
            <!-- <select class="form-select" v-model="instructorId">
              <option
                class="form-custom-option"
                v-for="instructor in instructors"
                :value="instructor.id"
              >
                {{ instructor.username }}
              </option>
            </select> -->
            <!-- A custom dropdown -->
            <div class="d-flex flex-column">
              <div
                :class="[
                  showDropDown
                    ? 'custom-select-button-focus'
                    : 'custom-select-button',
                ]"
                @click="showDropDown = !showDropDown"
              >
                {{ instructorName }}
                <span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14.2929 8.70711C14.9229 8.07714 14.4767 7 13.5858 7H6.41421C5.52331 7 5.07714 8.07714 5.70711 8.70711L9.29289 12.2929C9.68342 12.6834 10.3166 12.6834 10.7071 12.2929L14.2929 8.70711Z"
                      fill="#344054"
                    />
                  </svg>
                </span>
              </div>
              <div v-if="showDropDown" class="custom-dropdown-base">
                <div
                  v-for="instructor in instructors"
                  class="custom-dropdown-option"
                  @click="
                    instructorId = instructor.id;
                    instructorName = instructor.username;
                  "
                >
                  {{ instructor.username }}
                </div>
              </div>
            </div>
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input v-model="user.password" type="text" class="form-control" />
          </div>
          <div class="d-flex justify-content-end gap-4">
            <router-link class="btn red-btn" to="/users"> Cancel </router-link>
            <button class="btn purple-btn" @click="ValidateForm()">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.form-control:focus {
  border-color: white;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 12px #a48be6;
}

.form-select {
  cursor: pointer;
}

.form-select:focus {
  border-color: white;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 12px #a48be6;
}

.form-custom-option:active {
  background-color: #a48be6;
}

.main-content-container {
  background-color: #e4ecf4;
  border-radius: 12px;
}

#header-tile {
  color: #667085;
  font-family: 'Poppins' sans-serif;
  font-size: 2.375rem;
  font-weight: 900;
  line-height: 41px;
  letter-spacing: 0em;
  text-align: left;
  margin-top: auto;
  margin-bottom: 0px;
}

#header-icon {
  margin-left: 10px;
  width: 108px;
  height: 61px;
}

.form-label {
  color: #344054;
  font-family: 'Poppins' sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0em;
  text-align: left;
}

.red-btn {
  background-color: #e24d4d;
  color: white;
  border: 1px solid #d33622;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  display: flex;
  align-items: center;
}

.red-btn:hover {
  background-color: #cc3535;
}

.purple-btn {
  background-color: #a48be6;
  color: white;
  border: 1px solid #7f56d9;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  display: flex;
  align-items: center;
}

.green-btn {
  background-color: #36c1af;
  color: white;
  border: 1px solid #2ca695;
  font-family: 'Poppins', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  line-height: 24px;
  display: flex;
  align-items: center;
  height: auto;
  width: fit-content;
}

.green-btn:hover {
  background-color: #3eb3a3;
}
/* Style For The Custom Select */
.custom-select-button {
  width: 100%;
  height: auto;
  padding: 6px 14px 6px 14px;
  border-radius: 8px;
  gap: 8px;
  background: linear-gradient(0deg, #ffffff, #ffffff),
    linear-gradient(0deg, #f2f4f7, #f2f4f7);
  border: 1px solid #f2f4f7;
  box-shadow: 0px 1px 2px 0px #1018280d;
  font-family: 'Poppins' sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: 0.03em;
  text-align: left;
  display: flex;
}

.custom-select-button-focus {
  width: 100%;
  height: auto;
  padding: 6px 14px 6px 14px;
  border-radius: 8px;
  gap: 8px;
  background: linear-gradient(0deg, #ffffff, #ffffff),
    linear-gradient(0deg, #f2f4f7, #f2f4f7);
  border: 1px solid #9c7eec;
  box-shadow: 0px 0px 0px 4px #bca3ff4d;
  font-family: 'Poppins' sans-serif;
  font-size: 1rem;
  font-weight: 400;
  line-height: 22px;
  letter-spacing: 0.03em;
  text-align: left;
  display: flex;
}

.custom-select-button:hover {
  cursor: pointer;
  border: 1px solid #9c7eec;
}

.custom-select-button > span {
  margin-right: 2px;
  margin-left: auto;
  animation: rotationBack 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
}

.custom-select-button-focus > span {
  margin-right: 2px;
  margin-left: auto;
  animation: rotation 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  transform: translate3d(0, 0, 0);
}

/* The animation key frame */
@keyframes rotation {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(180deg);
  }
}

@keyframes rotationBack {
  from {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(0deg);
  }
}

.custom-select-button-focus:hover {
  cursor: pointer;
}
.custom-dropdown-base {
  border-radius: 8px;
  border: 1px;
  background: linear-gradient(0deg, #ffffff, #ffffff);
  border: 1px solid #9c7eec;
  box-shadow: 0px 4px 6px -2px #10182808;
  box-shadow: 0px 12px 16px -4px #10182814;
}

.custom-dropdown-option {
  padding: 10px 14px 10px 14px;
  gap: 8px;
  color: #344054;
}

.custom-dropdown-option:hover {
  cursor: pointer;
  background: #bca3ff1a;
}
/* End of CSS style for Custom Select */
</style>
