<script>
export default {
  data() {
    return {
      userSkills: [],
      noSkills: true,
    };
  },
  props: ['userId'],
  async created() {
    const result = await fetch('/user-skills/unnested-list/' + this.userId);
    this.userSkills = await result.json();
  },
  computed: {
    availableSkills() {
      const availableSkills = [];
      for (let i = 0; i < this.userSkills.length; i++) {
        if (
          (this.userSkills[i].is_accessible == 1) &
          (this.userSkills[i].is_mastered != 1)
        ) {
          availableSkills.push(this.userSkills[i].name);
        }
      }
      if (availableSkills.length > 0) {
        this.noSkills = false;
      }
      return availableSkills;
    },
  },
  methods: {},
};
</script>

<template>
  <!-- <h1 class="text-center text-md-start d-lg-none">My Progress</h1>
  <h2 class="text-center text-md-start d-lg-none">2023 - Active</h2> -->
  <div class="table-responsive">
    <table class="table table-bordered">
      <thead>
        <tr>
          <th scope="col">Available Skills</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="noSkills">
          <td id="no-skill-cell"></td>
        </tr>
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
  color: #ad9af3;
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
}

h2 {
  color: #dcd1fd;
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
}

th {
  background-color: #e8e2f9;
  border-color: #dbd0f9;
  color: #ad9af3;
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
}

td {
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  color: #857d99;
  border-color: #dbd0f9;
}

#no-skill-cell {
  height: 41px;
}
</style>
