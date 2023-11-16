<script>
export default {
    data() {
        return {
            showChildren: false,
            user: {},
            studentGrade: this.grade
        };
    },
    props: ['children', 'skill_name', 'is_mastered', 'is_accessible', 'id', 'grade', 'depth', 'MakeAccessible', 'MakeInaccessible', 'MakeMastered', 'MakeUnmastered', 'SubmitGrade'],
    async created() {

    },
    computed: {
        labelClasses() {
            return { 'has-children': this.nodes }
        },
        indent() {
            return { transform: `translate(${this.depth * 50}px)` }
        }
    },
    methods: {
        toggleChildren() {
            this.showChildren = !this.showChildren;
        },
    }
}
</script> 

<template>
    <div>
        <div class="label-wrapper"
            :class="depth == 0 ? 'user-name' : is_accessible != 1 ? 'inaccessible' : is_mastered != 1 ? 'unmastered' : 'mastered'">
            <div class="d-flex">
                <button v-if="showChildren && children.length > 0" @click="toggleChildren" class="btn btn-dark">-</button>
                <button v-else-if="children.length > 0" @click="toggleChildren" class="btn btn-dark">+</button>
                <div :style="indent" :class="labelClasses">
                    <h1 v-if="depth == 0" style="padding-left: 10px;">{{ skill_name }}</h1>
                    <h2 v-else>{{ skill_name }}</h2>
                    <div v-if="depth != 0">
                        <button v-if="is_accessible != 1" @click="MakeAccessible(id)" class="btn btn-dark">Make
                            Accessible</button>
                        <div v-else-if="is_mastered != 1 && is_accessible == 1">
                            <button @click="MakeInaccessible(id)" class="btn btn-dark me-2">Make Inaccessible</button>
                            <button @click="MakeMastered(id)" class="btn btn-dark">Make Mastered</button>
                        </div>
                        <div v-else-if="is_mastered == 1">
                            <button @click="MakeUnmastered(id)" class="btn btn-dark me-2">Make Unmastered</button>
                            <input v-model="studentGrade" type="number" id="grade" name="grade" min="0" max="100"
                                class="me-2">
                            <button @click="SubmitGrade(id, studentGrade)" class="btn btn-dark">Submit grade</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <EditUserSkillsChild v-if="showChildren" v-for="child in children" :MakeAccessible="MakeAccessible"
            :MakeInaccessible="MakeInaccessible" :MakeMastered="MakeMastered" :MakeUnmastered="MakeUnmastered"
            :SubmitGrade="SubmitGrade" :children="child.children" :skill_name="child.skill_name"
            :is_mastered="child.is_mastered" :is_accessible="child.is_accessible" :grade="child.grade" :id="child.id"
            :depth="depth + 1">
        </EditUserSkillsChild>
    </div>
</template>


<style scoped>
/* Add a background color to the button if it is clicked on (add the .active class with JS), and when you move the mouse over it (hover) */
.accordion:hover {
    background-color: LightGoldenRodYellow;
}

.label-wrapper {
    padding: 10px;
    margin-bottom: 10px;
    border-bottom: 1px solid #ccc;
    border-radius: 5px;
}

.user-name {
    background-color: white;
}

.inaccessible {
    background-color: SlateGrey;
}

.mastered {
    background: yellow;
}

.unmastered {
    background: LightGrey;
}
</style> 