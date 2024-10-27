<script>
import { useSkillsStore } from '../../stores/SkillsStore.js';

export default {
    setup() {
        const skillsStore = useSkillsStore();

        return {
            skillsStore
        };
    },
    data() {
        return {
            id: this.$route.params.id,
            newSkillAwaitingApproval: {}
        };
    },
    created() {
        if (this.skillsStore.skillsList.length == 0)
            this.skillsStore.getSkillsList();
        this.getNewSkillAwaitingApproval();
    },
    methods: {
        async getNewSkillAwaitingApproval() {
            await fetch('/new-skills-awaiting-approval/show/' + this.id)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    // Change wording for type.
                    if (data.type == 'domain') {
                        data.type = 'category';
                    }
                    // Get parent name.
                    for (
                        let i = 0;
                        i < this.skillsStore.skillsList.length;
                        i++
                    ) {
                        if (this.skillsStore.skillsList[i].id == data.parent) {
                            data.parent = this.skillsStore.skillsList[i].name;
                        }
                    }

                    this.newSkillAwaitingApproval = data;
                });
        }
    }
};
</script>

<template>
    <div id="banner">
        <!-- Banner image -->
        <img src="/images/banners/institute-collins-2.png" class="img-fluid" />
    </div>
    <div class="container mt-3">
        <div id="skill-info-container">
            <!-- Name -->
            <div>
                <h1 class="skill-name">
                    {{ newSkillAwaitingApproval.name }}
                </h1>
                <!-- A line divide -->
                <hr class="border border-2 opacity-100 hr" />
            </div>
            <!-- Content -->
            <div class="row">
                <!-- Mastery Requirements -->
                <div
                    class="col-md-8 order-2 order-md-1"
                    v-if="newSkillAwaitingApproval.type != 'category'"
                >
                    <div class="d-flex flex-column">
                        <div class="mastery-requirements">
                            <div
                                v-html="
                                    newSkillAwaitingApproval.mastery_requirements
                                "
                            ></div>
                        </div>
                    </div>
                </div>
                <!-- Infobox -->
                <div class="col-md-4 order-1 order-md-2">
                    <div class="info-box p-2 mb-2">
                        <!-- feature image -->
                        <!-- Show a default skill avatar if skill not have image yet -->
                        <img
                            :src="newSkillAwaitingApproval.icon_image"
                            class="rounded img-fluid"
                        />
                        <!-- Parent -->
                        <div class="mt-3" style="color: #a48be6">
                            Parent:
                            <strong>{{
                                newSkillAwaitingApproval.parent
                            }}</strong>
                        </div>
                        <!-- Type -->
                        <div class="mt-3" style="color: #a48be6">
                            Type:
                            <strong>{{ newSkillAwaitingApproval.type }}</strong>
                        </div>
                        <!-- Grade level -->
                        <div
                            class="mt-3"
                            style="color: #a48be6"
                            v-if="newSkillAwaitingApproval.type != 'category'"
                        >
                            Level:
                            <strong>
                                <!-- <div class="h1-title">Level</div> -->
                                <span
                                    v-if="
                                        newSkillAwaitingApproval.level ==
                                        'grade_school'
                                    "
                                    >Grade School</span
                                >
                                <span
                                    v-else-if="
                                        newSkillAwaitingApproval.level ==
                                        'middle_school'
                                    "
                                    >Middle School</span
                                >
                                <span
                                    v-else-if="
                                        newSkillAwaitingApproval.level ==
                                        'high_school'
                                    "
                                    >High School</span
                                >
                                <span
                                    v-else-if="
                                        newSkillAwaitingApproval.level ==
                                        'college'
                                    "
                                    >College</span
                                >
                                <span
                                    v-else-if="
                                        newSkillAwaitingApproval.level == 'phd'
                                    "
                                    >PHD</span
                                >
                            </strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <p>&nbsp;</p>
    </div>
</template>

<style scoped>
.info-box {
    border: 1px solid #a2a9b1;
    color: black;
    background-color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.skill-name {
    font-family: 'Poppins', sans-serif;
    font-size: 40px;
    color: #a48be6;
    font-weight: 800;
    margin-bottom: 0px;
    text-align: start;
}

.h1-title {
    color: #a48be6;
    font-size: 30px;
    font-weight: 700;
    margin-bottom: 5px;
}

.mastery-requirements {
    padding-left: 30px;
    padding-right: 30px;
    padding-top: 10px;
    padding-bottom: 10px;
    background-color: rgba(255, 255, 255, 0.692);
    border-radius: 5px;
    width: 98%;
}

.hr {
    border-color: #aea3ce !important;
}

#skill-info-container {
    background-color: #f2edff;
    border-radius: 12px;
    padding: 30px;
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
    display: flex;
    align-items: center;
    height: 44px;
    text-wrap: nowrap;
}

.purple-btn:hover {
    background-color: #8f7bd6;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Inter', sans-serif;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
}

.green-btn {
    background-color: #36c1af;
    color: white;
    display: flex;
    align-items: center;
    max-width: fit-content;
}

.green-btn:hover {
    background-color: #3eb3a3;
}

.red-btn {
    background-color: #e24d4d;
    color: white;
    border: 1px solid #d33622;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.red-btn:hover {
    background-color: #cc3535;
    color: white;
}

/* Specific phone view css */
@media (max-width: 576px) {
    h2 {
        text-align: center;
    }

    h1 {
        font-size: 2.5rem;
    }

    #skill-info-container {
        background-color: #f2edffcc;
        border-radius: 12px;
        padding: 20px;
    }

    .mastery-requirements {
        width: 100%;
        margin-left: 0px;
        padding-left: 0px;
        padding-right: 0px;
    }

    .skill-name {
        margin-top: 5px;
        font-size: 25px;
        margin: 0px 5px;
    }

    .h1-title {
        font-size: 20px;
        margin-left: 4px;
    }
}

/* ************************* */
/* Tablet Styling */
@media (min-width: 577px) and (max-width: 1023px) {
    #skill-info-container {
        padding: 15px;
    }
}
</style>
