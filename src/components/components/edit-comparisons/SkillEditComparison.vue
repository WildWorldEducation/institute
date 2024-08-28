<script>
import HtmlDiff from 'htmldiff-js';
import { nextTick } from 'vue';

export default {
    setup() {},
    data() {
        return {
            skillId: this.$route.params.contentId,
            userId: this.$route.params.userId,
            skill: {},
            skillEdit: {},
            comment: '',
            isEditMode: false,
            changeIcon: false,
            changeBanner: false,
            changeMasteryText: false,
            diffHtml: '',
            showEditMastery: false,
            showBannerChange: true,
            showIconChange: true,
            showSkillMasteryChange: true,
            showHighLight: true
        };
    },
    async created() {
        await this.getSkillEdit();
        await this.getSkill();

        if (this.skill.banner_image !== this.skillEdit.banner_image) {
            this.changeBanner = true;
        }

        if (this.skill.icon_image !== this.skillEdit.icon_image) {
            this.changeIcon = true;
        }

        if (
            this.skill.mastery_requirements !==
            this.skillEdit.mastery_requirements
        ) {
            this.changeMasteryText = true;
            // Compare two mastery requirement html string
            this.diffHtml = HtmlDiff.execute(
                this.skill.mastery_requirements,
                this.skillEdit.mastery_requirements
            );
        }

        // // Render the Summernote content.
        // $('#summernote').summernote(
        //     'code',
        //     this.skillEdit.mastery_requirements
        // );
        // Disable editing.
        $('#summernote')
            .next()
            .find('.note-editable')
            .attr('contenteditable', false);
    },
    methods: {
        async getSkillEdit() {
            await fetch(
                '/skills/submitted-for-review/' +
                    this.skillId +
                    '/' +
                    this.userId
            )
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.skillEdit = data;
                    console.log(this.skillEdit);
                    this.comment = data.comment;
                });
        },
        async getSkill() {
            await fetch('/skills/show/' + this.skillId)
                .then(function (response) {
                    return response.json();
                })
                .then((data) => {
                    this.skill = data;
                });
        },
        dismissEdit() {
            if (confirm('Delete this edit?')) {
                const result = fetch(
                    '/skills/submitted-for-review/' +
                        this.skillId +
                        '/' +
                        this.userId,
                    {
                        method: 'DELETE'
                    }
                );

                if (result.error) {
                    console.log(result.error);
                }

                // Return to hub page.
                this.$router.back();
            }
        },
        dismissIcon() {
            if (confirm('Revert the icon?')) {
                this.skillEdit.icon_image = this.skill.icon_image;
            }
        },
        dismissBanner() {
            if (confirm('Revert the banner?')) {
                this.skillEdit.banner_image = this.skill.banner_image;
            }
        },
        applyMasteryChange() {
            this.$parent.disableBtn = false;
            this.skillEdit.mastery_requirements =
                $('#summernote').summernote('code');

            // re-compare ordinal html with newly apply html
            this.diffHtml = HtmlDiff.execute(
                this.skill.mastery_requirements,
                this.skillEdit.mastery_requirements
            );
            this.showEditMastery = false;
        },
        cancelEditMastery() {
            this.$parent.disableBtn = false;
            this.showEditMastery = false;
        },
        edit() {
            this.showEditMastery = true;
            this.isEditMode = true;
            this.$parent.disableBtn = true;
            nextTick(() => {
                $('#summernote')
                    .summernote({
                        toolbar: [
                            // [groupName, [list of button]]
                            ['style', ['bold', 'italic', 'underline', 'clear']],
                            [
                                'font',
                                ['strikethrough', 'superscript', 'subscript']
                            ],
                            ['fontsize', ['fontsize']],
                            ['color', ['color']],
                            ['para', ['ul', 'ol', 'paragraph']],
                            ['height', ['height']]
                        ]
                    })
                    .next()
                    .find('.note-editable')
                    .attr('contenteditable', true);
            });
        },
        saveEdit() {
            const requestOptions = {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mastery_requirements: this.skillEdit.mastery_requirements,
                    icon_image: this.skillEdit.icon_image,
                    banner_image: this.skillEdit.banner_image,
                    comment: this.comment,
                    edit: this.isEditMode
                })
            };

            var url =
                '/skills/' + this.skillEdit.skill_id + '/edit-for-review/save';
            fetch(url, requestOptions).then(() => {
                this.$router.back();
            });

            // Delete it afterwards.
            const result = fetch(
                '/skills/submitted-for-review/' +
                    this.skillId +
                    '/' +
                    this.userId,
                {
                    method: 'DELETE'
                }
            );

            if (result.error) {
                console.log(result.error);
            }
        }
    }
};
</script>

