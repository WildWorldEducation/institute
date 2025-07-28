<script>
import { useSkillsStore } from '../../../stores/SkillsStore.js';
import { useUserDetailsStore } from '../../../stores/UserDetailsStore.js';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        const userDetailsStore = useUserDetailsStore();
        return {
            skillsStore,
            userDetailsStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.skillId,
            objectiveId: this.$route.params.objectiveId,
            skill: {},
            objective: '',
            originalObjective: '',
            isLoading: true,
            isSubmitting: false,
            errors: []
        };
    },
    async created() {
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }

        // Find the skill by ID
        for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
            if (this.skillId == this.skillsStore.skillsList[i].id) {
                this.skill = this.skillsStore.skillsList[i];
                break;
            }
        }

        await this.loadObjective();
    },
    methods: {
        async loadObjective() {
            this.isLoading = true;
            try {
                const response = await fetch(
                    `/skill-learning-objectives/${this.skillId}/${this.objectiveId}`
                );

                if (response.ok) {
                    const data = await response.json();
                    this.objective = data.objective;
                    this.originalObjective = data.objective;
                } else {
                    const errorData = await response.json();
                    this.errors = [
                        errorData.message || 'Failed to load learning objective'
                    ];
                }
            } catch (error) {
                console.error('Error loading learning objective:', error);
                this.errors = [
                    'An error occurred while loading the learning objective.'
                ];
            } finally {
                this.isLoading = false;
            }
        },

        validateForm() {
            this.errors = [];

            if (!this.objective.trim()) {
                this.errors.push('Learning objective is required');
            }

            if (this.objective.trim().length < 10) {
                this.errors.push(
                    'Learning objective must be at least 10 characters long'
                );
            }

            return this.errors.length === 0;
        },

        async updateObjective() {
            if (!this.validateForm()) {
                return;
            }

            this.isSubmitting = true;

            try {
                const response = await fetch(
                    `/skill-learning-objectives/${this.skillId}/${this.objectiveId}`,
                    {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            objective: this.objective.trim()
                        })
                    }
                );

                const data = await response.json();

                if (response.ok && data.success) {
                    // Redirect back to learning objectives list
                    this.$router.push(
                        `/skills/${this.skill.URL}/learning-objectives`
                    );
                } else {
                    this.errors = [
                        data.message || 'Failed to update learning objective'
                    ];
                }
            } catch (error) {
                console.error('Error updating learning objective:', error);
                this.errors = [
                    'An error occurred while updating the learning objective. Please try again.'
                ];
            } finally {
                this.isSubmitting = false;
            }
        }
    },
    computed: {
        hasChanges() {
            return this.objective.trim() !== this.originalObjective.trim();
        }
    }
};
</script>

