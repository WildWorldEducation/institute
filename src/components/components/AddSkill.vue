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
                level: 'grade_school',
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
            ]
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
                    <select class="form-select" v-model="skill.parent">
                        <option value="0">none</option>
                        <option v-for="skill in skills" :value="skill.id">
                            {{ skill.name }}
                        </option>
                    </select>
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
        <!-- Skill level -->
        <div class="row">
            <div class="col col-md-5">
                <div v-if="skill.type != 'domain' && skill.type != 'sub'">
                    <div class="mb-3">
                        <label class="form-label">Level</label>
                        <select class="form-select" v-model="skill.level">
                            <option v-for="level in levels" :value="level.id">
                                {{ level.name }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
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
</style>
