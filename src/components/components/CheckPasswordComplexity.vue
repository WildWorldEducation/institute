<script>
export default {
    props: ['password', 'complexValidate'],
    data() {
        return {
            // password complex power
            complexPower: '',
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
            // Check password length criteria
            if (password.length < 7) {
                this.criteriaFlag.passwordLength = true;
                // turn off all other warning
            } else {
                this.criteriaFlag.passwordLength = false;
            }
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
            return powerScore;
        }
    },
    watch: {
        password: {
            handler(newPass, oldPass) {
                const passwordPowerScore = this.checkPower(newPass);
                if (newPass.length === 0) {
                    this.showCriteria = false;
                }
                if (newPass.length > 0) {
                    this.showCriteria = true;
                }
                // Determine complex power base on password score
                switch (passwordPowerScore) {
                    case 0:
                        this.complexPower = 'very week';
                    case 1:
                        this.complexPower = 'week';
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
            }
        }
    }
};
</script>

<template>
    <div class="d-flex flex-column">
        <div>Password power: {{ complexPower }}</div>
        <div v-if="showCriteria">Your Password need to have:</div>
        <!-- Only Show those line when password have at least 8 character long -->
        <div class="d-flex flex-column" v-if="showCriteria">
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
                    'd-flex flex-row'
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
                    'd-flex flex-row'
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
                    'd-flex flex-row'
                ]"
            >
                <span> At least 1 alphabetical character </span>
            </div>

            <!-- Special character criteria -->
            <div
                :class="[
                    criteriaFlag.noSpecialChar
                        ? 'not-meet-criteria'
                        : 'meet-criteria',
                    'd-flex flex-row'
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
</style>
