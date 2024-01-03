<script>
// Import the store.
import { useTagsStore } from '../../stores/TagsStore.js';
import { useSkillsStore } from '../../stores/SkillsStore.js';

export default {
    setup() {
        const tagsStore = useTagsStore();
        const skillsStore = useSkillsStore();
        // If method hasnt been run before.
        if (tagsStore.tagsList.length == 0) {
            // Run the GET request.
            tagsStore.getTagsList()
        }

        return {
            tagsStore, skillsStore
        }
    },
    data() {
        return {
            skillId: this.$route.params.id,
            skills: [],
            skill: {
                name: '',
                parent: '',
                description: '',
                image: '',
                mastery_requirements: '',
                first_ancestor: null,
                tags: [],
                type: null,
                level: null
            },
            image: '',
            // Array used to show which tags, of all the tags, are already assigned to this skill.
            skillTags: [],
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
    async mounted() {
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList()
        }
        if (this.tagsStore.tagsList.length == 0) {
            await this.tagsStore.getTagsList()
        }

        this.getParentSkills();
    },
    methods: {
        getParentSkills() {
            this.skills = this.skillsStore.skillsList
            for (let i = 0; i < this.skills.length; i++) {
                if (this.skills[i].type == 'super') {
                    this.superSkills.push(this.skills[i])
                }
            }

            // Call this after the above, so that parent field loaded correctly.       
            this.getSkill();
        },
        getSkill() {
            fetch('/skills/show/' + this.skillId)
                .then(function (response) {
                    return response.json();
                }).then(data => this.skill = data).then(() => {
                    this.image = this.skill.image;
                    $('#summernote').summernote('code', this.skill.mastery_requirements);
                    this.getSkillTags()
                });
        },
        // Array used to show which tags, of all the tags, are already assigned to this skill.
        getSkillTags() {
            // Cycle through all tags.
            for (let i = 0; i < this.tagsStore.tagsList.length; i++) {
                // Copy the above array into the new one.
                this.skillTags.push(this.tagsStore.tagsList[i]);
                // Create new field, just for this page.
                this.skillTags[i].isChecked = false
                // Check if the tag has already been added to the skill.
                for (let j = 0; j < this.skill.tags.length; j++) {
                    if (this.skill.tags[j].tag_id == this.tagsStore.tagsList[i].id) {
                        this.skillTags[i].isChecked = true
                    }
                }
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
                this.skill.image = this.image;
            };
            reader.readAsDataURL(file);

        },
        removeImage: function (e) {
            this.image = '';
            this.skill.image = this.image;
        },
        Submit() {
            // Get the first ancestor and hierarchy level fields.
            for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                if (this.skillsStore.skillsList[i].id == this.skill.parent) {
                    this.skill.first_ancestor = this.skillsStore.skillsList[i].first_ancestor
                }
            }

            // Update the skill.
            var masteryRequirementsData = $('#summernote').summernote("code");
            const requestOptions = {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        name: this.skill.name,
                        parent: this.skill.parent,
                        description: this.skill.description,
                        icon: this.skill.icon,
                        image: this.skill.image,
                        mastery_requirements: masteryRequirementsData,
                        first_ancestor: this.skill.first_ancestor,
                        type: this.skill.type,
                        level: this.skill.level
                    })
            };

            var url = '/skills/' + this.skillId + '/edit';
            fetch(url, requestOptions)
                .then(() => {
                    this.$router.push("/skills");
                });
        },
        changeTag(skillTag) {
            var url;
            // If the checkbox is checked, the DB entry is created.
            if (skillTag.isChecked == true) {
                url = "/skill-tags/add/" + this.skillId + "/" + skillTag.id
                fetch(url, {
                    method: 'POST',
                    body: {}
                });
            }
            // If the checkbox is unchecked, the DB entry is deleted.
            else {
                url = "/skill-tags/remove/" + this.skillId + "/" + skillTag.id
                fetch(url, {
                    method: 'DELETE'
                });
            }
        }
    }
}
</script> 

