<script>
// Import the store.
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useTagsStore } from '../../stores/TagsStore';
import { useSkillTagsStore } from '../../stores/SkillTagsStore';
import { useRouter } from 'vue-router';
export default {
    setup() {
        const skillsStore = useSkillsStore();
        const tagsStore = useTagsStore();
        if (tagsStore.tagsList.length == 0) tagsStore.getTagsList();
        const skillTagsStore = useSkillTagsStore();
        const router = useRouter();
        return {
            skillsStore,
            tagsStore,
            skillTagsStore,
            router
        };
    },
    data() {
        return {
            skillId: this.$route.params.id,
            skills: [],
            skill: {
                id: '',
                name: '',
                parent: '',
                description: '',
                icon_image: '',
                banner_image: '',
                mastery_requirements: '',
                tags: [],
                type: null,
                level: null
            },
            filterChecked: false,
            iconImage: '',
            bannerImage: '',
            superSkills: [],
            levels: [
                {
                    id: 'grade_school',
                    name: 'Grade school'
                },
                {
                    id: 'middle_school',
                    name: 'Middle school'
                },
                {
                    id: 'high_school',
                    name: 'High school'
                },
                {
                    id: 'college',
                    name: 'College'
                },
                {
                    id: 'phd',
                    name: 'PhD'
                }
            ],
            // Input relate variable
            showDropDown: false,
            showLevel: '',
            parentInput: {
                inputText: '',
                suggestSkills: []
            },
            clusterParentInput: {
                inputText: '',
                suggestSuperSkills: []
            },
            // Validate Object for validate purpose
            validate: {
                violated: false,
                name: false,
                description: false,
                orphan: false,
                superValidate: false,
                noChild: false
            },
            filters: [],
            // A flag to determine if delete button is hover or not
            deleteButtonHover: false,
            // modals relate states
            showModal: false,
            step1Confirm: false,
            skillNameConfirm: '',
            step2Confirm: false
        };
    },
    async mounted() {
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }

        this.getParentSkills();
    },
    methods: {
        getParentSkills() {
            for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                if (this.skillsStore.skillsList[i].id != this.skillId) {
                    if (this.skillsStore.skillsList[i].type == 'super') {
                        this.superSkills.push(this.skillsStore.skillsList[i]);
                    }
                    if (this.skillsStore.skillsList[i].type != 'sub') {
                        this.skills.push(this.skillsStore.skillsList[i]);
                    }
                }
            }
            // Call this after the above, so that parent field loaded correctly.
            this.getSkill();
        },
        getSkill() {
            fetch('/skills/show/' + this.skillId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.skill = data;
                })
                .then(() => {
                    this.iconImage = this.skill.icon_image;
                    this.bannerImage = this.skill.banner_image;
                    $('#summernote').summernote(
                        'code',
                        this.skill.mastery_requirements
                    );
                    // Levels
                    if (this.skill.level != 'domain') {
                        const skillResult = this.levels.find((level) => {
                            return level.id === this.skill.level;
                        });
                        this.showLevel = skillResult.name;
                    }

                    // Parent skill
                    if (this.skill.parent != 0) {
                        const parentResult = this.skills.find((element) => {
                            return element.id === this.skill.parent;
                        });
                        this.parentInput.inputText = parentResult.name;
                    }

                    this.getSkillFilters();
                });
        },
        async getSkillFilters() {
            // Run the GET request.
            if (this.skillTagsStore.skillTagsList.length == 0)
                await this.skillTagsStore.getSkillTagsList();

            for (let i = 0; i < this.skillTagsStore.skillTagsList.length; i++) {
                if (
                    this.skillTagsStore.skillTagsList[i].skill_id ==
                    this.skillId
                ) {
                    this.filters.push(
                        this.skillTagsStore.skillTagsList[i].tag_id
                    );
                }
            }
        },
        async DeleteSkill(id) {
            // check confirm state
            if (!this.step1Confirm || !this.step2Confirm) {
                return;
            }

            await this.skillsStore.deleteSkill(id);
            // redirect user back to skill list page
            this.router.push('/skills');
        },
        // For image upload.
        onFileChange(e, type) {
            var files = e.target.files || e.dataTransfer.files;
            if (!files.length) return;
            this.createImage(files[0], type);
        },
        createImage(file, type) {
            var image = new Image();
            var reader = new FileReader();
            var vm = this;

            reader.onload = (e) => {
                vm.image = e.target.result;
                if (type == 'icon') {
                    this.iconImage = e.target.result;
                    this.skill.icon_image = this.iconImage;
                } else {
                    this.bannerImage = e.target.result;
                    this.skill.banner_image = this.bannerImage;
                }
            };
            reader.readAsDataURL(file);
        },
        openImage(elName) {
            // find the file input base on id and manually click them
            const input = document.getElementById(elName);
            input.click();
        },
        // New delete image method
        deleteImage(type) {
            switch (type) {
                case 'icon':
                    this.iconImage = '';
                    break;

                default:
                    this.bannerImage = '';
                    break;
            }
        },
        SubmitFilters() {
            // 1 delete the existing filters.
            fetch('/skill-tags/remove/' + this.skillId, {
                method: 'DELETE'
                // 2 push the new filters.
            }).then(() => {
                var url = '/skill-tags/add/' + this.skillId;
                // do stuff with `data`, call second `fetch`
                fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filters: this.filters
                    })
                });
            });
        },
        Submit() {
            // Check if this skill was a super skill with skills, and is being changed to another type.
            if (this.skill.type != 'super') {
                var hasSubSkills = false;
                for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                    if (
                        this.skillsStore.skillsList[i].type == 'sub' &&
                        this.skillsStore.skillsList[i].parent == this.skillId
                    ) {
                        hasSubSkills = true;
                    }
                }
                if (hasSubSkills) {
                    this.validate.superValidate = true;
                    this.validate.violated = true;
                    alert(
                        'Please delete outer cluster nodes belonging to the skill, before changing its type.'
                    );
                }
            }
            // Domains cant get filters or levels.
            if (this.skill.type == 'domain') {
                this.skill.level = 'domain';

                // For subskills.
            } else if (this.skill.type == 'sub') {
                // Make sure user has assigned a parent skill.
                if (this.skill.parent == 0) {
                    this.validate.orphan = true;
                    this.validate.violated = true;
                    alert('cluster nodes must have a parent');
                }
                for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                    // Copy the level from the parent node.
                    if (
                        this.skill.parent == this.skillsStore.skillsList[i].id
                    ) {
                        this.skill.level = this.skillsStore.skillsList[i].level;
                    }
                    // Cant change a skill to be a sub skill, while it has its own child skills.
                    if (this.skillsStore.skillsList[i].parent == this.skillId) {
                        this.validate.noChild = true;
                        this.validate.violated = true;
                        alert(
                            "please delete this node's child skills, before changing it to a cluster child skill"
                        );
                    }
                }
            }

            if (this.skill.type != 'domain') {
                // Update the skill.
                this.skill.mastery_requirements =
                    $('#summernote').summernote('code');
            }

            if (this.skill.name === '' || this.skill.name === null) {
                this.validate.name = true;
                this.validate.violated = true;
                alert('please enter a skill name');
            }

            // We End function here if any of the validate is violated
            if (this.validate.violated) {
                return;
            }
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: this.skill.name,
                    parent: this.skill.parent,
                    description: this.skill.description,
                    icon_image: this.skill.icon_image,
                    banner_image: this.skill.banner_image,
                    mastery_requirements: this.skill.mastery_requirements,
                    type: this.skill.type,
                    level: this.skill.level
                })
            };

            var url = '/skills/' + this.skillId + '/edit';
            fetch(url, requestOptions)
                .then(() => {
                    this.skillsStore.getNestedSkillsList();
                    this.SubmitFilters();
                })
                .then(() => {
                    this.$router.push('/skills');
                });
        },
        handleChooseSkillLevel(level) {
            this.showDropDown = false;
            this.showLevel = level.name;
            this.skill.level = level.id;
        },
        // 2 Method that handle parent dropdown
        getReferenceSkill() {
            // Only show the suggestion if the user type in 2 word
            if (this.parentInput.inputText.length < 2) {
                this.parentInput.suggestSkills = [];
            } else {
                this.parentInput.suggestSkills = this.skills.filter((skill) => {
                    // Lower case so the result wont be case sensitive
                    return skill.name
                        .toLowerCase()
                        .includes(this.parentInput.inputText.toLowerCase());
                });
            }
        },
        handleChooseSuggestSkill(skill) {
            //turn off the suggestion drop down
            this.parentInput.suggestSkills = [];
            // set form data
            this.skill.parent = skill.id;
            // set input text
            this.parentInput.inputText = skill.name;
        },
        // -----------------------------------------
        // 2 method for cluster outer skill type input
        getSuperSkillSuggestion() {
            // Only show the suggestion if the user type in 2 word
            if (this.clusterParentInput.inputText.length < 2) {
                this.clusterParentInput.suggestSuperSkills = [];
            } else {
                this.clusterParentInput.suggestSuperSkills =
                    this.superSkills.filter((skill) => {
                        // Lower case so the result wont be case sensitive
                        return skill.name
                            .toLowerCase()
                            .includes(
                                this.clusterParentInput.inputText.toLowerCase()
                            );
                    });
            }
        },
        handleChooseSuperSkill(skill) {
            this.clusterParentInput.suggestSuperSkills = [];
            this.skill.parent = skill.id;
            this.clusterParentInput.inputText = skill.name;
        },
        handleCancelDeleteSkill() {
            this.showModal = false;
            this.step1Confirm = false;
            this.step2Confirm = false;
            this.skillNameConfirm = '';
        },
        handleConfirmInputChange() {
            if (this.skillNameConfirm == this.skill.name) {
                this.step2Confirm = true;
            } else {
                this.step2Confirm = false;
            }
        }
    }
};
</script>

