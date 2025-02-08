<script>
// Import

export default {
    props: ['contentType', 'contentId', 'userId'],
    data() {
        return {
            showWarnModal: true,
            showReasonPopup: false,
            showThankModal: false,
            reason: '',
            shake: false,
            showDropDown: false,
            // list of pre-made template
            genericTemplates: [
                {
                    title: 'Grammar or Spelling Error',
                    explanation:
                        'The content contains grammatical mistakes or spelling errors that affect readability and clarity.'
                },
                {
                    title: 'Inappropriate Content',
                    explanation:
                        'The content includes offensive, explicit, or otherwise inappropriate language, images, or themes.'
                },
                {
                    title: 'Incorrect or Misleading',
                    explanation:
                        'The content contains false or misleading information that may confuse or misinform users.'
                },
                {
                    title: 'Content Used to Attack Another User',
                    explanation:
                        'The content is intentionally hostile, aggressive, or used to harass or insult another user.'
                },
                {
                    title: 'Spam, Adverts, or Low-Quality Content',
                    explanation:
                        'The content is irrelevant, promotional, or does not contribute to meaningful discussion or learning.'
                }
            ],
            mcQuestionTemplate: [
                {
                    title: 'Too Difficult or Too Easy',
                    explanation:
                        'The question is disproportionately difficult or too simplistic for the exam level.'
                },
                {
                    title: 'Incorrect Answer Key',
                    explanation:
                        'The marked correct answer is actually incorrect.'
                },
                {
                    title: 'Ambiguous Question',
                    explanation:
                        'The wording is unclear, leading to multiple possible correct answers.'
                },
                {
                    title: 'Duplicate Answers',
                    explanation:
                        'More than one option is identical or essentially the same.'
                },
                {
                    title: 'Missing Correct Answer',
                    explanation:
                        'None of the given choices are actually correct.'
                },
                {
                    title: 'Incorrect Answer Randomization',
                    explanation:
                        'The correct answer always appears in the same position due to faulty randomization.'
                },
                {
                    title: 'Culturally Insensitive Content',
                    explanation:
                        'The question contains offensive or inappropriate language.'
                },
                {
                    title: 'Off-Topic Question',
                    explanation:
                        "The question does not align with the exam's syllabus or intended learning objectives."
                }
            ],
            essayQuestionTemplate: [
                {
                    title: 'Too Broad or Too Narrow',
                    explanation:
                        'The question is either too general to allow focused responses or too specific to allow critical thinking.'
                },
                {
                    title: 'Incorrect or Misleading Information',
                    explanation:
                        'The question contains factual errors or misleading details.'
                },
                {
                    title: 'Off-Topic Question',
                    explanation:
                        'The question does not align with the syllabus or intended learning objectives.'
                },
                {
                    title: 'Culturally Insensitive Content',
                    explanation:
                        'The question includes offensive or inappropriate language.'
                },
                {
                    title: 'Sensitive or Controversial Topics',
                    explanation:
                        'The question addresses a highly sensitive issue that may make students uncomfortable or is not appropriate for the exam setting.'
                },
                {
                    title: 'Requires External Knowledge Beyond Course Scope',
                    explanation:
                        'The question assumes knowledge that was not covered in the course materials.'
                }
            ],
            imageQuestionTemplate: [
                {
                    title: 'Too Broad or Too Narrow',
                    explanation:
                        'The question is either too general to allow focused responses or too specific to allow critical thinking.'
                },
                {
                    title: 'Incorrect or Misleading Information',
                    explanation:
                        'The question contains factual errors or misleading details.'
                },
                {
                    title: 'Off-Topic Question',
                    explanation:
                        'The question does not align with the syllabus or intended learning objectives.'
                },
                {
                    title: 'Image Upload Issues',
                    explanation:
                        'Students may experience technical difficulties uploading their images due to system limitations.'
                },
                {
                    title: 'Incompatible Devices',
                    explanation:
                        'Some students may not have access to devices (such as a camera or scanner) required to generate or upload an image.'
                },
                {
                    title: 'Culturally Insensitive Content',
                    explanation:
                        'The question includes offensive or inappropriate language.'
                },
                {
                    title: 'Sensitive or Controversial Topics',
                    explanation:
                        'The question addresses a highly sensitive issue that may make students uncomfortable or is not appropriate for the exam setting.'
                },
                {
                    title: 'Requires External Knowledge Beyond Course Scope',
                    explanation:
                        'The question assumes knowledge that was not covered in the course materials.'
                }
            ],
            resourceTemplate: [
                {
                    title: 'Inaccurate or Misleading Information',
                    explanation:
                        'The resource contains factual errors or promotes incorrect knowledge.'
                },
                {
                    title: 'Off-Topic Resource',
                    explanation:
                        "The resource does not align with the forum's subject or course objectives."
                },
                {
                    title: 'Duplicate Post',
                    explanation:
                        'The same resource has already been shared in the forum.'
                },
                {
                    title: 'Culturally Insensitive or Offensive Content',
                    explanation:
                        'The resource contains language, images, or viewpoints that may be inappropriate or disrespectful.'
                },
                {
                    title: 'Overly Promotional or Spammy Content',
                    explanation:
                        'The resource is primarily promoting a product or service rather than contributing to learning.'
                },
                {
                    title: 'Broken Link or Missing File',
                    explanation:
                        'The resource link is invalid, expired, or leads to a non-existent page.'
                },
                {
                    title: 'Unverified or Unreliable Source',
                    explanation:
                        'The resource comes from a questionable or biased source that lacks credibility.'
                },
                {
                    title: 'Requires Paid Access',
                    explanation:
                        'The resource is behind a paywall, making it inaccessible to some learners.'
                },
                {
                    title: 'Poorly Explained or Low-Quality Resource',
                    explanation:
                        'The post does not provide enough context or explanation for how the resource is useful.'
                },
                {
                    title: 'Too Advanced or Too Basic',
                    explanation:
                        'The resource is either too complex or too simple for the intended audience.'
                }
            ],
            skillTemplate: [
                {
                    title: 'Inaccurate or Misleading Advice',
                    explanation:
                        'The post provides incorrect or misleading guidance on developing academic skills, which could negatively impact learners.'
                },
                {
                    title: 'Plagiarism or Copyright Violation',
                    explanation:
                        'The content includes copied material from other sources without proper attribution, violating academic integrity standards.'
                },
                {
                    title: 'Off-Topic Discussion',
                    explanation:
                        'The post does not relate to academic skills, study strategies, or relevant learning techniques.'
                },
                {
                    title: 'Culturally Insensitive or Inappropriate Content',
                    explanation:
                        'The post contains language, examples, or advice that may be offensive or disrespectful to certain groups.'
                },
                {
                    title: 'Unverified or Unreliable Study Techniques',
                    explanation:
                        'The suggested study methods or academic strategies lack scientific backing or professional endorsement.'
                },
                {
                    title: 'Overly Promotional or Self-Advertising',
                    explanation:
                        'The post is primarily aimed at promoting a personal service, course, or product rather than providing genuine academic guidance.'
                },
                {
                    title: 'Encourages Academic Dishonesty',
                    explanation:
                        'The content promotes cheating, plagiarism, or unethical shortcuts in learning and assessments.'
                },
                {
                    title: 'Duplicate or Repetitive Content',
                    explanation:
                        'The same topic or advice has already been posted multiple times in the forum.'
                },
                {
                    title: 'Poorly Explained or Confusing Guidance',
                    explanation:
                        'The advice lacks clarity, structure, or sufficient details to be useful to learners.'
                }
            ],
            tutorPostTemplate: [
                {
                    title: 'Lack of Qualifications',
                    explanation:
                        'The proposed instructor does not have relevant credentials or expertise in the subject.'
                },
                {
                    title: 'Inaccurate or Misleading Information',
                    explanation:
                        'The proposal includes false claims about the instructor’s background, experience, or teaching methods.'
                },
                {
                    title: 'Vague or Incomplete Details',
                    explanation:
                        'The proposal does not provide enough information about the instructor’s experience, teaching style, or course structure.'
                },
                {
                    title: 'Unverified Claims',
                    explanation:
                        "The instructor's achievements or experience cannot be confirmed through reliable sources."
                },
                {
                    title: 'Duplicate Submission',
                    explanation:
                        'The same instructor has already been proposed multiple times.'
                },
                {
                    title: 'Poor Reviews or Reputation',
                    explanation:
                        'The instructor has a history of negative feedback from students or institutions.'
                }
            ],
            template: []
        };
    },
    created() {
        this.toTileCase(this.contentType);
        console.log('content type: ');
        console.log(this.contentType);
        // Add specific reason for each content type
        switch (this.contentType) {
            case 'mc_question':
                this.template = this.mcQuestionTemplate;
                break;
            case 'mc_question':
                this.template = this.mcQuestionTemplate;
                break;
            case `essay_question`:
                this.template = this.essayQuestionTemplate;
                break;
            case `image`:
                this.template = this.imageQuestionTemplate;
                break;
            case `skill`:
                this.template = this.skillTemplate;
            case `resource`:
                this.template = this.resourceTemplate;
            default:
                break;
        }

        // Add generic template
        this.template = this.template.concat(this.genericTemplates);
    },
    computed: {},
    methods: {
        closeModal() {
            this.$parent.showFlaggingModal = false;
            this.showReasonPopup = false;
            this.showThankModal = false;
            this.showWarnModal = false;
        },
        handleSubmitReason() {
            if (this.reason.length > 255) {
                this.shake = true;
                setTimeout(() => {
                    this.shake = false;
                }, 200);
            } else {
                this.flagSkill();
            }
        },
        flagSkill() {
            const requestOptions = {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content_type: this.contentType,
                    content_id: this.contentId,
                    user_id: this.userId,
                    reason: this.reason
                })
            };

            var url = '/content-flags/add';
            fetch(url, requestOptions).then((err) => {
                this.showReasonPopup = false;
                this.showThankModal = true;
            });
        },
        toTileCase(string) {
            const result = string.replace(/_/g, ' ');
            return result;
        },
        handleTemplateChoose(template) {
            this.reason = template.title + ' - ' + template.explanation;
            console.log('reason is: ');
            console.log(this.reason);
            this.showDropDown = false;
        }
    }
};
</script>

