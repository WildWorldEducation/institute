<script>
// Import the store.
import { useTagsStore } from '../../stores/TagsStore.js';
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import { useSkillsStore } from '../../stores/SkillsStore.js';
import { useSkillTreeStore } from '../../stores/SkillTreeStore.js';
import { useUserSkillsStore } from '../../stores/UserSkillsStore.js';

// Nested component.
import Forum from './Forum.vue';

export default {
  setup() {
    const tagsStore = useTagsStore();
    const userDetailsStore = useUserDetailsStore();
    const skillsStore = useSkillsStore();
    const skillTreeStore = useSkillTreeStore();
    const userSkillsStore = useUserSkillsStore();

    // If method hasnt been run before.
    if (tagsStore.tagsList.length == 0) {
      // Run the GET request.
      tagsStore.getTagsList();
    }

    return {
      tagsStore,
      userDetailsStore,
      skillsStore,
      skillTreeStore,
      userSkillsStore,
    };
  },
  data() {
    return {
      skillId: this.$route.params.id,
      skill: {},
      userSkills: [],
      isMastered: false,
      isUnlocked: false,
      skillRequirements: [],
    };
  },
  components: {
    Forum,
  },

  async created() {
    await this.getSkill();
    await this.getUserSkills();
  },
  methods: {
    getSkill() {
      fetch('/skills/show/' + this.skillId)
        .then(function (response) {
          return response.json();
        })
        .then((data) => (this.skill = data))
        .then(() => {
          console.log(this.skill);

          // Go through all the skill tags.
          for (let i = 0; i < this.tagsStore.tagsList.length; i++) {
            // Go through this skill's tags.
            for (let j = 0; j < this.skill.tags.length; j++) {
              // Get the name of the tag, from its ID.
              if (this.tagsStore.tagsList[i].id == this.skill.tags[j].tag_id) {
                this.skill.tags[j].name = this.tagsStore.tagsList[i].name;
              }
            }
          }

          const icon = document.getElementsByTagName('svg');
          if (icon.length > 0) {
            icon[0].style.height = '50px';
          }

          this.skillRequirements.push(this.skill.parent);
        });
    },
    getUserSkills() {
      fetch('/user-skills/unnested-list/' + this.userDetailsStore.userId)
        .then(function (response) {
          return response.json();
        })
        .then((data) => (this.userSkills = data))
        .then(() => {
          for (let i = 0; i < this.userSkills.length; i++) {
            if (this.userSkills[i].id == this.skillId) {
              if (this.userSkills[i].is_mastered == 1) this.isMastered = true;
              if (this.userSkills[i].is_accessible == 1) this.isUnlocked = true;
            }
          }
        });
    },
    // getOtherSkillRequirements() {
    //     fetch('/skills/' + this.skillId + '/other-skill-requirements')
    //         .then(function (response) {
    //             return response.json();
    //         })
    //         .then((data) => {
    //             for (let i = 0; i < data.length; i++) {
    //                 this.skillRequirements.push(data[i].other_skill_requirement_id)
    //             }
    //             console.log(this.skillRequirements)
    //         })
    // },
    async MakeMastered() {
      await this.userSkillsStore.MakeMastered(
        this.userDetailsStore.userId,
        this.skillId
      );
      this.getUserSkills();
    },
  },
};
</script>

