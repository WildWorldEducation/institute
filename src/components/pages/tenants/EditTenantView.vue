<script>

export default {
    setup() {
        
        return {
        
        };
    },
    data() {
        return {
            tenantId: this.$route.params.tenantId,
            tenant: {},
                    
        };
    },
   
  
    async mounted() {
        this.getTenant()
    },
    methods: {
        getTenant() {
            fetch('/tenants/show/' + this.tenantId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.tenant = data;
                    // Store original data for comparison
                    this.originalTenant = { ...data };
                    console.log(this.tenant)
                })
               
        },
        ValidateForm() {
            
            if (this.tenant.name != "") {
                this.Submit();
            }
        },
      
        async Submit() {
            let reqBody = {};
            if (this.user.first_name) reqBody.firstname = this.user.first_name;
            if (this.user.last_name) reqBody.lastname = this.user.last_name;
            reqBody.username = this.user.username;

            // Validate email first, and if valid, add it to the request
            if (this.user.email && this.ValidateEmail()) {
                reqBody.email = this.user.email;
            } else if (this.user.email && !this.ValidateEmail()) {
                return; // Stop further processing if email is invalid
            }

            if (this.user.avatar) reqBody.avatar = this.user.avatar;

            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reqBody)
            };

            const url = '/users/' + this.userId + '/instructor/edit';

            try {
                const res = await fetch(url, requestOptions);

                if (!res.ok) {
                    const err = await res.json();

                    // Reset error messages
                    this.errorUsernameMessage = '';
                    this.errorEmailMessage = '';

                    // Display errors if returned by the backend
                    if (err.errors) {
                        if (err.errors.username) {
                            this.errorUsernameMessage = err.errors.username;
                        }
                        if (err.errors.email) {
                            this.errorEmailMessage = err.errors.email;
                        }
                    }

                    return; // Stop further actions if there's an error
                }

                await this.usersStore.getUsers();
                // Update original user data after successful submission
                this.originalUser = { ...this.user };
                this.$router.push('/students');
            } catch (error) {
                console.error(error);
            }
        },
      
    }
};
</script>

<template>
    <div class="container p-1">
        <router-link class="btn red-btn mb-1" to="/students">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 448 512"
                height="20"
                width="20"
                fill="white"
            >
                <path
                    d="M134.1 296H436c6.6 0 12-5.4 12-12v-56c0-6.6-5.4-12-12-12H134.1v-46.1c0-21.4-25.9-32.1-41-17L7 239c-9.4 9.4-9.4 24.6 0 33.9l86.1 86.1c15.1 15.1 41 4.4 41-17V296z"
                />
            </svg>
            &nbsp;Back to tenants
        </router-link>  
        <div class="row">
          
            <!-- Tenant details -->
            <div class="col-12 col-md-6 mb-2">
                <div class="mb-3">
                    <h2 class="secondary-heading h4">Name</h2>
                    <input
                        v-model="tenant.name"
                        type="text"
                        class="form-control"
                    />
                </div>
            

                <div class="">
                    <button
                        class="btn primary-btn"
                        @click="ValidateForm()"
                       
                    >
                        Update tenant details
                    </button>
                </div>
            </div>
        </div>
       
    </div>
  
</template>

<style scoped>

</style>
