<script>
import { useUsersStore } from '../../../stores/UsersStore';
export default {
    setup() {
        const usersStore = useUsersStore();
        return {
            usersStore
        };
    },
    data() {
        return {
            studentId: this.$route.params.studentId,
            studentName: null,
            skillDurations: []
        };
    },
    async created() {
        if (this.usersStore.users.length < 1) await this.usersStore.getUsers();
        const foundObject = this.usersStore.users.find(
            (student) => student.id === this.studentId
        );
        if (foundObject) {
            this.studentName = foundObject.username;
        }

        this.getSkillDuration();
    },
    methods: {
        getSkillDuration() {
            fetch(`/student-analytics/skill-durations/${this.studentId}`)
                .then((response) => response.json())
                .then((data) => {
                    this.skillDurations = data;
                    console.log('Skill durations:', this.skillDurations);
                })
                .catch((error) => {
                    console.error('Error fetching last visited skills:', error);
                });
        }
    }
};
</script>

<template>
    <div class="container">
        <h1 class="heading">Time Report: {{ studentName }}</h1>
        <div v-if="this.skillDurations.length > 0" class="mb-4">
            <table class="table">
                <tr>
                    <th>Skill</th>
                    <th>Duration</th>
                </tr>
                <tr
                    v-for="skillDuration in skillDurations"
                    :key="skillDuration.id"
                    class="table-rows"
                >
                    <td>
                        <router-link
                            target="_blank"
                            :to="'/skills/' + skillDuration.url"
                            >{{ skillDuration.name }}</router-link
                        >
                    </td>
                    <td>
                        {{ skillDuration.duration }}
                    </td>
                </tr>
            </table>
        </div>
        <div v-else>
            <p>No skills visited by this student.</p>
        </div>
    </div>
</template>

<style></style>
