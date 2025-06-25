<script lang="ts">
import { useUserDetailsStore } from '../../stores/UserDetailsStore';
import { useUsersStore } from '../../stores/UsersStore';
import CheckPasswordComplexity from '../components/CheckPasswordComplexity.vue';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {
            userId: this.$route.params.id,
            password: '',
            confirmPassword: '',
            passwordVisible: {
                password: false,
                confirm: false
            },
            validate: {
                password: false,
                confirmPassword: false,
                passwordComplex: false
            },
            updateMessage: '',
            updateSuccess: false
        };
    },
    components: {
        CheckPasswordComplexity
    },
    computed: {
        // Check if passwords match
        passwordsMatch() {
            return this.password === this.confirmPassword;
        },
        // Check if form is valid
        isFormValid() {
            const hasAllFields = this.password && this.confirmPassword;
            const passwordsMatch = this.passwordsMatch;
            const hasMinLength = this.password.length >= 8;

            return hasAllFields && passwordsMatch && hasMinLength;
        }
    },
    watch: {
        // Watch for password confirmation changes
        confirmPassword() {
            this.validatePasswordMatch();
        },
        password() {
            this.validatePasswordMatch();
        }
    },
    methods: {
        validatePasswordMatch() {
            // Only validate if both fields have content
            if (this.confirmPassword && this.password) {
                // This will trigger visual feedback but won't set validation error
                return this.passwordsMatch;
            }
        },
        validateForm() {
            let isValid = true;

            // Reset validation
            this.validate.password = false;
            this.validate.confirmPassword = false;

            // Validate password
            if (!this.password) {
                this.validate.password = true;
                isValid = false;
            }

            // Validate confirm password
            if (!this.confirmPassword) {
                this.validate.confirmPassword = true;
                isValid = false;
            }

            // Check if passwords match
            if (!this.passwordsMatch) {
                isValid = false;
            }

            return isValid && this.validate.passwordComplex;
        },
        async ValidatePassword() {
            if (!this.validateForm()) {
                return;
            }

            this.HandlePasswordUpdate();
        },
        async HandlePasswordUpdate() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    password: this.password
                })
            };

            try {
                const response = await fetch(
                    '/users/' + this.userId + '/edit-student-password',
                    requestOptions
                );
                const data = await response.json();

                if (response.ok) {
                    this.updateSuccess = true;
                    this.updateMessage =
                        'Student password updated successfully!';

                    // Redirect after showing success message
                    setTimeout(() => {
                        this.$router.push('/students');
                    }, 1500);
                } else {
                    this.updateSuccess = false;
                    this.updateMessage =
                        data.error || 'Failed to update password';
                }
            } catch (error) {
                this.updateSuccess = false;
                this.updateMessage =
                    'An error occurred while updating password';
                console.error('Password update error:', error);
            }
        },
        togglePasswordVisibility(field) {
            this.passwordVisible[field] = !this.passwordVisible[field];
        }
    }
};
</script>

<template>
    <div class="container d-flex row mt-3">
        <!-- Success/Error Message -->
        <div
            v-if="updateMessage"
            :class="[
                'alert',
                updateSuccess ? 'alert-success' : 'alert-danger',
                'mb-3'
            ]"
        >
            {{ updateMessage }}
        </div>

        <!-- Password Section -->
        <h2 class="secondary-heading h4">Update Student Password</h2>

        <!-- New Password -->
        <div class="mb-3">
            <label class="form-label">New Password</label>
            <div class="password-div">
                <input
                    v-model="password"
                    :type="passwordVisible.password ? 'text' : 'password'"
                    placeholder="Enter new password"
                    class="form-control"
                    :class="{ 'is-invalid': validate.password }"
                    required
                />
                <!-- Show and Hide Password Section -->
                <div
                    class="eye-icon"
                    b-tooltip.hover
                    :title="
                        passwordVisible.password
                            ? 'hide password'
                            : 'show password'
                    "
                    @click="togglePasswordVisibility('password')"
                >
                    <!-- Eye Icon -->
                    <svg
                        v-if="passwordVisible.password"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 576 512"
                        width="20"
                        height="20"
                        fill="gray"
                    >
                        <path
                            d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"
                        />
                    </svg>
                    <!-- Eye Slash Icon -->
                    <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 512"
                        width="20"
                        height="20"
                        fill="gray"
                    >
                        <path
                            d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm51.3 163.3l-41.9-33C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5zm-88-69.3L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8z"
                        />
                    </svg>
                </div>
            </div>
            <div v-if="validate.password" class="form-validate">
                Please enter a new password
            </div>
            <!-- Password Complexity Check -->
            <CheckPasswordComplexity
                :formData="{
                    password: password
                }"
            />
        </div>

        <!-- Confirm Password -->
        <div class="mb-3">
            <label class="form-label">Confirm New Password</label>
            <div class="password-div">
                <input
                    v-model="confirmPassword"
                    :type="passwordVisible.confirm ? 'text' : 'password'"
                    placeholder="Confirm new password"
                    class="form-control"
                    :class="{
                        'is-invalid':
                            validate.confirmPassword ||
                            (!passwordsMatch && confirmPassword)
                    }"
                />
                <div
                    class="eye-icon"
                    b-tooltip.hover
                    :title="
                        passwordVisible.confirm
                            ? 'hide password'
                            : 'show password'
                    "
                    @click="togglePasswordVisibility('confirm')"
                >
                    <!-- Eye Icon -->
                    <svg
                        v-if="passwordVisible.confirm"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 576 512"
                        width="20"
                        height="20"
                        fill="gray"
                    >
                        <path
                            d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"
                        />
                    </svg>
                    <!-- Eye Slash Icon -->
                    <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 512"
                        width="20"
                        height="20"
                        fill="gray"
                    >
                        <path
                            d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm51.3 163.3l-41.9-33C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5zm-88-69.3L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8z"
                        />
                    </svg>
                </div>
            </div>
            <div v-if="validate.confirmPassword" class="form-validate">
                Please confirm the new password
            </div>
            <div
                v-if="!passwordsMatch && confirmPassword"
                class="form-validate"
            >
                Passwords do not match
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="d-flex justify-content-between mb-3 mt-2">
            <router-link class="btn red-btn" to="/students">
                Cancel
            </router-link>
            <button
                class="btn primary-btn"
                @click="ValidatePassword()"
                :disabled="!isFormValid"
            >
                Update Password
            </button>
        </div>
    </div>
</template>

<style scoped>
.password-div {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.eye-icon {
    position: absolute;
    right: 20px;
}

.eye-icon:hover {
    cursor: pointer;
}

.form-control {
    border: 1px solid #f2f4f7;
    box-shadow: 0px 1px 2px 0px #1018280d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    color: black;
}

.form-control.is-invalid {
    border-color: #dc3545;
}

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
    margin-top: 4px;
}

.form-label {
    font-weight: 500;
    margin-bottom: 6px;
    color: #374151;
}

/* Enhanced Alert styles with better visual feedback */
.alert {
    padding: 16px 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-weight: 500;
    border: 2px solid;
    display: flex;
    align-items: center;
    gap: 8px;
}

.alert-success {
    background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
    border-color: #10b981;
    color: #065f46;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15);
}

.alert-danger {
    background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
    border-color: #ef4444;
    color: #991b1b;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15);
}
</style>