<template>
    <!-- The flagging Modal -->
    <div v-if="showWarnModal" id="myModal" class="modal">
        <!-- Modal content -->
        <div class="modal-content asking-modal">
            <div class="d-flex gap-4">
                <!-- Warn Triangle Icon -->
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    fill="grey"
                    width="45"
                    height="45"
                >
                    <path
                        d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
                    />
                </svg>
                <p>
                    Would you like to flag this as unhelpful or incorrect for
                    admin review?
                </p>
            </div>
            <!-- Buttons row -->
            <div
                class="d-flex justify-content-lg-between justify-content-md-end justify-content-between gap-2"
            >
                <button
                    type="button"
                    class="btn red-btn modal-btn"
                    @click="closeModal"
                >
                    <span class="d-none d-md-block"> No </span>
                    <!-- Tick Icon ONLY show when in Phone View -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="18"
                        height="18"
                        fill="white"
                        class="d-md-none"
                    >
                        <path
                            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
                        />
                    </svg>
                </button>
                <button
                    type="button"
                    class="btn green-btn modal-btn"
                    @click="
                        showReasonPopup = true;
                        showWarnModal = false;
                    "
                >
                    <span class="d-none d-md-block"> Yes </span>
                    <!-- X icon Only show when in Phone View -->
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="18"
                        height="18"
                        fill="white"
                        class="d-md-none"
                    >
                        <path
                            d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
                        />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- An Popup for user to type reason for flagging -->
    <div v-if="showReasonPopup">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content reason-popup">
                <div class="d-flex flex-column">
                    <div>
                        Please tell us why you want to flag this
                        {{ toTileCase(contentType) }}:
                    </div>
                    <div class="reason-suggestion">
                        including where the issue happens,
                    </div>
                    <div class="reason-suggestion">in less than 40 words</div>
                    <textarea
                        id="reason"
                        name="reason"
                        rows="5"
                        cols="33"
                        autofocus
                        v-model="reason"
                    >
                    </textarea>
                    <!-- Suggest template -->
                </div>
                <!-- Reason validate message -->
                <div
                    v-if="reason.length > 255"
                    :class="[
                        shake
                            ? 'click-shake form-validate'
                            : 'form-validate initial-shake'
                    ]"
                >
                    Your reason has too many words !!
                </div>
                <!-- A list of pre-made template for student to use -->
                <!-- Custom Dropdown -->

                <div v-else class="d-flex flex-column custom-select-div">
                    <div
                        :class="[
                            showDropDown
                                ? 'custom-select-button-focus'
                                : 'custom-select-button'
                        ]"
                        @click="showDropDown = !showDropDown"
                    >
                        Or choose a reason below
                        <span>
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M14.2929 8.70711C14.9229 8.07714 14.4767 7 13.5858 7H6.41421C5.52331 7 5.07714 8.07714 5.70711 8.70711L9.29289 12.2929C9.68342 12.6834 10.3166 12.6834 10.7071 12.2929L14.2929 8.70711Z"
                                    fill="#344054"
                                />
                            </svg>
                        </span>
                    </div>
                    <Transition name="dropdown">
                        <div v-if="showDropDown" class="custom-dropdown-base">
                            <div
                                b-tooltip.hover
                                :tile="template.explanation"
                                v-for="template in template"
                                class="custom-dropdown-option"
                                @click="handleTemplateChoose(template)"
                            >
                                {{ template.title }}
                            </div>
                        </div>
                    </Transition>
                </div>
                <!-- End of custom dropdown -->
                <!-- Buttons row -->
                <div
                    class="d-flex justify-content-lg-between justify-content-md-end justify-content-between gap-2 mt-2"
                >
                    <button
                        type="button"
                        class="btn red-btn modal-btn"
                        @click="closeModal"
                    >
                        <span class="d-none d-md-block"> Cancel </span>
                        <!-- X Icon ONLY show when in Phone View -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="18"
                            height="18"
                            fill="white"
                            class="d-md-none"
                        >
                            <path
                                d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c9.4-9.4 24.6-9.4 33.9 0l47 47 47-47c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9l-47 47 47 47c9.4 9.4 9.4 24.6 0 33.9s-24.6 9.4-33.9 0l-47-47-47 47c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l47-47-47-47c-9.4-9.4-9.4-24.6 0-33.9z"
                            />
                        </svg>
                    </button>
                    <button
                        type="button"
                        class="btn green-btn modal-btn"
                        @click="handleSubmitReason"
                    >
                        <span class="d-none d-md-block"> Submit </span>
                        <!-- Tick icon Only show when in Phone View -->
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                            width="18"
                            height="18"
                            fill="white"
                            class="d-md-none"
                        >
                            <path
                                d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209L241 337c-9.4 9.4-24.6 9.4-33.9 0l-64-64c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l47 47L335 175c9.4-9.4 24.6-9.4 33.9 0s9.4 24.6 0 33.9z"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <!-- Thanks You Modal After User Flagging -->
    <div v-if="showThankModal">
        <div id="myModal" class="modal">
            <!-- Modal content -->
            <div class="modal-content">
                <div class="d-flex gap-4 text-center">
                    <p>
                        Thank you for flagging this skill. We will take a look
                        as soon as possible !!
                    </p>
                </div>
                <div class="d-flex justify-content-center">
                    <button
                        type="button"
                        class="btn green-btn w-25"
                        @click="closeModal"
                    >
                        <span> OK </span>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
