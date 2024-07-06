<script>
export default {
    props: ['password', 'complexValidate'],
    data() {
        return {
            // password complex power
            complexPower: '',
            powerScore: 0,
            showCriteria: false,
            // criteria flag
            criteriaFlag: {
                passwordLength: false,
                noNumber: false,
                noSpecialChar: false,
                unique: false,
                haveUpperCase: false,
                noAlphabet: false
            }
        };
    },
    mounted() {},
    destroyed() {},
    methods: {
        checkPower(password) {
            // Using the score to measure the power. This is for easy adding criteria
            let powerScore = 0;

            // Check password contain any number in it using regex
            if (/\d/.test(password)) {
                powerScore++;
                this.criteriaFlag.noNumber = false;
            } else {
                this.criteriaFlag.noNumber = true;
            }
            // Check password contain any alphabetical character
            if (/[a-z]/.test(password)) {
                powerScore++;
                this.criteriaFlag.noAlphabet = false;
            } else {
                this.criteriaFlag.noAlphabet = true;
            }
            // Check password contain any special character (~`!@#$%^&*_+|{}":';'" ect)
            if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
                powerScore++;
                this.criteriaFlag.noSpecialChar = false;
            } else {
                this.criteriaFlag.noSpecialChar = true;
            }
            // Check password have upper-case character
            if (/[A-Z]/.test(password)) {
                powerScore++;
                this.criteriaFlag.noUpperCase = false;
            } else {
                this.criteriaFlag.noUpperCase = true;
            }
            // Check password length criteria
            if (password.length < 7) {
                this.criteriaFlag.passwordLength = true;
                // If password not long enough any other metric become meaningless
                powerScore = 0;
            } else {
                this.criteriaFlag.passwordLength = false;
            }
            return powerScore;
        }
    },
    watch: {
        password: {
            handler(newPass, oldPass) {
                const passwordPowerScore = this.checkPower(newPass);
                this.powerScore = passwordPowerScore;
                if (newPass.length === 0) {
                    this.showCriteria = false;
                }
                if (newPass.length > 0) {
                    this.showCriteria = true;
                }
                // Determine complex power base on password score
                switch (passwordPowerScore) {
                    case 0:
                        this.complexPower = 'very weak';
                    case 1:
                        this.complexPower = 'weak';
                        break;
                    case 2:
                        this.complexPower = 'moderate';
                        break;
                    case 3:
                        this.complexPower = 'strong';
                        break;
                    case 4:
                        this.complexPower = 'very strong';
                        break;
                    default:
                        this.complexPower = 'very strong';
                        break;
                }

                // We only accept password with power 4 or greater
                if (passwordPowerScore >= 4) {
                    this.$parent.validate.passwordComplex = true;
                } else {
                    this.$parent.validate.passwordComplex = false;
                }
            }
        }
    }
};
</script>

<template>
    <div class="d-flex flex-column">
        <div v-if="powerScore < 3" class="form-validate">
            Your password is not good enough
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

                <span> At least 8 character long </span>
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
                <span> At least 1 special character </span>
            </div>
            <!-- Power of password indicator -->
            <div class="tile">
                Password power:
                <span
                    :style="{
                        color:
                            powerScore > 1
                                ? powerScore > 3
                                    ? 'green'
                                    : 'rgb(228, 206, 8)'
                                : 'red'
                    }"
                >
                    {{ complexPower }}
                </span>
            </div>
            <div class="row ps-2 pe-2 mt-2">
                <div class="col ps-1 pe-1">
                    <div
                        :class="[
                            powerScore > 1
                                ? powerScore > 3
                                    ? 'strong-power'
                                    : 'moderate-power'
                                : 'weak-power',
                            'power-meter'
                        ]"
                    ></div>
                </div>
                <div class="col ps-1 pe-1">
                    <div
                        v-if="powerScore > 1"
                        :class="[
                            powerScore > 1
                                ? powerScore > 3
                                    ? 'strong-power'
                                    : 'moderate-power'
                                : 'weak-power',
                            'power-meter'
                        ]"
                    ></div>
                </div>
                <div class="col ps-1 pe-1">
                    <div
                        v-if="powerScore > 2"
                        :class="[
                            powerScore > 1
                                ? powerScore > 3
                                    ? 'strong-power'
                                    : 'moderate-power'
                                : 'weak-power',
                            'power-meter'
                        ]"
                    ></div>
                </div>
                <div class="col ps-1 pe-1">
                    <div
                        v-if="powerScore > 3"
                        :class="[
                            powerScore > 1
                                ? powerScore > 3
                                    ? 'strong-power'
                                    : 'moderate-power'
                                : 'weak-power',
                            'power-meter'
                        ]"
                    ></div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
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
    background-color: rgb(228, 206, 8);
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
</style>
