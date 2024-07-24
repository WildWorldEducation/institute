<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();

        return {
            userDetailsStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.skillId,
            versionNumber: this.$route.params.versionNumber,
            skillRevision: {}
        };
    },
    async created() {
        await this.getSkillVersion();
    },
    methods: {
        async getSkillVersion() {
            let url =
                '/skill-history/' + this.skillId + '/' + this.versionNumber;

            const res = await fetch(url);
            this.skillRevision = await res.json();
            console.log(this.skillRevision);
        }
    }
};
</script>

<template>
    <div class="position-relative d-flex">
        <div class="container show-skill-ctnr">
            <div class="container mt-3">
                <div
                    id="skill-info-container"
                    :class="{ domain: skillRevision.type == 'domain' }"
                >
                    <!-- Skill Info -->
                    <div class="d-flex flex-column gap-2">
                        <!-- Skill image -->
                        <div id="skill-image">
                            <!-- Show a default skill avatar if skill not have image yet -->
                            <img
                                :src="
                                    skillRevision.icon_image
                                        ? skillRevision.icon_image
                                        : '/images/skill-avatar/recurso.png'
                                "
                                class="skill-icon"
                            />
                        </div>
                        <!-- Skill name and skill description -->
                        <div class="d-flex flex-column">
                            <div class="skill-name">
                                {{ skillRevision.name }}
                            </div>
                            <!-- Description only seen by admins -->
                            <div
                                v-if="userDetailsStore.role == 'admin'"
                                class="row pe-4 ps-4 ps-md-0 skill-description"
                            >
                                <p>{{ skillRevision.description }}</p>
                            </div>
                        </div>
                    </div>
                    <div v-if="skillRevision.type != 'domain'">
                        <!-- A line divide -->
                        <div class="row">
                            <div class="col col-md-8 p-4 p-md-0">
                                <hr
                                    id="hr-parent"
                                    class="border border-2 opacity-100"
                                />
                            </div>
                        </div>
                        <!-- Level -->
                        <div class="mt-3 d-flex flex-column">
                            <div class="h1-title">Level</div>
                            <span v-if="skillRevision.level == 'grade_school'"
                                >Grade School</span
                            >
                            <span
                                v-else-if="
                                    skillRevision.level == 'middle_school'
                                "
                                >Middle School</span
                            >
                            <span
                                v-else-if="skillRevision.level == 'high_school'"
                                >High School</span
                            >
                            <span v-else-if="skillRevision.level == 'college'"
                                >College</span
                            >
                            <span v-else-if="skillRevision.level == 'phd'"
                                >PHD</span
                            >
                        </div>
                        <!-- Mastery Requirements -->
                        <div class="mt-3 d-flex flex-column">
                            <div class="h1-title">Mastery Requirements</div>
                            <div class="mastery-requirements">
                                <div
                                    v-html="skillRevision.mastery_requirements"
                                ></div>
                            </div>
                        </div>
                    </div>
                    <!-- A line divide -->
                    <div v-if="userDetailsStore.role == 'admin'">
                        <div class="row">
                            <div class="col col-md-8 p-4 p-md-0">
                                <hr
                                    id="hr-parent"
                                    class="border border-2 opacity-100"
                                />
                            </div>
                        </div>
                        <!-- Filters -->
                        <div class="row mt-3">
                            <div class="h1-title">Filter</div>
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
                                    disabled
                                />
                                <div class="control_indicator"></div>
                            </label>
                        </div>
                    </div>
                    <!-- A line divide -->
                    <div
                        v-if="
                            (userDetailsStore.role == 'admin' ||
                                userDetailsStore.role == 'editor') &&
                            skillRevision.type != 'domain'
                        "
                    >
                        <div class="row">
                            <div class="col col-md-8 p-4 p-md-0">
                                <hr
                                    id="hr-parent"
                                    class="border border-2 opacity-100"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <p>&nbsp;</p>
            </div>
        </div>
        <div id="banner">
            <!--TODO: Assign banner dynamically -->
            <img v-bind:src="bannerImage" class="img-fluid" />
            <!-- Show a static img if skill have no banner image -->
            <img
                v-if="!bannerImage"
                src="/images/banners/institute-collins-2.png"
                class="img-fluid"
            />
        </div>
    </div>
</template>

<style scoped>
.image-attribution-text {
    font-size: smaller;
}

.skill-icon {
    width: fit-content;
    height: auto;
}

.skill-name {
    font-family: 'Poppins', sans-serif;
    font-size: 40px;
    margin-top: -12px;
    color: #a48be6;
    font-weight: 800;
}

.skill-description {
    font-family: 'Poppins', sans-serif;
    color: #888;
}

.h1-title {
    color: #a48be6;
    font-size: 30px;
    font-weight: 700;
    margin-bottom: 5px;
}

/* some override bootstrap css */
.show-skill-ctnr {
    z-index: 10 !important;
    width: 100%;
    margin-top: 40px;
}

#banner {
    z-index: -10 !important;
    top: 0px;
    position: absolute !important;
    width: 100%;
}

.img-fluid {
    width: 100% !important;
}

.top-btn {
    width: 190px;
    height: auto;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
    border-radius: 8px;
    border-color: #7f56d9;
    border-width: 1px;
    background-color: #a48be6;
    color: white;
    font-size: 1rem;
}

.top-btn:hover {
    background-color: #7f56d9;
}

#btn-row {
    padding-top: 21px;
    display: flex;
    flex-direction: row;
    justify-content: end;
    width: 100%;
}

#assessment-btn {
    margin-right: 15px;
}

/* View Specific On Phone */
@media (min-width: 0px) and (max-width: 576px) {
    #btn-row {
        padding-top: 21px;
        display: flex;
        flex-direction: row;
        justify-content: center;
        width: 100%;
    }
}
</style>