<template>
    <div class="mt-4 mb-4">
        <h1 class="page-title">Skill Change Comparison</h1>
        <hr />
        <!-- ---General info of skills -->
        <div class="d-flex flex-column gap-2 mb-3">
            <div class="d-flex gap-2 align-items-center">
                <div class="compare-container-tile">Skill:</div>
                <div class="minor-text">{{ skill.name }}</div>
            </div>
            <div class="d-flex gap-2 align-items-center">
                <div class="compare-container-tile">Level:</div>
                <div class="minor-text">{{ skill.level }}</div>
            </div>
        </div>
        <!-- ---Banner image compare -->
        <div v-if="changeBanner">
            <div class="compare-container">
                <div class="d-flex align-items-center">
                    <h2 class="compare-container-tile mb-3">Banner</h2>
                    <div
                        @click="showBannerChange = !showBannerChange"
                        :class="[
                            showBannerChange ? 'expand-arrow' : 'minimize-arrow'
                        ]"
                        b-on-hover
                        :title="showBannerChange ? 'minimize' : 'expand'"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="16"
                            heigh="16"
                            fill="#475569"
                        >
                            <path
                                d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                            />
                        </svg>
                    </div>
                </div>
                <Transition name="dropdown">
                    <div v-if="showBannerChange">
                        <div class="d-flex flex-lg-row flex-column">
                            <!-- Old Banner -->
                            <div class="old-container banner-container">
                                <div class="container-tile">Original</div>
                                <img
                                    :src="skill.banner_image"
                                    class="banner-image"
                                />
                            </div>
                            <!-- Long arrow pointing right -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                width="50"
                                height="50"
                                fill="#ac90e8"
                                class="d-none d-lg-block my-auto mx-1"
                            >
                                <path
                                    d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
                                />
                            </svg>
                            <!-- Long arrow pointing down on tablet and mobile-->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 320 512"
                                fill="#ac90e8"
                                height="50"
                                width="50"
                                class="mx-auto my-2 d-lg-none"
                            >
                                <path
                                    d="M2 334.5c-3.8 8.8-2 19 4.6 26l136 144c4.5 4.8 10.8 7.5 17.4 7.5s12.9-2.7 17.4-7.5l136-144c6.6-7 8.4-17.2 4.6-26s-12.5-14.5-22-14.5l-72 0 0-288c0-17.7-14.3-32-32-32L128 0C110.3 0 96 14.3 96 32l0 288-72 0c-9.6 0-18.2 5.7-22 14.5z"
                                />
                            </svg>
                            <!-- New Banner -->
                            <div class="new-container banner-container">
                                <div class="container-tile">Changed</div>
                                <img
                                    :src="skillEdit.banner_image"
                                    class="banner-image"
                                />
                            </div>
                        </div>
                        <div>
                            <button
                                class="btn red-btn ms-auto me-0 mt-3"
                                @click="dismissBanner()"
                            >
                                Revert &nbsp;&nbsp;
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="20"
                                    height="20"
                                    fill="white"
                                >
                                    <path
                                        d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9L0 168c0 13.3 10.7 24 24 24l110.1 0c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24l0 104c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65 0-94.1c0-13.3-10.7-24-24-24z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
        <!-- ---Icon image compare -->
        <div v-if="changeIcon" class="mt-5">
            <div class="compare-container">
                <div class="d-flex align-items-center">
                    <h2 class="compare-container-tile mb-3">Skill Icon</h2>
                    <div
                        @click="showIconChange = !showIconChange"
                        :class="[
                            showIconChange ? 'expand-arrow' : 'minimize-arrow'
                        ]"
                        b-on-hover
                        :title="showIconChange ? 'minimize' : 'expand'"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="16"
                            heigh="16"
                            fill="#475569"
                        >
                            <path
                                d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                            />
                        </svg>
                    </div>
                </div>
                <Transition name="dropdown">
                    <div v-if="showIconChange">
                        <div class="d-flex flex-lg-row flex-column">
                            <!-- Old Banner -->
                            <div class="old-container icon-container">
                                <div class="container-tile">Original</div>
                                <img
                                    :src="skill.icon_image"
                                    class="icon-image"
                                />
                            </div>
                            <!-- Long arrow pointing right -->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                width="50"
                                height="50"
                                fill="#ac90e8"
                                class="d-none d-lg-block my-auto mx-1"
                            >
                                <path
                                    d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
                                />
                            </svg>
                            <!-- Long arrow pointing down on tablet and mobile-->
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 320 512"
                                fill="#ac90e8"
                                height="50"
                                width="50"
                                class="mx-auto my-2 d-lg-none"
                            >
                                <path
                                    d="M2 334.5c-3.8 8.8-2 19 4.6 26l136 144c4.5 4.8 10.8 7.5 17.4 7.5s12.9-2.7 17.4-7.5l136-144c6.6-7 8.4-17.2 4.6-26s-12.5-14.5-22-14.5l-72 0 0-288c0-17.7-14.3-32-32-32L128 0C110.3 0 96 14.3 96 32l0 288-72 0c-9.6 0-18.2 5.7-22 14.5z"
                                />
                            </svg>
                            <!-- New Banner -->
                            <div class="new-container icon-container">
                                <div class="container-tile">Changed</div>
                                <img
                                    :src="skillEdit.icon_image"
                                    class="icon-image"
                                />
                            </div>
                        </div>
                        <div>
                            <button
                                class="btn red-btn ms-auto me-0 mt-3"
                                @click="dismissIcon()"
                            >
                                Revert &nbsp;&nbsp;
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 512 512"
                                    width="20"
                                    height="20"
                                    fill="white"
                                >
                                    <path
                                        d="M75 75L41 41C25.9 25.9 0 36.6 0 57.9L0 168c0 13.3 10.7 24 24 24l110.1 0c21.4 0 32.1-25.9 17-41l-30.8-30.8C155 85.5 203 64 256 64c106 0 192 86 192 192s-86 192-192 192c-40.8 0-78.6-12.7-109.7-34.4c-14.5-10.1-34.4-6.6-44.6 7.9s-6.6 34.4 7.9 44.6C151.2 495 201.7 512 256 512c141.4 0 256-114.6 256-256S397.4 0 256 0C185.3 0 121.3 28.7 75 75zm181 53c-13.3 0-24 10.7-24 24l0 104c0 6.4 2.5 12.5 7 17l72 72c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-65-65 0-94.1c0-13.3-10.7-24-24-24z"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </div>
        <!-- ---Mastery requirement compare -->
        <div
            v-if="changeMasteryText && !showEditMastery"
            class="compare-container mt-5"
        >
            <div class="d-flex align-items-center">
                <h2 class="compare-container-tile">Mastery Requirements</h2>
                <div
                    @click="showSkillMasteryChange = !showSkillMasteryChange"
                    :class="[
                        'mt-2',
                        showSkillMasteryChange
                            ? 'expand-arrow'
                            : 'minimize-arrow'
                    ]"
                    b-on-hover
                    :title="showSkillMasteryChange ? 'minimize' : 'expand'"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="16"
                        heigh="16"
                        fill="#475569"
                    >
                        <path
                            d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
                        />
                    </svg>
                </div>
            </div>
            <Transition name="dropdown">
                <div v-if="showSkillMasteryChange">
                    <div class="d-flex flex-row-reverse me-3 mt-3">
                        <div
                            class="btn green-btn d-flex align-items-center"
                            @click="showHighLight = !showHighLight"
                        >
                            {{ showHighLight ? 'Hide' : 'Show' }} Hight Light
                            <svg
                                v-if="showHighLight"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 576 512"
                                width="30"
                                height="30"
                                fill="white"
                                class="ms-2"
                            >
                                <path
                                    d="M288 80c-65.2 0-118.8 29.6-159.9 67.7C89.6 183.5 63 226 49.4 256c13.6 30 40.2 72.5 78.6 108.3C169.2 402.4 222.8 432 288 432s118.8-29.6 159.9-67.7C486.4 328.5 513 286 526.6 256c-13.6-30-40.2-72.5-78.6-108.3C406.8 109.6 353.2 80 288 80zM95.4 112.6C142.5 68.8 207.2 32 288 32s145.5 36.8 192.6 80.6c46.8 43.5 78.1 95.4 93 131.1c3.3 7.9 3.3 16.7 0 24.6c-14.9 35.7-46.2 87.7-93 131.1C433.5 443.2 368.8 480 288 480s-145.5-36.8-192.6-80.6C48.6 356 17.3 304 2.5 268.3c-3.3-7.9-3.3-16.7 0-24.6C17.3 208 48.6 156 95.4 112.6zM288 336c44.2 0 80-35.8 80-80s-35.8-80-80-80c-.7 0-1.3 0-2 0c1.3 5.1 2 10.5 2 16c0 35.3-28.7 64-64 64c-5.5 0-10.9-.7-16-2c0 .7 0 1.3 0 2c0 44.2 35.8 80 80 80zm0-208a128 128 0 1 1 0 256 128 128 0 1 1 0-256z"
                                />
                            </svg>
                            <svg
                                v-else
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 640 512"
                                width="30"
                                height="30"
                                fill="white"
                                class="ms-2"
                            >
                                <path
                                    d="M38.8 5.1C28.4-3.1 13.3-1.2 5.1 9.2S-1.2 34.7 9.2 42.9l592 464c10.4 8.2 25.5 6.3 33.7-4.1s6.3-25.5-4.1-33.7L525.6 386.7c39.6-40.6 66.4-86.1 79.9-118.4c3.3-7.9 3.3-16.7 0-24.6c-14.9-35.7-46.2-87.7-93-131.1C465.5 68.8 400.8 32 320 32c-68.2 0-125 26.3-169.3 60.8L38.8 5.1zm151 118.3C226 97.7 269.5 80 320 80c65.2 0 118.8 29.6 159.9 67.7C518.4 183.5 545 226 558.6 256c-12.6 28-36.6 66.8-70.9 100.9l-53.8-42.2c9.1-17.6 14.2-37.5 14.2-58.7c0-70.7-57.3-128-128-128c-32.2 0-61.7 11.9-84.2 31.5l-46.1-36.1zM394.9 284.2l-81.5-63.9c4.2-8.5 6.6-18.2 6.6-28.3c0-5.5-.7-10.9-2-16c.7 0 1.3 0 2 0c44.2 0 80 35.8 80 80c0 9.9-1.8 19.4-5.1 28.2zm9.4 130.3C378.8 425.4 350.7 432 320 432c-65.2 0-118.8-29.6-159.9-67.7C121.6 328.5 95 286 81.4 256c8.3-18.4 21.5-41.5 39.4-64.8L83.1 161.5C60.3 191.2 44 220.8 34.5 243.7c-3.3 7.9-3.3 16.7 0 24.6c14.9 35.7 46.2 87.7 93 131.1C174.5 443.2 239.2 480 320 480c47.8 0 89.9-12.9 126.2-32.5l-41.9-33zM192 256c0 70.7 57.3 128 128 128c13.3 0 26.1-2 38.2-5.8L302 334c-23.5-5.4-43.1-21.2-53.7-42.3l-56.1-44.2c-.2 2.8-.3 5.6-.3 8.5z"
                                />
                            </svg>
                        </div>
                    </div>
                    <div
                        v-if="showHighLight"
                        class="ms-auto me-3 mt-3 explain-div"
                    >
                        <!-- Explain Label -->
                        <div
                            class="d-flex align-items-center w-fit justify-content-between gap-2"
                        >
                            <div class="label-name">Added:</div>
                            <div class="added-block"></div>
                        </div>
                        <div
                            class="d-flex align-items-center gap-2 justify-content-between"
                        >
                            <div class="label-name">Remove:</div>
                            <div class="remove-block"></div>
                        </div>
                        <div
                            class="d-flex align-items-center gap-2 justify-content-between"
                        >
                            <div class="label-name">Unchange:</div>
                            <div class="unchange-block"></div>
                        </div>
                    </div>
                    <div class="d-flex flex-lg-row flex-column mt-4">
                        <div
                            class="old-container skill-mastery-container d-none d-lg-block"
                        >
                            <div class="container-tile">Original</div>
                            <div
                                class="innerHTMLmastery"
                                v-html="skill.mastery_requirements"
                            ></div>
                        </div>
                        <!-- Long arrow pointing right -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="50"
                            height="50"
                            fill="#ac90e8"
                            class="d-none d-lg-block my-auto mx-1"
                        >
                            <path
                                d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
                            />
                        </svg>

                        <div class="new-container skill-mastery-container">
                            <div class="container-tile">Changed</div>
                            <!-- HTML change content -->
                            <div
                                v-if="showHighLight"
                                class="innerHTMLmastery"
                                v-html="diffHtml"
                            ></div>
                            <div
                                v-else
                                class="innerHTMLmastery"
                                v-html="skillEdit.mastery_requirements"
                            ></div>
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
        <!-- Skill mastery edit with summernote -->
        <div v-else class="mt-5 compare-container">
            <h2 class="compare-container-tile my-3">
                Edit Mastery Requirement
            </h2>
            <textarea
                class="form-control"
                id="summernote"
                rows="33"
                v-model="skillEdit.mastery_requirements"
            ></textarea>
            <div class="d-flex flex-row-reverse gap-3">
                <div
                    class="btn green-btn d-flex align-items-center my-3"
                    @click="applyMasteryChange"
                >
                    Apply
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 576 512"
                        width="22"
                        heigh="22"
                        fill="white"
                        class="ms-2"
                    >
                        <path
                            d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 125.7-86.8 86.8c-10.3 10.3-17.5 23.1-21 37.2l-18.7 74.9c-2.3 9.2-1.8 18.8 1.3 27.5L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128zM549.8 235.7l14.4 14.4c15.6 15.6 15.6 40.9 0 56.6l-29.4 29.4-71-71 29.4-29.4c15.6-15.6 40.9-15.6 56.6 0zM311.9 417L441.1 287.8l71 71L382.9 487.9c-4.1 4.1-9.2 7-14.9 8.4l-60.1 15c-5.5 1.4-11.2-.2-15.2-4.2s-5.6-9.7-4.2-15.2l15-60.1c1.4-5.6 4.3-10.8 8.4-14.9z"
                        />
                    </svg>
                </div>
                <div
                    class="btn red-btn d-flex align-items-center my-3"
                    @click="cancelEditMastery"
                >
                    Cancel
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="22"
                        heigh="22"
                        fill="white"
                        class="ms-2"
                    >
                        <path
                            d="M64 80c-8.8 0-16 7.2-16 16l0 320c0 8.8 7.2 16 16 16l384 0c8.8 0 16-7.2 16-16l0-320c0-8.8-7.2-16-16-16L64 80zM0 96C0 60.7 28.7 32 64 32l384 0c35.3 0 64 28.7 64 64l0 320c0 35.3-28.7 64-64 64L64 480c-35.3 0-64-28.7-64-64L0 96zm175 79c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
                        />
                    </svg>
                </div>
            </div>
        </div>
        <!-- User Comment -->
        <div class="mt-5 w-lg-50 w-md-75 w-100 compare-container">
            <div class="d-flex flex-md-row flex-column gap-2">
                <h2 class="compare-container-tile mb-3">Comment:</h2>
                <div class="comment-text">
                    {{ skillEdit.comment }}
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.green-btn {
    background-color: rgb(46, 126, 38);
}

