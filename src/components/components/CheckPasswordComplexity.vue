<script>
export default {
    props: ['formData'],
    data() {
        return {
            // password complex power
            strength: '',
            strengthScore: 0,
            showCriteria: false,
            // criteria flag
            criteriaFlag: {
                passwordLength: false,
                noNumber: false,
                noSpecialChar: false,
                unique: false,
                haveUpperCase: false,
                noAlphabet: false,
                predictable: false
            },
            // Vue cant handle escape character so we have to declare the hover tile here
            hoverTile: "special characters: (~!@#$%^&*_-+=`|(){}[]:;\"''<>,.?/)"
        };
    },
    mounted() {
        // To make the password criteria text disappear when not required.
        var body = document.getElementsByTagName('body')[0];
        var except = document.getElementById('password-input');
        body.addEventListener(
            'click',
            () => {
                if (this.$parent.validate.passwordComplex) {
                    this.showCriteria = false;
                }
            },
            false
        );
        // In case the id has not been added to the password input.
        if (except != null) {
            except.addEventListener(
                'click',
                function (ev) {
                    ev.stopPropagation();
                },
                false
            );
        }
    },
    destroyed() {},
    methods: {
        checkStrength(password) {
            // Using the score to measure the power. This is for easy adding criteria
            let strengthScore = 0;

            // Check password contain any number in it using regex
            if (/\d/.test(password)) {
                strengthScore++;
                this.criteriaFlag.noNumber = false;
            } else {
                this.criteriaFlag.noNumber = true;
            }
            // Check password contain any alphabetical character
            if (/[a-z]/.test(password)) {
                strengthScore++;
                this.criteriaFlag.noAlphabet = false;
            } else {
                this.criteriaFlag.noAlphabet = true;
            }
            // Check password contain any special character (~`!@#$%^&*_+|{}":';'" ect)
            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                strengthScore++;
                this.criteriaFlag.noSpecialChar = false;
            } else {
                this.criteriaFlag.noSpecialChar = true;
            }
            // Check password have upper-case character
            if (/[A-Z]/.test(password)) {
                strengthScore++;
                this.criteriaFlag.noUpperCase = false;
            } else {
                this.criteriaFlag.noUpperCase = true;
            }
            // Check password length criteria
            if (password.length < 7) {
                this.criteriaFlag.passwordLength = true;
                // If password not long enough any other metric become meaningless
                strengthScore = 0;
            } else {
                this.criteriaFlag.passwordLength = false;
            }

            // Series Check if user re-use they name or user name for password
            if (
                (this.formData.firstName &&
                    password
                        .toLowerCase()
                        .includes(this.formData.firstName.toLowerCase())) ||
                (this.formData.lastName &&
                    password
                        .toLowerCase()
                        .includes(this.formData.lastName.toLowerCase())) ||
                (this.formData.username &&
                    password
                        .toLowerCase()
                        .includes(this.formData.username.toLowerCase())) ||
                (this.formData.email &&
                    password
                        .toLowerCase()
                        .includes(this.formData.email.toLowerCase()))
            ) {
                this.criteriaFlag.predictable = true;
                // if the password is predictable it strength return to 0
                strengthScore = 0;
            } else {
                this.criteriaFlag.predictable = false;
            }

            return strengthScore;
        }
    },
    // This is necessary to get a different oldVal and newVal in the watcher.
    computed: {
        computedObjectToBeWatched() {
            return Object.assign({}, this.formData);
        }
    },
    watch: {
        computedObjectToBeWatched: {
            deep: true,
            handler(newVal, oldVal) {
                // Check if password exists and is not empty/whitespace
                if (newVal.password && newVal.password.trim() !== '') {
                    if (
                        newVal.password.length > 0 &&
                        newVal.password !== oldVal.password
                    ) {
                        this.showCriteria = true;
                        const passwordStrengthScore = this.checkStrength(
                            newVal.password
                        );
                        this.strengthScore = passwordStrengthScore;

                        switch (passwordStrengthScore) {
                            case 0:
                                this.strength = 'very weak';
                                break;
                            case 1:
                                this.strength = 'weak';
                                break;
                            case 2:
                                this.strength = 'moderate';
                                break;
                            case 3:
                                this.strength = 'strong';
                                break;
                            case 4:
                                this.strength = 'very strong';
                                break;
                            default:
                                this.strength = 'very strong';
                                break;
                        }

                        this.$parent.validate.passwordComplex =
                            passwordStrengthScore >= 4;

                        // Predictability check
                        const isPredictable =
                            (newVal.username &&
                                newVal.password
                                    .toLowerCase()
                                    .includes(newVal.username.toLowerCase())) ||
                            (newVal.email &&
                                newVal.password
                                    .toLowerCase()
                                    .includes(newVal.email.toLowerCase())) ||
                            (newVal.firstName &&
                                newVal.password
                                    .toLowerCase()
                                    .includes(
                                        newVal.firstName.toLowerCase()
                                    )) ||
                            (newVal.lastName &&
                                newVal.password
                                    .toLowerCase()
                                    .includes(newVal.lastName.toLowerCase()));

                        if (isPredictable) {
                            this.criteriaFlag.predictable = true;
                            this.strengthScore = 0;
                            this.strength = 'weak';
                            this.$parent.validate.passwordComplex = false;
                        } else {
                            this.criteriaFlag.predictable = false;
                        }

                        // Hide the hint if all criteria are met
                        const allCriteriaMet = Object.values(
                            this.criteriaFlag
                        ).every((flag) => !flag);
                        if (allCriteriaMet) {
                            this.showCriteria = false;
                        }
                    }
                } else {
                    // Password is empty or only whitespace - hide criteria and reset validation
                    this.showCriteria = false;
                    this.strengthScore = 0;
                    this.strength = '';
                    this.$parent.validate.passwordComplex = false;

                    // Reset all criteria flags
                    this.criteriaFlag = {
                        passwordLength: false,
                        noNumber: false,
                        noSpecialChar: false,
                        unique: false,
                        haveUpperCase: false,
                        noAlphabet: false,
                        predictable: false
                    };
                }
            }
        }
    }
};
</script>

