<script>
export default {
    setup() {},
    props: [
        'tutorType',
        'skill',
        'skillLevel',
        'learningObjectives',
        'isAITokenLimitReached'
    ],
    data() {
        return {
            constraints: { audio: true },
            chunks: [],
            micAllowed: false,
            mediaRecorder: {},
            recording: false,
            // loading animation
            isLoading: false
        };
    },
    methods: {
        //User must allow mic in browser
        allowMic() {
            if (navigator.mediaDevices) {
                navigator.mediaDevices
                    .getUserMedia(this.constraints)
                    .then((stream) => {
                        this.mediaRecorder = new MediaRecorder(stream);
                        this.micAllowed = true;
                    });
            }
        },
        recordSpeech() {
            // Start recording
            if (this.recording == false) {
                this.mediaRecorder.start();
                this.recording = true;
            }
            // Stop recording and send
            else {
                this.mediaRecorder.stop();
                this.recording = false;
                this.isLoading = true;

                this.mediaRecorder.ondataavailable = (e) => {
                    this.chunks.push(e.data);
                    // Create blob
                    const blob = new Blob(this.chunks, {
                        type: 'audio/webm; codecs=opus'
                    });
                    this.chunks = [];

                    // Convert to Base64
                    var reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        var base64data = reader.result;
                        // Send base 64 data to server
                        this.sendAudioDataToServer(base64data);
                    };
                };
            }
        },
        async sendAudioDataToServer(base64data) {
            try {
                const requestOptions = {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        skillUrl: this.skill.url,
                        skillName: this.skill.name,
                        skillLevel: this.englishSkillLevel,
                        learningObjectives: this.learningObjectives,
                        audioData: base64data,
                        tutorType: this.tutorType
                    })
                };

                let url = '/ai-tutor/stt/convert';
                let res = await fetch(url, requestOptions);

                // Loading animation
                this.isLoading = false;

                this.$parent.getChatHistory();
                if (res.status === 500) {
                    alert('The tutor can`t answer !!');
                    this.waitForAIresponse = false;
                    return;
                }
            } catch (error) {
                console.error(error);
            }
        }
    }
};
</script>

<template>
    <span class="d-flex justify-content-end">
        <!-- <audio controls id="audio">
            Your browser does not support the audio tag.
        </audio> -->
        <span>
            <button v-if="!micAllowed" class="btn" @click="allowMic()">
                allow microphone
            </button>
            <button
                v-else
                class="btn"
                :class="{
                    recording: recording == true,
                    'loader-background': isLoading == true
                }"
                @click="recordSpeech()"
                :disabled="isAITokenLimitReached"
            >
                <span v-if="!recording && !isLoading">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                        width="18"
                        height="18"
                        fill="black"
                    >
                        <!-- !Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc. -->
                        <path
                            d="M192 0C139 0 96 43 96 96l0 160c0 53 43 96 96 96s96-43 96-96l0-160c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 89.1 66.2 162.7 152 174.4l0 33.6-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l72 0 72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-33.6c85.8-11.7 152-85.3 152-174.4l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 70.7-57.3 128-128 128s-128-57.3-128-128l0-40z"
                        />
                    </svg>
                </span>
                <span v-else-if="recording">send</span>
                <!-- Loading animation -->
                <div class="d-flex" v-else-if="isLoading">
                    <span class="speech-loader"></span>
                </div>
            </button>
        </span>
    </span>
</template>

<style scoped>
.recording {
    background-color: red;
}

/* Loading animation for generating speech audio*/
.loader-background {
    background-color: #031e27;
}
.speech-loader {
    width: 24px;
    height: 24px;
    border: 5px solid yellow;
    border-bottom-color: transparent;
    border-radius: 50%;
    display: inline-block;
    box-sizing: border-box;
    animation: rotation 1s linear infinite;
}

@keyframes rotation {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}
/* End of loading animation */
</style>