/* The Warning Modal */
.modal {
    display: block;
    /* Hidden by default */
    position: fixed;
    /* Stay in place */
    z-index: 1;
    /* Sit on top */
    left: 0;
    top: 0;
    width: 100%;
    /* Full width */
    height: 100%;
    /* Full height */
    overflow: auto;
    /* Enable scroll if needed */
    background-color: rgb(0, 0, 0);
    /* Fallback color */
    background-color: rgba(0, 0, 0, 0.4);
    /* Black w/ opacity */
}

#add-resource-column {
    padding-right: 0px !important;
    margin-right: 0px !important;
}

/* Modal Content/Box */
.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    /* 15% from the top and centered */
    padding: 20px;
    border: 1px solid #888;
    width: 520px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}

.reason-popup {
    width: 550px !important;
}

.asking-modal {
    width: 340px !important;
}
/* ---- End of Warning modal styling ---- */
.reason-suggestion {
    font-size: 12px;
    color: #888;
    font-family: 'Poppins', sans-serif;
}

/* Style for text area  */
#reason {
    outline: none;
    border-radius: 8px;
    border: #888 1px solid;
    padding: 10px;
    font-family: 'Poppins' sans-serif;
    font-size: 15px;
    color: #394353;
}

#reason:focus {
    outline: none;
}