<template>
    <div class="d-flex flex-column">
        <div v-if="strengthScore < 3 && showCriteria" class="form-validate">
            Your password is not strong enough
        </div>
        <div class="form-validate" v-if="criteriaFlag.predictable">
            Your password mustn&lsquo;t contain your name, user-name or email.
            Please do not use predictable password
        </div>

        <!-- Only Show those line when password have at least 8 character long -->
        <div class="d-flex flex-column ms-2 mt-2" v-if="showCriteria">
            <div
                :class="[
                    criteriaFlag.passwordLength
                        ? 'not-meet-criteria'
                        : 'meet-criteria',
                    'd-flex flex-row align-items-center'
                ]"
            >
                <Transition name="fade">
                    <!-- Check Icon -->
                    <svg
                        v-if="!criteriaFlag.passwordLength"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="15"
                        height="15"
                        fill="green"
                        class="me-1"
                    >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"
                        />
                    </svg>

                    <!-- X circle Icon -->
                    <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="15"
                        height="15"
                        fill="red"
                        class="me-1"
                    >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"
                        />
                    </svg>
                </Transition>

                <span> At least 8 characters long </span>
            </div>
            <!-- Uppercase criteria -->
            <div
                :class="[
                    criteriaFlag.noUpperCase
                        ? 'not-meet-criteria'
                        : 'meet-criteria',
                    'd-flex flex-row align-items-center'
                ]"
            >
                <Transition name="fade">
                    <!-- Check Icon -->
                    <svg
                        v-if="!criteriaFlag.noUpperCase"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="15"
                        height="15"
                        fill="green"
                        class="me-1"
                    >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"
                        />
                    </svg>

                    <!-- X circle Icon -->
                    <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="15"
                        height="15"
                        fill="red"
                        class="me-1"
                    >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"
                        />
                    </svg>
                </Transition>
                <span> At least 1 uppercase character </span>
            </div>

            <!-- Number criteria -->
            <div
                :class="[
                    criteriaFlag.noNumber
                        ? 'not-meet-criteria'
                        : 'meet-criteria',
                    'd-flex flex-row align-items-center'
                ]"
            >
                <Transition name="fade">
                    <!-- Check Icon -->
                    <svg
                        v-if="!criteriaFlag.noNumber"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="15"
                        height="15"
                        fill="green"
                        class="me-1"
                    >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"
                        />
                    </svg>

                    <!-- X circle Icon -->
                    <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="15"
                        height="15"
                        fill="red"
                        class="me-1"
                    >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"
                        />
                    </svg>
                </Transition>
                <span> At least 1 number </span>
            </div>

            <!-- Alphabetical character criteria -->
            <div
                :class="[
                    criteriaFlag.noAlphabet
                        ? 'not-meet-criteria'
                        : 'meet-criteria',
                    'd-flex flex-row align-items-center'
                ]"
            >
                <Transition name="fade">
                    <!-- Check Icon -->
                    <svg
                        v-if="!criteriaFlag.noAlphabet"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="15"
                        height="15"
                        fill="green"
                        class="me-1"
                    >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"
                        />
                    </svg>
                    <!-- X circle Icon -->
                    <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="15"
                        height="15"
                        fill="red"
                        class="me-1"
                    >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"
                        />
                    </svg>
                </Transition>
                <span> At least 1 alphabetical character </span>
            </div>

            <!-- Special character criteria -->
            <div
                :class="[
                    criteriaFlag.noSpecialChar
                        ? 'not-meet-criteria'
                        : 'meet-criteria',
                    'd-flex flex-row align-items-center'
                ]"
            >
                <!-- Check Icon -->

                <Transition name="fade">
                    <svg
                        v-if="!criteriaFlag.noSpecialChar"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="15"
                        height="15"
                        fill="green"
                        class="me-1"
                    >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z"
                        />
                    </svg>
                    <svg
                        v-else
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 512 512"
                        width="15"
                        height="15"
                        fill="red"
                        class="me-1"
                    >
                        <path
                            d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM175 175c-9.4 9.4-9.4 24.6 0 33.9l47 47-47 47c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l47-47 47 47c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-47-47 47-47c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-47 47-47-47c-9.4-9.4-24.6-9.4-33.9 0z"
                        />
                    </svg>
                </Transition>
                <span
                    class="special-character-hover"
                    b-tooltip.hover
                    :title="hoverTile"
                >
                    At least 1 special character (*)
                </span>
                <!-- X circle Icon -->
            </div>
            <!-- Power of password indicator -->
            <div class="tile">
                Password strength:
                <span
                    :style="{
                        color:
                            strengthScore > 1
                                ? strengthScore > 2
                                    ? 'green'
                                    : 'rgb(228, 206, 10)'
                                : 'red'
                    }"
                >
                    {{ strength }}
                </span>
            </div>
            <div class="row ps-2 pe-2 mt-2">
                <div class="col ps-1 pe-1">
                    <div
                        :class="[
                            strengthScore > 1
                                ? strengthScore > 2
                                    ? 'strong-power'
                                    : 'moderate-power'
                                : 'weak-power',
                            'power-meter'
                        ]"
                    ></div>
                </div>
                <div class="col ps-1 pe-1">
                    <Transition name="strength-bar">
                        <div
                            v-if="strengthScore > 1"
                            :class="[
                                strengthScore > 1
                                    ? strengthScore > 2
                                        ? 'strong-power'
                                        : 'moderate-power'
                                    : 'weak-power',
                                'power-meter'
                            ]"
                        ></div>
                    </Transition>
                </div>
                <div class="col ps-1 pe-1">
                    <Transition name="strength-bar">
                        <div
                            v-if="strengthScore > 2"
                            :class="[
                                strengthScore > 1
                                    ? strengthScore > 2
                                        ? 'strong-power'
                                        : 'moderate-power'
                                    : 'weak-power',
                                'power-meter'
                            ]"
                        ></div>
                    </Transition>
                </div>
                <div class="col ps-1 pe-1">
                    <Transition name="strength-bar">
                        <div
                            v-if="strengthScore > 3"
                            :class="[
                                strengthScore > 1
                                    ? strengthScore > 2
                                        ? 'strong-power'
                                        : 'moderate-power'
                                    : 'weak-power',
                                'power-meter'
                            ]"
                        ></div>
                    </Transition>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
