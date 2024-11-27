<script>
import { useUserDetailsStore } from '../../../stores/UserDetailsStore';

export default {
    setup() {
        const userDetailsStore = useUserDetailsStore();
        return {
            userDetailsStore
        };
    },
    data() {
        return {};
    },

    methods: {
        toggleTheme() {
            if (this.userDetailsStore.theme == 'apprentice') {
                this.userDetailsStore.updateTheme('scholar');
            } else {
                this.userDetailsStore.updateTheme('apprentice');
            }
        }
    }
};
</script>

<template>
    <div class="container pb-4">
        <h2 id="heading" class="my-3 ms-0 ms-md-3 ms-lg-0 mt-2 mt-md-4">
            Theme
        </h2>
        <!-- Choose theme -->
        <div
            :class="`toggle ${
                userDetailsStore.theme == 'apprentice' ? 'left' : 'right'
            }`"
            @click="toggleTheme"
        >
            <div class="cursor"></div>
            <div class="labels">
                <div class="label-left">Apprentice</div>
                <div class="label-right">Scholar</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
#heading {
    font-family: 'Poppins' sans-serif;
    font-weight: 900;
    line-height: 28px;
    letter-spacing: 0em;
    text-align: left;
}

/* Theme toggle */
.toggle {
    border: #7f56d9 solid 1px;
    width: 100%;
    height: 40px;
    border-radius: 10px;
    margin-bottom: 16px;
    position: relative;
    cursor: pointer;
    overflow: hidden;
    background-color: white;
}
.toggle .cursor {
    height: 100%;
    width: 50%;
    background-color: #7f56d9;
    position: absolute;
    top: 0px;
    transition: all ease 300ms;
}
.toggle.left .cursor {
    left: 0px;
}
.toggle.right .cursor {
    left: 50%;
}
.toggle .labels {
    display: flex;
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0px;
    top: 0px;
}

.label-left,
.label-right {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 50%;
    color: #000000;
}
.toggle.left .label-left {
    color: #ffffff;
}
.toggle.right .label-right {
    color: #ffffff;
}
</style>