<template>
    <div class="row px-2 px-lg-2">
        <div class="col d-flex justify-content-end">
            <!-- Exit Button -->
            <div class="d-flex justify-content-between">
                <a class="btn red-btn" @click="$router.go(-1)"
                    >Exit&ThickSpace;
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 640 512"
                        width="20"
                        height="20"
                        fill="white"
                    >
                        <path
                            d="M208 96a48 48 0 1 0 0-96 48 48 0 1 0 0 96zM123.7 200.5c1-.4 1.9-.8 2.9-1.2l-16.9 63.5c-5.6 21.1-.1 43.6 14.7 59.7l70.7 77.1 22 88.1c4.3 17.1 21.7 27.6 38.8 23.3s27.6-21.7 23.3-38.8l-23-92.1c-1.9-7.8-5.8-14.9-11.2-20.8l-49.5-54 19.3-65.5 9.6 23c4.4 10.6 12.5 19.3 22.8 24.5l26.7 13.3c15.8 7.9 35 1.5 42.9-14.3s1.5-35-14.3-42.9L281 232.7l-15.3-36.8C248.5 154.8 208.3 128 163.7 128c-22.8 0-45.3 4.8-66.1 14l-8 3.5c-32.9 14.6-58.1 42.4-69.4 76.5l-2.6 7.8c-5.6 16.8 3.5 34.9 20.2 40.5s34.9-3.5 40.5-20.2l2.6-7.8c5.7-17.1 18.3-30.9 34.7-38.2l8-3.5zm-30 135.1L68.7 398 9.4 457.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L116.3 441c4.6-4.6 8.2-10.1 10.6-16.1l14.5-36.2-40.7-44.4c-2.5-2.7-4.8-5.6-7-8.6zM550.6 153.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L530.7 224H384c-17.7 0-32 14.3-32 32s14.3 32 32 32H530.7l-25.4 25.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l80-80c12.5-12.5 12.5-32.8 0-45.3l-80-80z"
                        />
                    </svg>
                </a>
            </div>
        </div>
    </div>
    <div class="container bg-light rounded p-3">
        <!-- Page Heading  -->
        <h1 class="heading">{{ skill.name }} - Edit Learning Objective</h1>

        <!-- Loading indicator -->
        <div v-if="isLoading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading learning objective...</p>
        </div>

        <!-- Edit Form -->
        <div v-else class="container-fluid">
            <div class="row justify-content-center">
                <div class="col-12 col-md-8 col-lg-6">
                    <!-- Error Messages -->
                    <div
                        v-if="errors.length > 0"
                        class="alert alert-danger mb-4"
                    >
                        <ul class="mb-0">
                            <li v-for="error in errors" :key="error">
                                {{ error }}
                            </li>
                        </ul>
                    </div>

                    <!-- Form Card -->
                    <div class="edit-form-card bg-white p-4 rounded shadow-sm">
                        <h2 class="secondary-heading mb-3">
                            Learning Objective
                        </h2>

                        <form @submit.prevent="updateObjective">
                            <div class="mb-3">
                                <label for="objective" class="form-label">
                                    Objective Text
                                    <span class="text-danger">*</span>
                                </label>
                                <textarea
                                    id="objective"
                                    v-model="objective"
                                    class="form-control"
                                    rows="4"
                                    placeholder="Enter the learning objective..."
                                    :disabled="isSubmitting"
                                ></textarea>
                                <div class="form-text">
                                    <span class="d-none d-sm-inline">
                                        Describe what students should be able to
                                        do after mastering this skill.
                                    </span>
                                    <span class="d-sm-none">
                                        Describe what students should be able to
                                        do.
                                    </span>
                                </div>
                            </div>

                            <!-- Action Buttons -->
                            <div
                                class="d-flex flex-row justify-content-end gap-2 mt-4"
                            >
                                <button
                                    type="submit"
                                    class="btn primary-btn"
                                    :disabled="
                                        isSubmitting ||
                                        !objective.trim() ||
                                        !hasChanges
                                    "
                                >
                                    <span
                                        v-if="isSubmitting"
                                        class="spinner-border spinner-border-sm me-2"
                                        role="status"
                                    >
                                        <span class="visually-hidden"
                                            >Loading...</span
                                        >
                                    </span>
                                    <span>
                                        {{
                                            isSubmitting
                                                ? 'Updating...'
                                                : 'Update'
                                        }}
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    class="btn red-btn me-2"
                                    @click="$router.go(-1)"
                                    :disabled="isSubmitting"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.edit-form-card {
    border: 1px solid #dee2e6;
}

.form-label {
    font-weight: 600;
    color: #495057;
}

.form-control {
    border-radius: 8px;
    border: 1px solid #ced4da;
    padding: 0.75rem;
    font-size: 1rem;
}

.form-control:focus {
    border-color: #80bdff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-text {
    color: #6c757d;
    font-size: 0.875rem;
}

.text-danger {
    color: #dc3545 !important;
}

.alert {
    border-radius: 8px;
}

/* Mobile responsiveness */
@media (max-width: 575.98px) {
    .container {
        padding-left: 1rem;
        padding-right: 1rem;
    }

    .edit-form-card {
        padding: 1.5rem !important;
    }

    .heading {
        font-size: 1.5rem;
    }

    .btn {
        min-height: 44px;
    }

    .form-control {
        font-size: 1rem;
        min-height: 44px;
    }
}

@media (max-width: 767.98px) {
    .gap-2 {
        gap: 0.75rem !important;
    }
}
</style>
