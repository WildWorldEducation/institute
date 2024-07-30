<script>
import { useUserDetailsStore } from '../../stores/UserDetailsStore.js';
import { useSkillsStore } from '../../stores/SkillsStore';
import { useUsersStore } from '../../stores/UsersStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        const skillsStore = useSkillsStore();
        const usersStore = useUsersStore();

        return {
            userDetailsStore,
            skillsStore,
            usersStore
        };
    },
    data() {
        return {
            skillId: this.$route.params.skillId,
            versionNumber: this.$route.params.versionNumber,
            skillRevision: {},
            currentVersionNumber: null,
            isCurrentVersion: false
        };
    },
    async mounted() {
        // Get list of skills.
        if (this.skillsStore.skillsList.length == 0) {
            await this.skillsStore.getSkillsList();
        }
        // Get list of users.
        if (this.usersStore.users.length == 0) {
            await this.usersStore.getUsers();
        }
        await this.getSkill();
    },
    methods: {
        async getSkill() {
            // Load the skill data
            const res = await fetch('/skills/show/' + this.skillId);
            this.skill = await res.json();
            this.currentVersionNumber = this.skill.version_number;
            await this.getSkillVersion();
        },
        async getSkillVersion() {
            let url =
                '/skill-history/' + this.skillId + '/' + this.versionNumber;

            const res = await fetch(url);
            this.skillRevision = await res.json();

            if (
                this.skillRevision.version_number == this.currentVersionNumber
            ) {
                this.isCurrentVersion = true;
            }

            // Get name of parent.
            for (let i = 0; i < this.skillsStore.skillsList.length; i++) {
                if (
                    this.skillsStore.skillsList[i].id ==
                    this.skillRevision.parent
                ) {
                    this.skillRevision.parentName =
                        this.skillsStore.skillsList[i].name;
                }
            }

            // Get name of user that made the revision.
            for (let i = 0; i < this.usersStore.users.length; i++) {
                if (this.usersStore.users[i].id == this.skillRevision.user_id) {
                    this.skillRevision.userName =
                        this.usersStore.users[i].username;
                }
            }

            // Prep the date and time data ---------------
            var date = this.skillRevision.edited_date.replace('T', ' ');
            date = date.replace('Z', ' ');
            let newDate = date.split(/[- :]/);
            var finalDate = new Date(
                Date.UTC(
                    newDate[0],
                    newDate[1] - 1,
                    newDate[2],
                    newDate[3],
                    newDate[4],
                    newDate[5]
                )
            );
            var options = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
            };
            this.skillRevision.date = finalDate.toLocaleDateString(
                'en-US',
                options
            );
        },
        revert() {
            if (
                confirm(
                    'Are you sure you want to revert the skill to this version?'
                )
            ) {
                const requestOptions = {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' }
                };
                var url =
                    '/skill-history/' +
                    this.skillId +
                    '/revert-to/' +
                    this.versionNumber;
                fetch(url, requestOptions).then(() => {
                    this.$router.push('/skills/' + this.skillId);
                });
            }
        }
    }
};
</script>

<template>
    <div class="position-relative d-flex">
        <div class="container show-skill-ctnr">
            <div class="container mt-3">
                <div id="skill-info-container">
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
                            <div
                                class="alert alert-warning d-flex"
                                role="alert"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="20"
                                    height="20"
                                >
                                    <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
                                    <path
                                        d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
                                    />
                                </svg>
                                <span v-if="!isCurrentVersion" class="ms-2">
                                    This is an old revision of this page, as
                                    edited by {{ skillRevision.userName }}, at
                                    {{ skillRevision.date }}.
                                </span>
                                <span v-else class="ms-2">
                                    This is the current revision of this page,
                                    as edited by {{ skillRevision.userName }},
                                    at {{ skillRevision.date }}.
                                </span>
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
                    <div>
                        <!-- A line divide -->
                        <div class="row">
                            <div class="col col-md-8 p-4 p-md-0">
                                <hr
                                    id="hr-parent"
                                    class="border border-2 opacity-100"
                                />
                            </div>
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
                </div>
                <button
                    v-if="!isCurrentVersion"
                    class="btn purple-btn mt-2"
                    @click="revert()"
                >
                    Revert to this version
                </button>
                <p>&nbsp;</p>
            </div>
        </div>
        <div id="banner">
            <img
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
