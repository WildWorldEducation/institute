<script>
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
            changeMasteryText: false
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
    <div class="container mt-4 mb-4">
        <h1 class="page-title">Comparison</h1>
        <hr />
        <div v-if="changeBanner" class="d-flex flex-column">
            <h4>Banner</h4>
            <!-- Old Banner -->
            <div class="old-container banner-container">
                <div class="container-tile">Original</div>
                <img :src="skill.banner_image" class="banner-image" />
            </div>
            <!-- Long arrow pointing down -->
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 320 512"
                fill="#ac90e8"
                height="70"
                width="70"
                class="mx-auto mt-1"
            >
                <path
                    d="M2 334.5c-3.8 8.8-2 19 4.6 26l136 144c4.5 4.8 10.8 7.5 17.4 7.5s12.9-2.7 17.4-7.5l136-144c6.6-7 8.4-17.2 4.6-26s-12.5-14.5-22-14.5l-72 0 0-288c0-17.7-14.3-32-32-32L128 0C110.3 0 96 14.3 96 32l0 288-72 0c-9.6 0-18.2 5.7-22 14.5z"
                />
            </svg>
            <!-- New Banner -->
            <div class="new-container banner-container">
                <div class="container-tile">Changed</div>
                <img :src="skill.banner_image" class="banner-image" />
            </div>
        </div>
        <!-- Banner image compare -->
        <!-- -------------------------------------------------------------------------------------------------------------------------------- -->
        <!--************************************ 
            * OLD PAGE WILL GET DELETE LATER   *
            *                                  * 
            ************************************ -->
        <div class="row">
            <div class="col-sm">
                <h2>Change</h2>
                <h5>Icon</h5>
                <div class="">
                    <img
                        v-if="skillEdit.icon_image"
                        :src="skillEdit.icon_image"
                        class="icon-image border border-dark rounded"
                    />
                    <p v-else>No icon</p>
                    <p class="mt-2">
                        <button class="btn red-btn" @click="dismissIcon()">
                            Remove &nbsp;&nbsp;
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                width="20"
                                height="20"
                                fill="white"
                            >
                                <path
                                    d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
                                />
                            </svg>
                        </button>
                    </p>
                </div>
                <h5 class="mt-3">Banner</h5>
                <div>
                    <img
                        v-if="skillEdit.banner_image"
                        :src="skillEdit.banner_image"
                        class="banner-image border border-dark rounded"
                    />
                    <p v-else>No banner</p>
                    <p class="mt-2">
                        <button class="btn red-btn" @click="dismissBanner()">
                            Remove &nbsp;&nbsp;
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 448 512"
                                width="20"
                                height="20"
                                fill="white"
                            >
                                <path
                                    d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"
                                />
                            </svg>
                        </button>
                    </p>
                </div>
                <h5 class="mt-3">Mastery Requirements</h5>
                <textarea
                    class="form-control"
                    v-model="skillEdit.mastery_requirements"
                    id="summernote"
                    rows="3"
                ></textarea>
                <h3 class="mt-3">Comment</h3>
                <p>{{ comment }}</p>
            </div>
            <div class="col-sm">
                <h2>Original</h2>
                <h5>Icon</h5>
                <div class="">
                    <!-- Show a default skill avatar if skill not have image yet -->
                    <img
                        v-if="skill.icon_image"
                        :src="skill.icon_image"
                        class="border border-dark rounded icon-image"
                    />
                    <p v-else>No icon</p>
                </div>
                <h5 class="mt-3">Banner</h5>
                <div>
                    <!-- Show a default skill avatar if skill not have image yet -->
                    <img
                        v-if="skill.banner_image"
                        :src="skill.banner_image"
                        class="border border-dark rounded banner-image"
                    />
                    <p v-else>No banner</p>
                </div>
                <h5 class="mt-3">Mastery Requirements</h5>
                <div v-html="skill.mastery_requirements"></div>
            </div>
        </div>
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
    max-width: 50%;
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

.banner-container {
    width: 100%;
    height: fit-content;
    display: flex;
    justify-content: center;
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