<template>
    <div class="container mt-3">
        <h1>Edit Skill</h1>
        <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input v-model="skill.name" type="text" class="form-control">
        </div>

        <div class="mb-3">
            <label class="form-label">Level</label>
            <select class="form-select" v-model="skill.level">
                <option v-for="level in levels" :value="level.id">
                    {{ level.name }}
                </option>
            </select>
        </div>

        <div class="row mb-3">
            <label for="tags" class="form-label">Filter</label>
            <div v-for="skillTag in skillTags">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" :value="skillTag.id" id="flexCheckDefault"
                        v-model="skillTag.isChecked" @change="changeTag(skillTag)">
                    <label class=" form-check-label" for="flexCheckDefault">
                        {{ skillTag.name }}
                    </label>
                </div>
            </div>
        </div>

        <label class="form-label">Node Type</label>
        <div class="container row mb-3">
            <div class="form-check col-3">
                <input class="form-check-input" type="radio" name="nodeType" id="regularSkillRadio" value="regular"
                    v-model="skill.type">
                <label class="form-check-label" for="regularSkillRadio">
                    Regular
                </label>
            </div>
            <div class="form-check col-3">
                <input class="form-check-input" type="radio" name="nodeType" id="passThroughRadio" value="domain"
                    v-model="skill.type">
                <label class="form-check-label" for="passThroughRadio">
                    Pass-through
                </label>
            </div>
            <div class="form-check col-3">
                <input class="form-check-input" type="radio" name="nodeType" id="superSkillRadio" value="super"
                    v-model="skill.type">
                <label class="form-check-label" for="superSkillRadio">
                    Cluster node center
                </label>
            </div>
            <div class="form-check col-3">
                <input class="form-check-input" type="radio" name="nodeType" id="subSkillRadio" value="sub"
                    v-model="skill.type">
                <label class="form-check-label" for="subSkillRadio">
                    Cluster node outer
                </label>
            </div>
        </div>

        <div v-if="skill.type != 'sub'" class="mb-3">
            <label class="form-label">Parent</label>
            <select class="form-select" v-model="skill.parent">
                <option v-for="skill in skills" :value="skill.id">
                    {{ skill.name }}
                </option>
            </select>
        </div>
        <div v-else class="mb-3">
            <label class="form-label">Cluster node center</label>
            <select class="form-select" v-model="skill.parent">
                <option v-for="superSkill in superSkills" :value="superSkill.id">
                    {{ superSkill.name }}
                </option>
            </select>
        </div>
        <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea v-model="skill.description" class="form-control" rows="3"></textarea>
        </div>
        <div class="mb-3 row">
            <label for="image" class="form-label">Image</label>
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
            <label for="mastery_requirements" class="form-label">Mastery Requirements</label>
            <textarea class="form-control" v-model="skill.mastery_requirements" id="summernote" rows="3"></textarea>
        </div>

        <div class="mb-3 mt-3">
            <div class="d-flex justify-content-between">
                <router-link class="btn btn-dark" to="/skills">
                    Cancel
                </router-link>
                <button @click="Submit()" class="btn green-btn">
                    Submit&nbsp;
                    <!-- Plus sign -->
                    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M6.34811 20.0423L6.34811 13.6494L-0.0358702 13.6583C-0.320945 13.6579 -0.594203 13.5444 -0.795782 13.3428C-0.997361 13.1412 -1.11082 12.868 -1.11132 12.5829L-1.11729 7.41477C-1.1168 7.1297 -1.00334 6.85644 -0.801757 6.65486C-0.600179 6.45328 -0.326921 6.33982 -0.0418461 6.33933L6.3481 6.34231L6.3481 -0.0506238C6.34659 -0.193451 6.3736 -0.335145 6.42756 -0.467396C6.48152 -0.599646 6.56134 -0.719794 6.66234 -0.820794C6.76334 -0.921794 6.88349 -1.00161 7.01574 -1.05557C7.14799 -1.10953 7.28969 -1.13655 7.43251 -1.13503L12.5827 -1.12308C12.8678 -1.12259 13.141 -1.00913 13.3426 -0.807549C13.5442 -0.60597 13.6577 -0.332713 13.6582 -0.047637L13.6552 6.34231L20.0481 6.34231C20.3325 6.34248 20.6052 6.45552 20.8063 6.65661C21.0074 6.8577 21.1204 7.13039 21.1206 7.41477L21.1325 12.565C21.1324 12.8494 21.0193 13.122 20.8182 13.3231C20.6171 13.5242 20.3444 13.6373 20.0601 13.6374L13.6552 13.6494L13.6641 20.0334C13.6636 20.3184 13.5502 20.5917 13.3486 20.7933C13.147 20.9948 12.8738 21.1083 12.5887 21.1088L7.43252 21.1267C7.28969 21.1282 7.148 21.1012 7.01575 21.0473C6.88349 20.9933 6.76335 20.9135 6.66235 20.8125C6.56135 20.7115 6.48153 20.5913 6.42757 20.4591C6.37361 20.3268 6.34659 20.1851 6.34811 20.0423Z"
                            fill="white" />
                    </svg>
                </button>
            </div>
        </div>
    </div>
</template>


<style scoped>
.green-btn {
    background-color: #36C1AF;
    color: white;
    border: 1px solid #2CA695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    display: flex;
    align-items: center;
    max-width: fit-content;
}
</style> 