.form-validate {
    font-size: 0.75rem;
    color: red;
    font-weight: 300;
}
.meet-criteria {
    color: rgb(32, 114, 25);
    font-size: 14px;
    font-weight: 500;
    font-family: 'Poppins';
}

.not-meet-criteria {
    color: rgb(218, 37, 37);
    font-size: 14px;
    font-weight: 500;
    font-family: 'Poppins';
}

.power-meter {
    height: 5px;
    width: 100%;
}

.weak-power {
    background-color: red;
}

.moderate-power {
    background-color: rgb(228, 206, 10);
}

.strong-power {
    background-color: green;
}

.tile {
    margin-top: 10px;
    font-size: 13px;
    color: rgb(173, 173, 170);
    font-family: 'Poppins', sans-serif;
    font-weight: 400;
}

.special-character-hover:hover {
    cursor: help;
}

/* Fade animation */
@keyframes fade {
    0% {
        opacity: 0;
        transform: scale(0);
    }
    100% {
        opacity: 1;
        transform: scale(1);
    }
}

.fade-enter-active {
    animation: fade 1s;
}

/* Strength Bar Animation */
@keyframes slide {
    0% {
        opacity: 0;
        transform: scaleX(0);
    }

    100% {
        opacity: 1;
        transform: scaleX(1);
    }
}
.strength-bar-enter-active {
    transform-origin: center left;
    animation: slide 1s;
}
.strength-bar-leave-active {
    transform-origin: center left;
    animation: slide 1s reverse;
}
</style>