/* ++++ Style For The Custom Select ++++ */
.custom-select-div {
    margin-top: 10px;
    margin-bottom: 10px;
    width: 75%;
}

.custom-select-button {
    width: 100%;
    height: auto;
    padding: 6px 14px 6px 14px;
    border-radius: 8px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    border: 1px solid #f2f4f7;
    box-shadow: 0px 1px 2px 0px #1018280d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    display: flex;
}

.custom-select-button-focus {
    width: 100%;
    height: auto;
    padding: 6px 14px 6px 14px;
    border-radius: 8px;
    gap: 8px;
    background: linear-gradient(0deg, #ffffff, #ffffff),
        linear-gradient(0deg, #f2f4f7, #f2f4f7);
    border: 1px solid #9c7eec;
    box-shadow: 0px 0px 0px 4px #bca3ff4d;
    font-family: 'Poppins' sans-serif;
    font-size: 1rem;
    font-weight: 400;
    line-height: 22px;
    letter-spacing: 0.03em;
    text-align: left;
    display: flex;
}

.custom-select-button:hover {
    cursor: pointer;
    border: 1px solid #9c7eec;
}

.custom-select-button > span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotationBack 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.custom-select-button-focus > span {
    margin-right: 2px;
    margin-left: auto;
    animation: rotation 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}

/* The animation key frame */
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

.custom-select-button-focus:hover {
    cursor: pointer;
}

.custom-dropdown-base {
    border-radius: 8px;
    border: 1px;
    background: linear-gradient(0deg, #ffffff, #ffffff);
    border: 1px solid #9c7eec;
    box-shadow: 0px 4px 6px -2px #10182808;
    box-shadow: 0px 12px 16px -4px #10182814;
}

/* Slide animation */
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
    animation: slide 0.6s;
}
.dropdown-leave-active {
    transform-origin: top center;
    animation: slide 0.6s reverse;
}

.custom-dropdown-option {
    padding: 10px 14px 10px 14px;
    gap: 8px;
    color: #344054;
    font-size: 15px;
    font-family: 'Poppins' sans-serif;
}

.custom-dropdown-option:hover {
    cursor: pointer;
    background: #bca3ff1a;
}

/* ---- End of CSS style for Custom Select ---- */

/* ++++ Shake animation for waring line ++++ */
.click-shake {
    animation: shake2 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

.initial-shake {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
}

@keyframes shake2 {
    10%,
    90% {
        transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
        transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
        transform: translate3d(4px, 0, 0);
    }
}

@keyframes shake {
    10%,
    90% {
        transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
        transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
        transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
        transform: translate3d(4px, 0, 0);
    }
}

/* ---- End of shake animation ---- */

.green-btn {
    background-color: #36c1af;
    color: white;
    border: 1px solid #2ca695;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    font-size: 1rem;
    display: flex;
    align-items: center;
    height: auto;
    align-items: center;
    justify-content: center;
}

.green-btn:hover {
    background-color: #3eb3a3;
    color: white;
}

.green-btn:focus {
    background-color: #2ca695;
    color: white;
}

/* ---|| Style Specific on Phone ||--- */
@media (min-width: 0px) and (max-width: 576px) {
    .modal-content {
        margin: 45% 0%;
        width: 100% !important;
    }

    .custom-select-div {
        width: 100%;
    }
}
</style>
