<script>
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
      userId: this.$route.params.id,
      user: {},
      image: '',
      instructors: [],
      instructorId: null,
    };
  },
  async mounted() {
    // Run the GET request.
    if (this.usersStore.users.length < 1) await this.usersStore.getUsers();

    // Get the instructor student list, if not yet loaded.
    if (this.instructorStudentsStore.instructorStudentsList.length == 0) {
      await this.instructorStudentsStore.getInstructorStudentsList();
    }

    this.getInstructors();
  },
  methods: {
    getUser() {
      fetch('/users/show/' + this.userId)
        .then(function (response) {
          return response.json();
        })
        .then((data) => (this.user = data))
        .then(() => {
          this.image = this.user.avatar;
        });
    },
    getInstructors() {
      // Get an array of all instructors.
      for (let i = 0; i < this.usersStore.users.length; i++) {
        if (this.usersStore.users[i].role == 'instructor') {
          this.instructors.push(this.usersStore.users[i]);
        }
      }
      // To prepopulate the 'instructor' field.
      for (
        let i = 0;
        i < this.instructorStudentsStore.instructorStudentsList.length;
        i++
      ) {
        if (
          this.instructorStudentsStore.instructorStudentsList[i].student_id ==
          this.userId
        ) {
          this.instructorId =
            this.instructorStudentsStore.instructorStudentsList[
              i
            ].instructor_id;
        }
      }

      // Call this after the above, so that instructor field loaded correctly.
      this.getUser();
    },
    ValidateForm() {
      if (this.user.first_name == '' || this.user.first_name == null) {
        alert('Please add a first name.');
      } else if (this.user.last_name == '' || this.user.last_name == null) {
        alert('Please add a last name.');
      } else if (this.user.username == '' || this.user.username == null) {
        alert('Please add a username.');
      } else if (this.user.email == '' || this.user.email == null) {
        alert('Please add an email address.');
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
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstname: this.user.first_name,
          lastname: this.user.last_name,
          username: this.user.username,
          email: this.user.email,
          avatar: this.user.avatar,
          role: this.user.role,
          password: this.user.password,
        }),
      };

      var url = '/users/' + this.userId + '/edit';
      fetch(url, requestOptions)
        .then(() => {
          if (this.user.role == 'student') {
            const requestOptions = {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                instructor_id: this.instructorId,
              }),
            };
            var url = '/users/' + this.userId + '/edit/instructor';
            fetch(url, requestOptions);
          }
        })
        .then(() => {
          this.$router.push('/users');
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
  <div class="container mt-3 pb-5">
    <div class="row">
      <div class="col-10 d-flex align-items-end">
        <h2 id="header-tile">Edit User</h2>
        <img src="/images/recurso-69.png" id="header-icon" />
      </div>
    </div>
    <div class="container-fluid main-content-container p-4 mt-5">
      <div class="row">
        <div class="col-lg-4 mt-3">
          <div class="mb-3 row">
            <div v-if="!image">
              <input
                class="form-control"
                type="file"
                accept="image/*"
                @change="onFileChange"
              />
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
                <button class="btn btn-warning" @click="removeImage">
                  Remove image
                </button>
              </p>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="mb-3">
            <label for="firstname" class="form-label"
              >First name {{ firstName }}</label
            >
            <input v-model="user.first_name" type="text" class="form-control" />
          </div>
          <div class="mb-3">
            <label for="lastname" class="form-label">Last name</label>
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
              <option value="admin">admin</option>
              <option value="instructor">instructor</option>
              <option value="student">student</option>
            </select>
          </div>
          <div v-if="user.role == 'student'" class="mb-3">
            <label class="form-label">Instructor</label>
            <select v-model="instructorId" class="form-select">
              <option v-for="instructor in instructors" :value="instructor.id">
                {{ instructor.username }}
              </option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label">Password</label>
            <input v-model="user.password" type="text" class="form-control" />
          </div>
          <div class="d-flex justify-content-between">
            <router-link class="btn btn-dark" to="/users"> Cancel </router-link>
            <button class="btn btn-dark" @click="ValidateForm()">Submit</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.main-content-container {
  background-color: #e4ecf4;
  border-radius: 12px;
}

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
.form-label {
  color: #344054;
  font-family: 'Poppins' sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0em;
  text-align: left;
}
</style>