<template>
  <div class="container mt-3">
    <div id="skill-info-container">
      <div
        v-if="isUnlocked && !isMastered && userDetailsStore.role == 'student'"
        class="row mt-3"
      >
        <div class="d-flex btn-header flex-row-reverse center-header">
          <button
            v-if="skill.type == 'domain'"
            @click="MakeMastered()"
            class="btn purple-btn"
          >
            Click to unlock child skills
          </button>
          <router-link
            v-else
            class="btn purple-btn"
            :to="skillId + '/assessment'"
            >Take Assessment</router-link
          >
        </div>
      </div>
      <!-- Edit skill only available for Admin -->
      <div
        v-if="userDetailsStore.role == 'admin'"
        class="d-flex flex-row-reverse center-header px-2"
      >
        <router-link
          :to="'/skills/edit/' + skillId"
          class="btn green-btn"
          role="button"
          >Edit&nbsp;&nbsp;
          <!-- Plus sign -->
          <svg
            width="19"
            height="20"
            viewBox="0 0 19 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
              fill="#FFFFFF"
            />
            <path
              d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
              fill="#FFFFFF"
            />
            <path
              d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
              fill="#FFFFFF"
            />
          </svg>
        </router-link>
      </div>
      <div class="row mt-3">
        <div class="col col-lg-2 col-md-3">
          <!-- Show a default skill avatar if skill not have image yet -->
          <img
            :src="
              skill.icon_image
                ? skill.icon_image
                : '/images/skill-avatar/recurso.png'
            "
            class="img-fluid"
          />
        </div>

        <div class="col-lg-10 col-md-9">
          <div class="row">
            <h1>{{ skill.name }}</h1>
          </div>
          <div class="row pe-4 ps-4 ps-md-0">
            <p>{{ skill.description }}</p>
          </div>
        </div>
      </div>
      <!-- <div class="row mt-3">
        <h2>Level</h2>
        <div v-html="skill.level"></div>
      </div> -->
      <!-- A line divide -->
      <div class="row">
        <div class="col col-md-8 p-4 p-md-0">
          <hr id="hr-parent" class="border border-2 opacity-100" />
        </div>
      </div>
      <div class="row mt-3">
        <h2>Mastery Requirements</h2>
        <div v-html="skill.mastery_requirements"></div>
      </div>
      <div v-if="userDetailsStore.role == 'admin'" class="row mt-3">
        <h2>Filter</h2>
        <span v-if="skill.filter_1 == 1"
          >contrary to strict Christian doctrine</span
        >
        <span v-else>none</span>
      </div>
    </div>

    <div
      v-if="userDetailsStore.role == 'admin' && skill.type != 'domain'"
      class="row mt-3"
    >
      <h2>Assessment</h2>
      <div class="col d-flex">
        <router-link
          class="btn purple-btn mt-3"
          :to="skillId + '/question-bank'"
          >Question Bank&nbsp;
          <!-- Pencil icon -->
          <svg
            width="19"
            height="20"
            viewBox="0 0 19 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
              fill="#FFFFFF"
            />
            <path
              d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
              fill="#FFFFFF"
            />
            <path
              d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
              fill="#FFFFFF"
            />
          </svg>
          ></router-link
        >

        <router-link
          class="btn purple-btn mt-3"
          :to="skillId + '/edit-assessment'"
        >
          Assessment
          <svg
            width="19"
            height="20"
            viewBox="0 0 19 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0.75558 19.3181C0.77635 19.5132 0.87137 19.6928 1.02096 19.8198C1.17055 19.9468 1.36325 20.0114 1.55915 20.0002L5.27701 19.8288L0.398438 15.6145L0.75558 19.3181Z"
              fill="#FFFFFF"
            />
            <path
              d="M11.8467 2.24484L0.801758 15.0315L5.6802 19.2454L16.7251 6.45877L11.8467 2.24484Z"
              fill="#FFFFFF"
            />
            <path
              d="M18.2555 3.11796L14.934 0.260817C14.832 0.172259 14.7134 0.104756 14.5852 0.0621907C14.4569 0.0196256 14.3215 0.00283902 14.1868 0.0127967C14.052 0.0227543 13.9205 0.0592596 13.7999 0.120212C13.6793 0.181165 13.572 0.265362 13.484 0.36796L12.4805 1.50725L17.359 5.71439L18.3519 4.56082C18.5289 4.35602 18.6181 4.08969 18.6 3.81958C18.582 3.54948 18.4582 3.29738 18.2555 3.11796Z"
              fill="#FFFFFF"
            />
          </svg>
        </router-link>
      </div>
    </div>
    <div id="resource-hr">
      <hr class="border border-1 opacity-100" />
    </div>
    <div class="row mt-3 mb-3">
      <Forum />
    </div>
    <p>&nbsp;</p>
  </div>
</template>

<style scoped>
.image-attribution-text {
  font-size: smaller;
}
#hr-parent {
  border-color: #aea3ce !important;
}

#resource-hr {
  margin-top: 46px;
  margin-bottom: 46px;
}
#skill-image {
  max-width: 600px;
}

#skill-info-container {
  background-color: #f2edffcc;
  border-radius: 12px;
  padding-top: 59px;
  padding-left: 48px;
}
.purple-btn {
  background-color: #a48be6;
  color: white;
  border: 1px solid #7f56d9;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  max-width: fit-content;
  height: 44px;
  display: flex;
  align-items: center;
}

.green-btn {
  background-color: #36c1af;
  color: white;
  border: 1px solid #2ca695;
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 1rem;
  line-height: 24px;
  display: flex;
  align-items: center;
  height: 44px;
  padding-left: 18px;
  padding-right: 18px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.btn-header {
  justify-content: space-between;
}

@media (max-width: 900px) {
  .center-header {
    justify-content: center;
  }
}

/* Specific phone view css */
@media (max-width: 576px) {
  img {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 50%;
  }

  h1,
  h2 {
    text-align: center;
  }

  h1 {
    font-size: 2.5rem;
    padding-left: 50px;
    padding-right: 50px;
  }

  #skill-info-container {
    background-color: #f2edffcc;
    border-radius: 12px;
    padding-top: 59px;
    padding-left: 0px;
    padding-right: 0px;
  }
}

h2 {
  color: #8f7bd6;
  font-family: 'Poppins', sans-serif;
  font-weight: 900;
  font-size: 1.75rem;
}
</style>