<template>
    <div class="container mt-4 pb-5 px-3 px-md-0">
        <!-- Page Tile -->
        <div class="row mt-5">
            <div
                class="col-12 col-md-10 col-lg-5 d-flex align-items-baseline gap-3 mt-3"
            >
                <h1 id="page-tile">Edit Skill</h1>
                <img src="/images/recurso-69.png" id="header-icon" />
            </div>
        </div>
        <!-- Skill name -->
        <div class="row mt-5">
            <div class="col-12 col-md-8 col-lg-5 mt-2">
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input
                        v-model="skill.name"
                        class="form-control"
                        type="text"
                        placeholder="name"
                    />
                    <div
                        v-if="
                            validate.name &&
                            (skill.name == '' || skill.name == null)
                        "
                        class="form-validate"
                    >
                        please enter a skill name
                    </div>
                </div>
            </div>
        </div>
        <!-- Skill level dropdown -->
        <div class="row">
            <div v-if="skill.type != 'domain' && skill.type != 'sub'">
                <div class="col col-md-8 col-lg-5 mt-2">
                    <!-- Custom Dropdown -->
                    <label class="form-label">Level</label>
                    <div class="d-flex flex-column position-relative">
                        <div
                            :class="[
                                showDropDown
                                    ? 'custom-select-button-focus '
                                    : 'custom-select-button '
                            ]"
                            @click="showDropDown = !showDropDown"
                        >
                            {{ showLevel }}
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
                                v-for="level in levels"
                                class="custom-dropdown-option"
                                @click="handleChooseSkillLevel(level)"
                            >
                                {{ level.name }}
                            </div>
                        </div>
                    </div>
                    <!-- End of custom dropdown -->
                </div>
            </div>
        </div>
        <!-- Skill Filter Checker -->
        <div class="row">
            <div class="col col-md-8 col-lg-5 mt-2">
                <div v-if="skill.type != 'sub'">
                    <label class="form-label">Filters</label>
                    <div class="col">
                        <label
                            v-for="tag in tagsStore.tagsList"
                            class="control control-checkbox"
                        >
                            <span class="my-auto mx-2 me-4">
                                {{ tag.name }}</span
                            >
                            <input
                                type="checkbox"
                                :value="tag.id"
                                v-model="filters"
                            />
                            <div class="control_indicator"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <!-- Skills Types Radio choose -->
        <div class="row">
            <div class="col-12 col-md-8 col-lg-5 mt-2">
                <label class="form-label">Node Type</label>
                <div class="row p-0 m-0">
                    <div class="form-check col-6 col-md-5 my-2">
                        <label class="control control-checkbox">
                            <span class="my-auto mx-2 me-4">Regular</span>
                            <input
                                type="radio"
                                name="nodeType"
                                id="regularSkillRadio"
                                value="regular"
                                v-model="skill.type"
                            />
                            <div class="control_indicator"></div>
                        </label>
                    </div>
                    <div class="form-check col-6 col-md-5 my-2">
                        <label class="control control-checkbox">
                            <span class="my-auto mx-2 me-4">Pass-through</span>
                            <input
                                type="radio"
                                name="nodeType"
                                id="domainSkillRadio"
                                value="domain"
                                v-model="skill.type"
                            />
                            <div class="control_indicator"></div>
                        </label>
                    </div>
                    <div class="form-check col-6 col-md-5 my-2">
                        <label class="control control-checkbox">
                            <span class="my-auto mx-2 me-4"
                                >Cluster node center</span
                            >
                            <input
                                type="radio"
                                name="nodeType"
                                id="superSkillRadio"
                                value="super"
                                v-model="skill.type"
                            />
                            <div class="control_indicator"></div>
                        </label>
                    </div>
                    <div class="form-check col-6 col-md-5 my-2">
                        <label class="control control-checkbox">
                            <span class="my-auto mx-2 me-4"
                                >Cluster node outer</span
                            >
                            <input
                                type="radio"
                                name="nodeType"
                                id="regularSkillRadio"
                                value="sub"
                                v-model="skill.type"
                            />
                            <div class="control_indicator"></div>
                        </label>
                    </div>
                </div>
                <div
                    v-if="
                        validate.orphan &&
                        this.skill.type == 'sub' &&
                        this.skill.parent == 0
                    "
                    class="form-validate"
                >
                    please choose a parent for this skill
                </div>
                <div
                    v-if="validate.noChild && this.skill.type == 'sub'"
                    class="form-validate"
                >
                    please delete this node's child skills, before changing it
                    to a cluster child skill
                </div>
            </div>
        </div>
        <!-- Parent Typing Dropdown -->
        <div class="row">
            <div class="col-12 col-md-8 col-lg-5 mt-2">
                <div v-if="skill.type != 'sub'" class="mb-3">
                    <label class="form-label">Parent</label>
                    <div class="row mt-3">
                        <div class="col position-relative">
                            <input
                                id="skill-input"
                                v-model="parentInput.inputText"
                                @input="getReferenceSkill"
                                placeholder="type skill name"
                            />
                            <div
                                v-if="parentInput.suggestSkills.length > 0"
                                id="suggest-skills"
                                class="flex flex-column position-absolute"
                            >
                                <div
                                    class="suggest-option"
                                    v-for="skill in parentInput.suggestSkills"
                                    @click="handleChooseSuggestSkill(skill)"
                                >
                                    {{ skill.name }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- -------------------------------------------------- -->
                <div v-else class="mb-3">
                    <label class="form-label">Cluster node center</label>
                    <div class="row mt-3">
                        <div class="col position-relative">
                            <input
                                id="skill-input"
                                v-model="clusterParentInput.inputText"
                                @input="getSuperSkillSuggestion"
                                placeholder="type skill name"
                            />
                            <div
                                v-if="
                                    clusterParentInput.suggestSuperSkills
                                        .length > 0
                                "
                                id="suggest-skills"
                                class="flex flex-column position-absolute"
                            >
                                <div
                                    class="suggest-option"
                                    v-for="skill in clusterParentInput.suggestSuperSkills"
                                    @click="handleChooseSuggestSkill(skill)"
                                >
                                    {{ skill.name }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Icon and Banner -->
        <div class="row">
            <!-- Icon chooser -->
            <div class="col-8 col-md-3 col-lg-2 mt-2">
                <div
                    class="mb-3 row d-flex justify-content-center justify-content-md-start w-100"
                >
                    <label for="image" class="form-label">Icon</label>
                    <div v-if="!iconImage">
                        <input
                            class="form-control d-none"
                            type="file"
                            accept="image/*"
                            @change="onFileChange($event, 'icon')"
                            id="iconFileChoose"
                        />
                        <div class="default-no-img">
                            <div
                                class="plus-svg"
                                @click="openImage('iconFileChoose')"
                            >
                                <!-- The plus Icon On Top Of the avatar -->
                                <svg
                                    width="33"
                                    height="33"
                                    viewBox="0 0 53 53"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle
                                        cx="26.5"
                                        cy="26.5"
                                        r="26.5"
                                        fill="#D9D9D9"
                                    />
                                    <g clip-path="url(#clip0_372_11959)">
                                        <path
                                            d="M19.7439 45.0784L19.7439 33.2515L7.93354 33.268C7.40615 33.2671 6.90063 33.0572 6.52771 32.6843C6.15479 32.3114 5.94488 31.8059 5.94396 31.2785L5.93291 21.7174C5.93382 21.1901 6.14373 20.6845 6.51665 20.3116C6.88957 19.9387 7.3951 19.7288 7.92249 19.7279L19.7439 19.7334L19.7439 7.90646C19.7411 7.64223 19.7911 7.38009 19.8909 7.13543C19.9907 6.89076 20.1384 6.66849 20.3252 6.48164C20.5121 6.29479 20.7344 6.14713 20.979 6.0473C21.2237 5.94747 21.4858 5.8975 21.75 5.9003L31.2779 5.92241C31.8053 5.92332 32.3108 6.13322 32.6838 6.50615C33.0567 6.87907 33.2666 7.38459 33.2675 7.91198L33.262 19.7334L45.0889 19.7334C45.615 19.7337 46.1195 19.9428 46.4915 20.3148C46.8635 20.6869 47.0726 21.1913 47.073 21.7174L47.0951 31.2453C47.0948 31.7714 46.8856 32.2759 46.5136 32.6479C46.1416 33.0199 45.6371 33.229 45.111 33.2294L33.262 33.2515L33.2786 45.0618C33.2776 45.5892 33.0677 46.0947 32.6948 46.4677C32.3219 46.8406 31.8164 47.0505 31.289 47.0514L21.7501 47.0846C21.4858 47.0874 21.2237 47.0374 20.979 46.9376C20.7344 46.8377 20.5121 46.6901 20.3252 46.5032C20.1384 46.3164 19.9907 46.0941 19.8909 45.8494C19.7911 45.6048 19.7411 45.3426 19.7439 45.0784Z"
                                            fill="white"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_372_11959">
                                            <rect
                                                width="37"
                                                height="37"
                                                fill="white"
                                                transform="translate(8 8)"
                                            />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                        <p style="font-size: 14px">
                            <em>Maximum file size 15mb</em>
                        </p>
                    </div>
                    <div v-else>
                        <p>
                            <img
                                :src="iconImage"
                                height="158"
                                width="158"
                                style="background-color: lightgrey"
                            />
                        </p>
                        <p>
                            <button
                                class="btn red-btn"
                                @click="deleteImage('icon')"
                            >
                                Remove &nbsp;&nbsp;
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 448 512"
                                    width="20"
                                    height="20"
                                    fill="white"
                                >
                                    <path
                                        d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
                                    />
                                </svg>
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            <!-- Banner chooser -->
            <div class="col-12 col-lg-10 mt-2">
                <div class="mb-3 row">
                    <label for="image" class="form-label">Banner</label>
                    <div v-if="!bannerImage">
                        <input
                            class="form-control d-none"
                            type="file"
                            accept="image/*"
                            @change="onFileChange($event, 'banner')"
                            id="bannerFileChoose"
                        />
                        <div class="default-no-img">
                            <div
                                class="plus-svg"
                                @click="openImage('bannerFileChoose')"
                            >
                                <!-- The plus Icon On Top Of the avatar -->
                                <svg
                                    width="33"
                                    height="33"
                                    viewBox="0 0 53 53"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <circle
                                        cx="26.5"
                                        cy="26.5"
                                        r="26.5"
                                        fill="#D9D9D9"
                                    />
                                    <g clip-path="url(#clip0_372_11959)">
                                        <path
                                            d="M19.7439 45.0784L19.7439 33.2515L7.93354 33.268C7.40615 33.2671 6.90063 33.0572 6.52771 32.6843C6.15479 32.3114 5.94488 31.8059 5.94396 31.2785L5.93291 21.7174C5.93382 21.1901 6.14373 20.6845 6.51665 20.3116C6.88957 19.9387 7.3951 19.7288 7.92249 19.7279L19.7439 19.7334L19.7439 7.90646C19.7411 7.64223 19.7911 7.38009 19.8909 7.13543C19.9907 6.89076 20.1384 6.66849 20.3252 6.48164C20.5121 6.29479 20.7344 6.14713 20.979 6.0473C21.2237 5.94747 21.4858 5.8975 21.75 5.9003L31.2779 5.92241C31.8053 5.92332 32.3108 6.13322 32.6838 6.50615C33.0567 6.87907 33.2666 7.38459 33.2675 7.91198L33.262 19.7334L45.0889 19.7334C45.615 19.7337 46.1195 19.9428 46.4915 20.3148C46.8635 20.6869 47.0726 21.1913 47.073 21.7174L47.0951 31.2453C47.0948 31.7714 46.8856 32.2759 46.5136 32.6479C46.1416 33.0199 45.6371 33.229 45.111 33.2294L33.262 33.2515L33.2786 45.0618C33.2776 45.5892 33.0677 46.0947 32.6948 46.4677C32.3219 46.8406 31.8164 47.0505 31.289 47.0514L21.7501 47.0846C21.4858 47.0874 21.2237 47.0374 20.979 46.9376C20.7344 46.8377 20.5121 46.6901 20.3252 46.5032C20.1384 46.3164 19.9907 46.0941 19.8909 45.8494C19.7911 45.6048 19.7411 45.3426 19.7439 45.0784Z"
                                            fill="white"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_372_11959">
                                            <rect
                                                width="37"
                                                height="37"
                                                fill="white"
                                                transform="translate(8 8)"
                                            />
                                        </clipPath>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                        <p style="font-size: 14px">
                            <em>Maximum file size 15mb</em>
                        </p>
                    </div>
                    <div v-else>
                        <p>
                            <img
                                :src="bannerImage"
                                height="158"
                                width="1175"
                                style="background-color: lightgrey"
                            />
                        </p>
                        <p>
                            <button
                                class="btn red-btn"
                                @click="deleteImage('banner')"
                            >
                                Remove &nbsp;&nbsp;
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 448 512"
                                    width="20"
                                    height="20"
                                    fill="white"
                                >
                                    <path
                                        d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
                                    />
                                </svg>
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Description -->
        <div class="row">
            <div class="col">
                <div class="mb-3">
                    <label for="description" class="form-label"
                        >Description</label
                    >
                    <textarea
                        v-model="skill.description"
                        class="form-control"
                        rows="2"
                    ></textarea>
                </div>
                <div>
                    <div v-if="validate.description" class="form-validate">
                        please enter description for skill
                    </div>
                </div>
            </div>
        </div>

        <!-- Mastery Requirement summernote -->
        <div v-if="skill.type != 'domain'" class="mb-3">
            <label for="mastery_requirements" class="form-label"
                >Mastery Requirements</label
            >
            <textarea
                class="form-control"
                v-model="skill.mastery_requirements"
                id="summernote"
                rows="3"
            ></textarea>
        </div>

        <!-- Submit and cancel button -->
        <div class="row">
            <div class="d-flex justify-content-between">
                <!-- Delete Button -->
                <div class="d-flex flex-column">
                    <div id="danger-label-div">
                        <div
                            v-if="deleteButtonHover"
                            id="danger-label"
                            :class="{ shake: deleteButtonHover }"
                        >
                            Danger !!!
                        </div>
                    </div>
                    <div>
                        <button
                            class="btn red-btn"
                            @mouseover="deleteButtonHover = true"
                            @mouseleave="deleteButtonHover = false"
                            @click="showModal = true"
                        >
                            Delete
                            <span class="d-none d-md-block">&nbsp;skill </span>

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                width="20"
                                height="20"
                                fill="white"
                                class="ms-1"
                            >
                                <path
                                    d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                <!-- Cancel and Submit Action Buttons -->
                <div
                    class="d-flex justify-content-end gap-md-4 gap-1 align-items-end"
                >
                    <router-link class="btn red-btn" to="/skills">
                        <div class="d-none d-md-block">Cancel</div>
                        <!-- Exit Icon-->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="20"
                            height="20"
                            fill="white"
                            class="d-md-none exit-icon"
                        >
                            <path
                                d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z"
                            />
                        </svg>
                    </router-link>
                    <button class="btn purple-btn" @click="Submit()">
                        <div class="d-none d-md-block">Submit</div>
                        <!-- Pencil Into Square Icon -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            fill="white"
                            height="20"
                            width="20"
                            class="d-md-none"
                        >
                            <path
                                d="M441 58.9L453.1 71c9.4 9.4 9.4 24.6 0 33.9L424 134.1 377.9 88 407 58.9c9.4-9.4 24.6-9.4 33.9 0zM209.8 256.2L344 121.9 390.1 168 255.8 302.2c-2.9 2.9-6.5 5-10.4 6.1l-58.5 16.7 16.7-58.5c1.1-3.9 3.2-7.5 6.1-10.4zM373.1 25L175.8 222.2c-8.7 8.7-15 19.4-18.3 31.1l-28.6 100c-2.4 8.4-.1 17.4 6.1 23.6s15.2 8.5 23.6 6.1l100-28.6c11.8-3.4 22.5-9.7 31.1-18.3L487 138.9c28.1-28.1 28.1-73.7 0-101.8L474.9 25C446.8-3.1 401.2-3.1 373.1 25zM88 64C39.4 64 0 103.4 0 152V424c0 48.6 39.4 88 88 88H360c48.6 0 88-39.4 88-88V312c0-13.3-10.7-24-24-24s-24 10.7-24 24V424c0 22.1-17.9 40-40 40H88c-22.1 0-40-17.9-40-40V152c0-22.1 17.9-40 40-40H200c13.3 0 24-10.7 24-24s-10.7-24-24-24H88z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- Warning Modal  -->
    <div v-if="showModal" id="myModal" class="modal">
        <!-- Modal content -->
        <div class="modal-content d-flex flex-column">
            <div class="mb-4">Delete "{{ skill.name }}"</div>
            <!-- Warning section  -->
            <div
                v-if="!step1Confirm"
                id="warning-section"
                class="d-flex align-items-center"
            >
                <div class="me-3">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="15"
                        height="15"
                        fill="#eed888"
                    >
                        <path
                            d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
                        />
                    </svg>
                </div>
                <div>
                    This action will delete this skill and all its nested
                    skills, and is not reversible.
                </div>
            </div>
            <!-- Type Name Confirm -->
            <div v-if="step1Confirm">
                <label for="name" class="conform-label"
                    >Enter "{{ skill.name }}" in the box below to confirm</label
                >
                <input
                    v-model="skillNameConfirm"
                    class="form-control"
                    type="text"
                    placeholder="name"
                    @input="handleConfirmInputChange"
                />
            </div>
            <div class="mt-3 d-flex justify-content-between">
                <button class="btn green-btn" @click="handleCancelDeleteSkill">
                    Cancel
                </button>
                <button
                    v-if="!step1Confirm"
                    class="btn red-btn"
                    @click="step1Confirm = true"
                >
                    I still want to delete this skill
                </button>
                <button
                    v-if="step1Confirm"
                    :class="[
                        step2Confirm ? 'btn red-btn' : 'btn button-inactive'
                    ]"
                    @click="DeleteSkill(skill.id)"
                >
                    Delete skill
                </button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.green-btn:hover {
    background-color: #65e0a5;
}

#page-tile {
    font-family: 'Poppins' sans-serif;
    font-size: 38px;
    font-weight: 900;
    line-height: 28px;
    letter-spacing: 0em;
    text-align: left;
    color: #667085;
}

