<script>
import VueMultiselect from 'vue-multiselect';
// Import the stores.
import { useSkillsStore } from '../../stores/SkillsStore.js';

export default {
    setup() {
        const skillsStore = useSkillsStore();
        return {
            skillsStore
        };
    },
    components: { VueMultiselect },
    data() {
        return {
            skill: {
                name: '',
                // Set as default, though can be changed.
                parent: 0,
                description: '',
                icon: '',
                icon_image: '',
                banner_image: '',
                mastery_requirements: '',
                //other_skill_requirements: [],
                type: 'regular',
                level: 'Grade School',
                filter_1: 0
            },
            iconImage: '',
            bannerImage: '',
            skills: [],
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
            // Below are data for various input function and data
            parentInput: {
                inputText: '',
                suggestSkills: []
            },
            showDropDown: false,
            // we want show the name instead of id
            showLevel: 'Grade School'
        };
    },
    async created() {
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }

        if (this.skills.length == 0) await this.getParentSkills();
    },
    async mounted() {
        $('#summernote').summernote({
            placeholder: '',
            tabsize: 2,
            height: 120,
            toolbar: [
                ['style', ['style']],
                ['font', ['bold', 'underline', 'clear']],
                ['color', ['color']],
                ['para', ['ul', 'ol', 'paragraph']],
                ['table', ['table']],
                ['insert', ['link', 'picture', 'video']],
                ['view', ['fullscreen', 'codeview', 'help']]
            ],
            maximumImageFileSize: 2048 * 1024, // 2 MB
            callbacks: {
                onImageUploadError: function (msg) {
                    alert('Max image size is 2MB.');
                }
            }
        });
    },
    methods: {
        getParentSkills() {
            for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                if (this.skillsStore.skillsList[i].type == 'super') {
                    this.superSkills.push(this.skillsStore.skillsList[i]);
                }
                if (
                    this.skillsStore.skillsList[i].id != this.skillId &&
                    this.skillsStore.skillsList[i].type != 'sub'
                ) {
                    this.skills.push(this.skillsStore.skillsList[i]);
                }
            }
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
        removeImage: function (e) {
            this.image = '';
            this.skill.image = this.image;
        },
        async Submit() {
            if (this.skill.type == 'sub' && this.skill.parent == 0) {
                alert('cluster nodes must have a parent');
            } else {
                if (this.skill.type == 'domain') {
                    this.skill.level = 'domain';
                } else if (this.skill.type == 'sub') {
                    for (
                        let i = 0;
                        i < this.skillsStore.skillsList.length;
                        i++
                    ) {
                        if (
                            this.skill.parent ==
                            this.skillsStore.skillsList[i].id
                        ) {
                            this.skill.filter_1 =
                                this.skillsStore.skillsList[i].filter_1;
                            this.skill.level =
                                this.skillsStore.skillsList[i].level;
                        }
                    }
                }

                var url = '/skills/add';
                // Get the Summernote HTML.
                this.skill.mastery_requirements =
                    $('#summernote').summernote('code');

                await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: this.skill.name,
                        parent: this.skill.parent,
                        description: this.skill.description,
                        icon_image: this.skill.icon_image,
                        banner_image: this.skill.banner_image,
                        mastery_requirements: this.skill.mastery_requirements,
                        type: this.skill.type,
                        level: this.skill.level,
                        filter_1: this.skill.filter_1
                    })
                })
                    .then(() => {
                        this.skillsStore.getNestedSkillsList();
                    })
                    .then(() => {
                        this.$router.push('/skills');
                    });
            }
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
        handleChooseSkillLevel(level) {
            this.showLevel = level.name;
            this.skill.level = level.id;
            this.showDropDown = false;
        }
    }
};
</script>

