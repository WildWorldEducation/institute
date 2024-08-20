<script>
import HtmlDiff from 'htmldiff-js';

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
            diffHtml: ''
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
            console.log(this.diffHtml);
        }

        // Render the Summernote content.
        $('#summernote').summernote(
            'code',
            this.skillEdit.mastery_requirements
        );
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
        edit() {
            $('#summernote')
                .next()
                .find('.note-editable')
                .attr('contenteditable', true);
            this.isEditMode = true;
        },
        saveEdit() {
            // Update this content, in case it has been changed.
            this.skillEdit.mastery_requirements =
                $('#summernote').summernote('code');

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
        <h1 class="page-title">Comparison</h1>
        <hr />
        <!-- Banner image compare -->
        <div v-if="changeBanner">
            <div class="compare-container">
                <div class="compare-container-tile mb-3">Banner</div>
                <div class="d-flex flex-lg-row flex-column">
                    <!-- Old Banner -->
                    <div class="old-container banner-container">
                        <div class="container-tile">Original</div>
                        <img :src="skill.banner_image" class="banner-image" />
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
                        height="70"
                        width="70"
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
                <div class="ms-auto me-0 mt-3">
                    <button class="btn red-btn" @click="dismissIcon()">
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
        </div>
        <!-- Icon image compare -->
        <div v-if="changeIcon" class="mt-5">
            <div class="compare-container">
                <div class="compare-container-tile mb-3">Skill Icon</div>
                <div class="d-flex flex-lg-row flex-column">
                    <!-- Old Banner -->
                    <div class="old-container icon-container">
                        <div class="container-tile">Original</div>
                        <img :src="skill.icon_image" class="icon-image" />
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
                        height="70"
                        width="70"
                        class="mx-auto my-2 d-lg-none"
                    >
                        <path
                            d="M2 334.5c-3.8 8.8-2 19 4.6 26l136 144c4.5 4.8 10.8 7.5 17.4 7.5s12.9-2.7 17.4-7.5l136-144c6.6-7 8.4-17.2 4.6-26s-12.5-14.5-22-14.5l-72 0 0-288c0-17.7-14.3-32-32-32L128 0C110.3 0 96 14.3 96 32l0 288-72 0c-9.6 0-18.2 5.7-22 14.5z"
                        />
                    </svg>
                    <!-- New Banner -->
                    <div class="new-container icon-container">
                        <div class="container-tile">Changed</div>
                        <img :src="skillEdit.icon_image" class="icon-image" />
                    </div>
                </div>
                <div class="ms-auto me-0 mt-3">
                    <button class="btn red-btn" @click="dismissIcon()">
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
        </div>
        <!-- Mastery requirement compare -->
        <div v-if="changeMasteryText" class="compare-container mt-5">
            <div class="compare-container-tile">Mastery Requirements</div>
            <div class="d-flex flex-lg-row flex-column mt-4">
                <div class="old-container skill-mastery-container">
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
                    <div class="innerHTMLmastery" v-html="diffHtml"></div>
                </div>
            </div>
        </div>
        <!-- -------------------------------------------------------------------------------------------------------------------------------- -->
        <!--************************************ 
            * OLD PAGE WILL GET DELETE LATER   *
            *                                  * 
            ************************************ -->
    </div>
</template>

<style>
.page-title {
    color: #a48be7;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
}

.banner-image {
    width: 80%;
    height: auto;
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

.compare-container-tile {
    color: #a48be7;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 22px;
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
    height: fit-content;
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

/* ======== Style for skill mastery comparison ========  */
ins {
    background-color: rgb(113, 167, 113);
    padding: 2px;
    color: white;
    text-decoration: none;
    margin: 5px;
}

del {
    background-color: rgb(214, 36, 36);
    color: white;
    padding: 2px;
    margin: 5px;
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
}
</style>