.form-label {
    font-family: 'Poppins' sans-serif;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    letter-spacing: 0em;
    text-align: left;
}

.form-control {
    padding: 10px 0px 10px 14px;
    border-radius: 8px;
    border: 1px;
    gap: 8px;
    box-shadow: 0px 1px 2px 0px #1018280d;
    border: 1px solid #f2f4f7;
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
    height: fit-content;
}

.purple-btn:hover {
    background-color: #8666ca;
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
    height: fit-content;
}

.red-btn:hover {
    background-color: #cc3535;
}
/* ----------------- a lot of css style for all the various input style ----------------------------  */

/* Parent skill input dropdown elements */
#skill-input {
    width: 100%;
    height: 42px;
    padding: 10px 0px 10px 14px;
    border-radius: 8px;
    border: 1px;
    gap: 8px;
    box-shadow: 0px 1px 2px 0px #1018280d;
    border: 1px solid #f2f4f7;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    color: #667085;
    box-shadow: 0px 1px 2px 0px #1018280d;
    font-family: 'Poppins' sans-serif;
}

#skill-input:focus {
    outline-color: #667085;
}

#suggest-skills {
    z-index: 10;
    width: 95.5%;
    margin-right: 0px;
    margin-left: auto;
    border-radius: 6.63px;
    border: 0.83px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #65e0a5, #65e0a5);
    border: 1px solid #f2f4f7;
    border: 0.83px solid #65e0a5;
    box-shadow: 0px 3.317408561706543px 4.9761128425598145px -1.6587042808532715px
        #10182808;
    box-shadow: 0px 9.952225685119629px 13.269634246826172px -3.317408561706543px
        #10182814;
}

