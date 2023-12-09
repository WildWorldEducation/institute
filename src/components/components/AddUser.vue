<script>
// Import
import router from "../../router";
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useUsersStore } from '../../stores/UsersStore'

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const usersStore = useUsersStore();
        return {
            skillsStore, usersStore
        }
    },
    data() {
        return {
            user: {},
            image: '',
            // To make the first level skills mastered for a new user.
            firstLevelSkillIds: [],
            childrenOfFirstLevelSkillsIds: [],
            // The newly created ID number fo the user, from the DB.
            newUserId: null,
            isValidated: false
        }
    },
    async created() {
        // Load all skills.
        if (this.skillsStore.skillsList.length < 1)
            await this.skillsStore.getSkillsList()

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
                if (this.skillsStore.skillsList[i].parent == this.firstLevelSkillIds[j]) {
                    this.childrenOfFirstLevelSkillsIds.push(this.skillsStore.skillsList[i].id);
                }
            }
        }
    },
    methods: {
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
                alert("Please add am email address.")
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
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        firstname: this.user.first_name,
                        lastname: this.user.last_name,
                        username: this.user.username,
                        email: this.user.email,
                        avatar: this.user.avatar,
                        password: this.user.password,
                        role: this.user.role,
                    })
            };
            var url = '/users/add';
            fetch(url, requestOptions)
                .then(function (response) {
                    return response.json()
                })
                .then((data) => {
                    if (data.account == "username already taken") {
                        alert(data.account)
                    }
                    else if (data.account == "email already taken") {
                        alert(data.account)
                    }
                    else {
                        alert('account created')
                        this.usersStore.getUsers()
                        router.push({ name: "users" });
                        this.isValidated = true
                    }
                    // Get the new user's id number from the DB.
                    this.newUserId = data.id;
                })
                .then((data) => {
                    if (this.isValidated) {
                        // Make all first level skills available
                        for (let i = 0; i < this.firstLevelSkillIds.length; i++) {
                            var url = "/user-skills/accessible/" + this.newUserId + "/" + this.firstLevelSkillIds[i];
                            fetch(url)
                        }
                    }
                })
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
        <h1>Add User</h1>
        <div class="row">
            <div class="col-sm-4">
                <div class="mb-3">
                    <label for="first_name" class="form-label">First Name</label>
                    <input v-model="user.first_name" type="text" class="form-control">
                </div>
                <div class="mb-3">
                    <label for="last_name" class="form-label">Last Name</label>
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
                    <label class="form-label">Avatar</label>
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
                <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input v-model="user.password" type="text" class="form-control">
                </div>
                <button class="btn btn-dark" @click="ValidateForm()">Submit</button>
            </div>
        </div>
    </div>
</template>

  
<style scoped></style>