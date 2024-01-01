<script>
import VueMultiselect from 'vue-multiselect'
// Import the stores.
import { useSkillsStore } from '../../stores/SkillsStore.js';


export default {
    setup() {
        const skillsStore = useSkillsStore();
        return {
            skillsStore
        }
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
                image: '',
                image_attribution: '',
                mastery_requirements: '',
                first_ancestor: null,
                hierarchy_level: null,
                other_skill_requirements: [],
                type: 'regular'
            },
            image: '',
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
        }
    },
    async created() {
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList()
        }

        if (this.skills.length == 0)
            await this.getParentSkills();
    },
    async mounted() {
        $("#summernote").summernote({
            placeholder: '',
            tabsize: 2,
            height: 120,
            toolbar: [
                ['para', ['ul', 'ol', 'paragraph']],
            ]
        });


    },
    methods: {
        getParentSkills() {
            this.skills = this.skillsStore.skillsList
            for (let i = 0; i < this.skills.length; i++) {
                if (this.skills[i].type == 'super') {
                    this.superSkills.push(this.skills[i])
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
            var url = "/skills/add";
            // Get the Summernote HTML.         
            this.skill.mastery_requirements = $('#summernote').summernote("code");

            // Get the first ancestor and hierarchy level fields.
            for (let i = 0; i < this.skills.length; i++) {
                if (this.skills[i].id == this.skill.parent) {
                    this.skill.first_ancestor = this.skills[i].first_ancestor
                    this.skill.hierarchy_level = this.skills[i].hierarchy_level + 1
                }
            }


            fetch(url, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(
                    {
                        name: this.skill.name,
                        parent: this.skill.parent,
                        description: this.skill.description,
                        image: this.skill.image,
                        image_attribution: this.skill.image_attribution,
                        mastery_requirements: this.skill.mastery_requirements,
                        first_ancestor: this.skill.first_ancestor,
                        hierarchy_level: this.skill.hierarchy_level,
                        type: this.skill.type
                    })
            }).then(() => {
                this.$router.push("/skills");
            });
        },
    }
}
</script>
 
<template>
    <div class="container mt-3">
        <h1>Add Skill</h1>
        <div class="row">
            <div class="col-lg-6">
                <div class="mb-3">
                    <label for="name" class="form-label">Name</label>
                    <input v-model="skill.name" class="form-control" type="text" placeholder="name">
                </div>

                <div class="mb-3">
                    <label class="form-label">Level</label>
                    <select class="form-select" v-model="skill.level">
                        <option v-for="level in levels" :value="level.id">
                            {{ level.name }}
                        </option>
                    </select>
                </div>

                <label class="form-label">Node Type</label>
                <div class="container row mb-3">
                    <div class="form-check col-4">
                        <input class="form-check-input" type="radio" name="nodeType" id="regularSkillRadio" value="regular"
                            v-model="skill.type">
                        <label class="form-check-label" for="regularSkillRadio">
                            Regular
                        </label>
                    </div>
                    <div class="form-check col-4">
                        <input class="form-check-input" type="radio" name="nodeType" id="superSkillRadio" value="super"
                            v-model="skill.type">
                        <label class="form-check-label" for="superSkillRadio">
                            Super
                        </label>
                    </div>
                    <div class="form-check col-4">
                        <input class="form-check-input" type="radio" name="nodeType" id="subSkillRadio" value="sub"
                            v-model="skill.type">
                        <label class="form-check-label" for="subSkillRadio">
                            Sub
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
                    <label class="form-label">Super skill</label>
                    <select class="form-select" v-model="skill.parent">
                        <option v-for="superSkill in superSkills" :value="superSkill.id">
                            {{ superSkill.name }}
                        </option>
                    </select>
                </div>

                <div class="mb-3">
                    <label for="description" class="form-label">Description</label>
                    <textarea v-model="skill.description" class="form-control" placeholder="description"
                        rows="3"></textarea>
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
                    <textarea v-model="skill.mastery_requirements" class="form-control" id="summernote" rows="3"></textarea>
                </div>
                <div class="d-flex justify-content-between">
                    <router-link class="btn btn-dark" to="/skills">
                        Cancel
                    </router-link>
                    <button class="btn btn-dark" @click="Submit()">Submit</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>