.suggest-option {
    height: 36.59px;
    padding: 8.29px 11px 8px 12px;
    gap: 6.63px;
    color: #344054;
}
.suggest-option:hover {
    background: #65e0a51a;
    cursor: pointer;
}
/* End of skill input and suggestion style */

/* =========================== */

/* Style For The Custom Select */
.custom-select-button {
    width: 100%;
    height: 42px;
    padding: 10px 0px 10px 14px;
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
    height: 42px;
    padding: 10px 0px 10px 14px;
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

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
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
    position: absolute;
    z-index: 10;
    width: 100%;
    top: 42px;
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

/**-------------------------------------  */
/* A lot of CSS to styling two check box */
.control {
    font-family: 'Poppins' sans-serif;
    display: block;
    position: relative;
    padding-left: 30px;
    margin-bottom: 5px;
    padding-top: 3px;
    cursor: pointer;
}

.control > span {
    font-weight: 500;
    font-size: 0.938rem;
    color: #667085;
    text-align: center;
}
.control input {
    position: absolute;
    z-index: -1;
    opacity: 0;
}
.control_indicator {
    position: absolute;
    top: 2px;
    left: 0;
    height: 29.09px;
    width: 29.09px;
    background: #f9f5ff;
    border: 1.45px solid #9c7eec;
    border-radius: 8.73px;
}
.control:hover input ~ .control_indicator,
.control input:focus ~ .control_indicator {
    background: #e7ddf6;
}

.plus-svg:hover {
    cursor: pointer;
}
.control input:checked ~ .control_indicator {
    background: #f9f5ff;
}
.control:hover input:not([disabled]):checked ~ .control_indicator,
.control input:checked:focus ~ .control_indicator {
    background: #f9f5ff;
}
.control input:disabled ~ .control_indicator {
    background: #e6e6e6;
    opacity: 0.6;
    pointer-events: none;
}
.control_indicator:after {
    box-sizing: unset;
    content: '';
    position: absolute;
    display: none;
}
.control input:checked ~ .control_indicator:after {
    display: block;
}
.control-checkbox .control_indicator:after {
    left: 4px;
    top: 5px;
    width: 13.58px;
    height: 9.33px;
    border: solid #9c7eec;
    border-width: 0px 0px 2.9px 2.9px;
    transform: rotate(-45deg);
}
.control-checkbox input:disabled ~ .control_indicator:after {
    border-color: #7b7b7b;
}
.control-checkbox .control_indicator::before {
    content: '';
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 4.5rem;
    height: 4.5rem;
    margin-left: -1.3rem;
    margin-top: -1.3rem;
    background: #9c7eec;
    border-radius: 3rem;
    opacity: 0.6;
    z-index: 99999;
    transform: scale(0);
}

.control-checkbox input + .control_indicator::before {
    animation: s-ripple 250ms ease-out;
}
.control-checkbox input:checked + .control_indicator::before {
    animation-name: s-ripple-dup;
}
/* End of check box styling */

/* ------------------------------------------------------------- */
.form-check {
    margin: 0px;
    padding: 0px;
}

/* ================ */
/* Styling for default image */
.default-no-img {
    width: 100%;
    height: 158px;
    background-color: #e6e6e6;
    border-radius: 12px;
    border: #e7ddf6;
}
.plus-svg {
    display: flex;
    justify-content: end;
    padding-right: 10px;
    padding-left: auto;
    padding-bottom: auto;
    padding-top: 10px;
}

/* ================== */
.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}

#danger-label {
    font-size: 1rem;
    color: red;
    font-weight: 300;
}

/* Shake animation for waring line */
.shake {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

@keyframes shake {
    10%,
    90% {
        transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
        transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
        transform: translate3d(4px, 0, 0);
    }
}

#danger-label-div {
    height: 1.5rem;
}

/* The Warning Modal */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 1;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 670px;
    /* Could be more or less, depending on screen size */
}

#warning-section {
    background-color: #fff8c5;
    border-radius: 5px;
    border: 1px solid #eed888;
    padding: 20px 10px;
    margin: 10px 0px;
}

.strong-warning {
    font-weight: 500;
}

.conform-label {
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 4px;
}

.button-inactive {
    background-color: #868888;
    color: white;
    border: 1px solid #868686;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.button-inactive:hover {
    cursor: not-allowed;
}

/* _-_ End of warning modal styling _-_ */

/* Style specific for phone view */
@media (max-width: 767px) {
    .default-no-img {
        height: 100px;
        width: auto;
    }
    #page-tile {
        font-size: 32px;
    }

    .exit-icon {
        transform: scale(-1, 1);
    }
}
</style>
