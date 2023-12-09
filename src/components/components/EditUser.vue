<script>
import router from "../../router";

// Import the users store.
import { useUsersStore } from '../../stores/UsersStore'

export default {
    setup() {
        const usersStore = useUsersStore();

        return {
            usersStore
        }

    },
    data() {
        return {
            userId: this.$route.params.id,
            user: {},
            image: '',
            instructors: [],
            instructorId: null
        };
    },
    async mounted() {
        // Run the GET request.
        if (this.usersStore.users.length < 1)
            await this.usersStore.getUsers()
        this.getInstructors();
    },
    methods: {
        getUser() {
            fetch('/users/show/' + this.userId)
                .then(function (response) {
                    return response.json();
                }).then(data => this.user = data).then(() => {
                    this.image = this.user.avatar
                });
        },
        getInstructors() {
            for (let i = 0; i < this.usersStore.users.length; i++) {
                //console.log(this.usersStore.users[i])
                if (this.usersStore.users[i].role == "instructor") {
                    this.instructors.push(this.usersStore.users[i])
                }
            }

            // Call this after the above, so that instructor field loaded correctly.       
            this.getUser();
        },
        ValidateForm() {
            if (this.user.first_name == "" || this.user.first_name == null) {
                alert("Please add a first name.")
            }
            else if (this.user.last_name == "" || this.user.last_name == null) {
                alert("Please add a last name.")
            }
            else if (this.user.username == "" || this.user.username == null) {
                alert("Please add a username.")
            }
            else if (this.user.email == "" || this.user.email == null) {
                alert("Please add an email address.")
            }
            else {
                this.Submit();
            }
        },
        ValidateEmail() {
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.user.email)) {
            } else {
                alert("Please enter a valid email address")
            }
        },
        Submit() {
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        firstname: this.user.first_name,
                        lastname: this.user.last_name,
                        username: this.user.username,
                        email: this.user.email,
                        avatar: this.user.avatar,
                        role: this.user.role,
                        password: this.user.password,
                    })
            };

            var url = '/users/' + this.userId + '/edit';
            fetch(url, requestOptions)
                .then(() => {
                    if (this.user.role == "student") {
                        const requestOptions = {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(
                                {
                                    instructor_id: this.instructorId,
                                })
                        };
                        var url = '/users/' + this.userId + '/edit/instructor';
                        fetch(url, requestOptions)
                    }
                })
                .then(() => {
                    this.$router.push("/users");
                });
        },
        // For image upload.
        onFileChange(e) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length)
                return;
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
        }
    }
}
</script> 

<template>
    <div class="container mt-3">
        <h1>Edit User</h1>
        <div class="mb-3">
            <label for="firstname" class="form-label">First name {{ firstName }}</label>
            <input v-model="user.first_name" type="text" class="form-control">
        </div>
        <div class="mb-3">
            <label for="lastname" class="form-label">Last name</label>
            <input v-model="user.last_name" type="text" class="form-control">
        </div>
        <div class="mb-3">
            <label class="form-label">Username</label>
            <input v-model="user.username" type="text" class="form-control">
        </div>
        <div class="mb-3">
            <label class="form-label">Email address</label>
            <input v-model="user.email" type="email" class="form-control" @blur="ValidateEmail">
        </div>
        <div class="mb-3 row">
            <label for="avatar" class="form-label">Avatar</label>
            <div v-if="!image">
                <input class="form-control" type="file" accept="image/*" @change="onFileChange">
                <p style="font-size: 14px"><em>Maximum file size 15mb</em></p>
            </div>
            <div v-else>
                <p><img :src="image" height="200" style="background-color: lightgrey" /></p>
                <p><button class="btn btn-warning" @click="removeImage">Remove image</button></p>
            </div>
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
            <input v-model="user.password" type="text" class="form-control">
        </div>

        <button class="btn btn-dark" @click="ValidateForm()">Submit</button>
    </div>
</template>


<style scoped></style> 