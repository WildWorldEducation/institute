<script setup></script>

<template>
    <div class="container mt-3 pb-3">
        <div class="row">
            <div class="col-10 d-flex align-items-end">
                <h2 id="header-tile">Offer to Tutor</h2>
            </div>
        </div>
        <div class="main-content-container container-fluid p-4">
            <div class="row">
                <div class="col">
                    <div class="mb-3">
                        <label for="first_name" class="form-label"
                            >Describe your tutoring style and experience with
                            the subject</label
                        >
                        <textarea type="text" class="form-control" />
                        <div v-if="1 == 2" class="form-validate">
                            please complete this section!
                        </div>
                    </div>
                    <div class="mb-3">
                        <label for="first_name" class="form-label"
                            >Contact details (email address, phone number
                            etc)</label
                        >
                        <input type="text" class="form-control" />
                        <div v-if="1 == 2" class="form-validate">
                            please enter your contact details!
                        </div>
                    </div>

                    <div class="d-flex justify-content-end gap-4">
                        <router-link class="btn red-btn" to="/users">
                            Cancel
                        </router-link>
                        <button class="btn purple-btn" @click="ValidateForm()">
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style></style>