<template>
    <div class="container mt-4 pb-5">
        <div class="row mt-5">
            <div class="col col-md-5 d-flex align-items-baseline gap-3 mt-3">
                <h1 id="page-tile">Add Skill</h1>
                <img src="/images/recurso-69.png" id="header-icon" />
            </div>
        </div>
        <!-- Skill Name -->
        <div class="row mt-5">
            <div class="col-5 mt-2">
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input
                        v-model="skill.name"
                        class="form-control"
                        type="text"
                        placeholder="name"
                    />
                </div>
            </div>
        </div>
        <!-- Parent will be typing dropdown -->
        <div class="row">
            <div class="col-5 mt-2">
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
                <div v-else class="mb-3">
                    <label class="form-label">Cluster node center</label>
                    <select class="form-select" v-model="skill.parent">
                        <option
                            v-for="superSkill in superSkills"
                            :value="superSkill.id"
                        >
                            {{ superSkill.name }}
                        </option>
                    </select>
                </div>
            </div>
        </div>
        <!-- Skill level custom dropdown-->
        <div class="row">
            <div class="col col-md-5 mt-2">
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
        <!-- Skill filter -->
        <div class="row">
            <div class="col col-md-5">
                <div v-if="skill.type != 'sub'">
                    <label class="form-label">Filter</label>
                    <div class="container row mb-3">
                        <div class="form-check">
                            <input
                                class="form-check-input"
                                type="checkbox"
                                value="1"
                                id="flexCheckDefault"
                                v-model="skill.filter_1"
                            />
                            <label
                                class="form-check-label"
                                for="flexCheckDefault"
                            >
                                contrary to strict Christian doctrine
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Skills Types Radio choose -->
        <div class="row">
            <div class="col col-md-5">
                <label class="form-label">Node Type</label>
                <div class="container row mb-3">
                    <div class="form-check col-5 my-2">
                        <input
                            class="form-check-input"
                            type="radio"
                            name="nodeType"
                            id="regularSkillRadio"
                            value="regular"
                            v-model="skill.type"
                        />
                        <label class="form-check-label" for="regularSkillRadio">
                            Regular
                        </label>
                    </div>
                    <div class="form-check col-5 my-2">
                        <input
                            class="form-check-input"
                            type="radio"
                            name="nodeType"
                            id="passThroughRadio"
                            value="domain"
                            v-model="skill.type"
                        />
                        <label class="form-check-label" for="passThroughRadio">
                            Pass-through
                        </label>
                    </div>
                    <div class="form-check col-5 my-2">
                        <input
                            class="form-check-input"
                            type="radio"
                            name="nodeType"
                            id="superSkillRadio"
                            value="super"
                            v-model="skill.type"
                        />
                        <label class="form-check-label" for="superSkillRadio">
                            Cluster node center
                        </label>
                    </div>
                    <div class="form-check col-5 my-2">
                        <input
                            class="form-check-input"
                            type="radio"
                            name="nodeType"
                            id="subSkillRadio"
                            value="sub"
                            v-model="skill.type"
                        />
                        <label class="form-check-label" for="subSkillRadio">
                            Cluster node outer
                        </label>
                    </div>
                </div>
            </div>
        </div>
        <!-- Icon and Banner file choose -->
        <div class="row">
            <!-- Icon chooser -->
            <div class="col-2">
                <div class="mb-3 row">
                    <label for="image" class="form-label">Icon</label>
                    <div v-if="!iconImage">
                        <input
                            class="form-control"
                            type="file"
                            accept="image/*"
                            @change="onFileChange($event, 'icon')"
                        />
                        <p style="font-size: 14px">
                            <em>Maximum file size 15mb</em>
                        </p>
                    </div>
                    <div v-else>
                        <p>
                            <img
                                :src="iconImage"
                                height="200"
                                style="background-color: lightgrey"
                            />
                        </p>
                        <p>
                            <button
                                class="btn btn-warning"
                                @click="removeImage"
                            >
                                Remove image
                            </button>
                        </p>
                    </div>
                </div>
            </div>
            <!-- Banner chooser -->
            <div class="col-10">
                <div class="mb-3 row">
                    <label for="image" class="form-label">Banner</label>
                    <div v-if="!bannerImage">
                        <input
                            class="form-control"
                            type="file"
                            accept="image/*"
                            @change="onFileChange($event, 'banner')"
                        />
                        <p style="font-size: 14px">
                            <em>Maximum file size 15mb</em>
                        </p>
                    </div>
                    <div v-else>
                        <p>
                            <img
                                :src="bannerImage"
                                height="200"
                                style="background-color: lightgrey"
                            />
                        </p>
                        <p>
                            <button
                                class="btn btn-warning"
                                @click="removeImage"
                            >
                                Remove image
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
        <!-- Description Text Area -->
        <div class="row">
            <div class="col">
                <div class="mb-3">
                    <label for="description" class="form-label"
                        >Description</label
                    >
                    <textarea
                        v-model="skill.description"
                        class="form-control"
                        placeholder="description"
                        rows="3"
                    ></textarea>
                </div>
            </div>
        </div>
        <!-- Mastery Requirements with summernote -->
        <div class="row">
            <div class="col">
                <div class="mb-3">
                    <label for="mastery_requirements" class="form-label"
                        >Mastery Requirements</label
                    >
                    <textarea
                        v-model="skill.mastery_requirements"
                        class="form-control"
                        id="summernote"
                        rows="3"
                    ></textarea>
                </div>
            </div>
        </div>
        <!-- Submit and cancel button -->
        <div class="row">
            <div class="col">
                <div class="d-flex justify-content-end gap-4">
                    <router-link class="btn red-btn" to="/skills">
                        Cancel
                    </router-link>
                    <button class="btn purple-btn" @click="Submit()">
                        Submit
                    </button>
                </div>
            </div>
        </div>
        <div class="row"></div>
    </div>
</template>

<style scoped>
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
</style>
