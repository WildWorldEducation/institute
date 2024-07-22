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
            templates: [
                `${this.contentType} have grammar error: `,
                `${this.contentType} have inappropriate content: `,
                `${this.contentType} skill have violent, drug abuse content: `,
                `${this.contentType} have wrong or misleading information: `,
                `${this.contentType} have content use to attack another user: `
            ]
        };
    },
    mounted() {},
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
        }
    }
};
</script>

<template>
    <!-- The flagging Modal -->
    <div v-if="showWarnModal" id="myModal" class="modal">
        <!-- Modal content -->
        <div class="modal-content">
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
                    <div>Please tell us why you flag this skill:</div>
                    <div class="reason-suggestion">
                        Reason should state why and where error happen
                    </div>
                    <div class="reason-suggestion">
                        Reason should have less than 40 words
                    </div>
                    <textarea
                        id="story"
                        name="story"
                        rows="5"
                        cols="33"
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
                    Your reason is too long !!
                </div>
                <!-- A list of pre-made template for student to use -->
                <!-- Custom Dropdown -->
                <div v-else class="d-flex flex-column">
                    <div
                        :class="[
                            showDropDown
                                ? 'custom-select-button-focus'
                                : 'custom-select-button'
                        ]"
                        @click="showDropDown = !showDropDown"
                    >
                        Or choose one of these reason below
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
                    <div v-if="showDropDown" class="custom-dropdown-base">
                        <div
                            v-for="template in templates"
                            class="custom-dropdown-option"
                            @click="
                                reason = template;
                                showDropDown = false;
                            "
                        >
                            {{ template }}
                        </div>
                    </div>
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
                        @click="flagSkill"
                    >
                        <span
                            class="d-none d-md-block"
                            @click="handleSubmitReason"
                        >
                            Submit
                        </span>
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
    width: 320px;
    font-size: 18px;
    /* Could be more or less, depending on screen size */
}

.reason-popup {
    width: 550px;
}
/* ---- End of Warning modal styling ---- */
.reason-suggestion {
    font-size: 12px;
    color: #888;
    font-family: 'Poppins', sans-serif;
}

/* ++++ Style For The Custom Select ++++ */
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

.custom-dropdown-option {
    padding: 10px 14px 10px 14px;
    gap: 8px;
    color: #344054;
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

.purple-btn:hover {
    background-color: #8f7bd6;
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
</style>