.green-btn:hover {
    background-color: rgb(55, 148, 47);
    color: white;
}

.page-title {
    color: #a48be7;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
}

.banner-image {
    width: auto;
    height: auto;
    max-width: 80%;
    max-height: 80%;
    margin-top: auto;
    margin-bottom: auto;
}

.icon-image {
    width: auto;
    height: 80%;
}

.icon-image {
    max-width: 50%;
}

.compare-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-radius: 5px;
    padding: 10px 15px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.old-container {
    position: relative;
    background-color: white;
    border: 1px solid rgb(163, 42, 42);
    border-radius: 10px;
    padding: 10px 15px;
    color: rgb(163, 42, 42);
}

.new-container {
    position: relative;
    background-color: white;
    border: 1px solid rgb(46, 126, 38);
    border-radius: 10px;
    padding: 10px 15px;
    color: rgb(46, 126, 38);
}

.skill-mastery-container {
    width: 48%;
    height: fit-content;
}

.banner-container {
    width: 100%;
    height: 400;
    display: flex;
    justify-content: center;
}

.icon-container {
    width: 100%;
    height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.container-tile {
    position: absolute;
    top: -15px;
    font-size: 18px;
    left: 20px;
    padding-left: 5px;
    padding-right: 5px;
    background-color: white;
}

.innerHTMLmastery {
    color: black;
}

.explain-div {
    width: fit-content;
}

.label-name {
    color: #707375;
    font-size: 16px;
}

.added-block {
    height: 20px;
    width: 20px;
    background-color: #81d5b9;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.remove-block {
    height: 20px;
    width: 20px;
    background-color: #faa5a5;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.unchange-block {
    height: 20px;
    width: 20px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
    border-radius: 2px;
}

/* ======== Style for skill mastery comparison ========  */
:deep(ins) {
    background-color: #81d5b9;
    border-radius: 4px;
    color: black;

    text-decoration: none;
}

:deep(del) {
    background-color: #faa5a5;
    color: black;

    border-radius: 4px;
    text-decoration-color: black;
}

/* Slide down animation */
@keyframes slide {
    0% {
        opacity: 0;
        transform: scaleY(0);
    }

    100% {
        opacity: 1;
        transform: scaleY(1);
    }
}
.dropdown-enter-active {
    transform-origin: top center;
    animation: slide 0.2s;
}
.dropdown-leave-active {
    transform-origin: top center;
    animation: slide 0.2s reverse;
}

/* End of sliding animation */

.expand-arrow {
    margin-left: 5px;
    margin-right: auto;
    margin-bottom: 10px;
    animation: rotation 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    cursor: pointer;
}

.minimize-arrow {
    margin-left: 5px;
    margin-right: auto;
    margin-bottom: 20px;
    animation: rotationBack 0.2s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    cursor: pointer;
}

@keyframes rotation {
    from {
        transform: rotate(0deg);
    }

    to {
        transform: rotate(180deg);
    }
}

@keyframes rotationBack {
    from {
        transform: rotate(180deg);
    }

    to {
        transform: rotate(0deg);
    }
}

.comment-text {
    background-color: #f1f5f9;
    border-radius: 5px;
    padding: 15px;
    width: 100%;
}

/* Specific phone view css */
@media (max-width: 576px) {
    img {
        display: block;
        margin-left: auto;
        margin-right: auto;
    }

    .icon-image {
        max-width: 100%;
        height: auto;
        margin: auto;
    }

    .skill-mastery-container {
        width: 100%;
    }
}

/* ************************* */
/* Tablet Styling */
@media (min-width: 577px) and (max-width: 1023px) {
    .skill-mastery-container {
        width: 100%;
    }
}
</style>
