<script>
import router from "../../router";
// Import the stores.
import { useUserDetailsStore } from '../../stores/UserDetailsStore'

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        }
    },
    data() {
        return {
            userName: this.userDetailsStore.userName,
            skillTreeTheme: this.userDetailsStore.skillTreeTheme,
            avatar: this.userDetailsStore.avatar,
            image: ''
        }
    },
    computed: {

    },
    methods: {
        ValidateForm() {
            if (this.userDetailsStore.userName == "" || this.userDetailsStore.userName == null) {
                alert("Please add a username.")
            }
            else {
                this.userDetailsStore.updateProfile(this.userName, this.skillTreeTheme, this.avatar);
                this.$router.push("/profile-settings");
            }
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
                this.avatar = this.image;
            };
            reader.readAsDataURL(file);

        },
        removeImage: function (e) {
            this.image = '';
            this.avatar = this.image;
        }
    }
}
</script> 

<template>
    <div class="container mt-3">
        <h1>Edit Profile</h1>
        <div class="mb-3">
            <label class="form-label">Username</label>
            <input v-model="userName" type="text" class="form-control">
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
            <label class="form-label">Theme</label><br>
            <input type="radio" value="light" v-model="skillTreeTheme">
            <label for="light">Light</label><br>
            <input type="radio" value="dark" v-model="skillTreeTheme">
            <label for="dark">Dark</label><br>
        </div>
        <div class="d-flex justify-content-between mb-3">
            <router-link class="btn btn-dark" to="/profile-settings">
                Cancel
            </router-link>
            <button class="btn btn-dark" @click="ValidateForm()">Submit</button>
        </div>
    </div>
</template>


<style scoped></style> 