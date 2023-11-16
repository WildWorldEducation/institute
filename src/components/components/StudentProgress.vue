<script>
export default {
    data() {
        return {
            userSkills: []
        }
    },
    props: [
        'userId'
    ],
    async created() {
        const result = await fetch('/user-skills/unnested-list/' + this.userId);
        this.userSkills = await result.json();
    },
    computed: {
        availableSkills() {
            const availableSkills = [];
            for (let i = 0; i < this.userSkills.length; i++) {
                if (this.userSkills[i].is_accessible == 1 & this.userSkills[i].is_mastered != 1) {
                    availableSkills.push(this.userSkills[i].name);
                }
            }

            return availableSkills;
        }
    },
    methods: {
    }
}
</script>

<template>
    <h1>My Progress</h1>
    <h2>2023 - Active</h2>
    <div class="table-responsive">
        <table class="table table-bordered">
            <thead>
                <tr>
                    <th scope="col">Available Skills</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="availableSkill in availableSkills">
                    <td>{{ availableSkill }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>


<style scoped>
.table-responsive {
    max-height: 300px;
}

h1 {
    color: #AD9AF3;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

h2 {
    color: #DCD1FD;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

th {
    background-color: #E8E2F9;
    border-color: #DBD0F9;
    color: #AD9AF3;
    font-family: 'Poppins', sans-serif;
    font-weight: 900;
}

td {
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    color: #857D99;
}
</style>