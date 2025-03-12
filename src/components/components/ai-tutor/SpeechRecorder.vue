<script>
export default {
    setup() {},
    data() {
        return {
            constraints: { audio: true },
            chunks: [],
            micAllowed: true,
            mediaRecorder: {},
            recording: false
        };
    },
    created() {},
    mounted() {
        if (navigator.mediaDevices) {
            console.log('getUserMedia supported.');
            navigator.mediaDevices
                .getUserMedia(this.constraints)
                .then((stream) => {
                    this.mediaRecorder = new MediaRecorder(stream);
                });
        }
    },
    methods: {
        allowMic() {
            if (navigator.mediaDevices) {
                console.log('getUserMedia supported.');

                navigator.mediaDevices
                    .getUserMedia(this.constraints)
                    .then((stream) => {
                        const mediaRecorder = new MediaRecorder(stream);
                        this.micAllowed = true;
                    });
            }
        },
        recordSpeech() {
            if (this.recording == false) {
                this.mediaRecorder.start();
                console.log(this.mediaRecorder.state);
                console.log('recorder started');
                this.recording = true;
            } else {
                this.mediaRecorder.stop();
                console.log(this.mediaRecorder.state);
                console.log('recorder stopped');
                this.recording = false;
                // this.stopRecording();

                this.mediaRecorder.ondataavailable = (e) => {
                    this.chunks.push(e.data);
                    console.log(this.chunks);
                    const blob = new Blob(this.chunks, {
                        type: 'audio/webm; codecs=opus'
                    });
                    this.chunks = [];
                    const audioURL = URL.createObjectURL(blob);
                    console.log(audioURL);

                    let audio = document.getElementById('audio');
                    audio.src = audioURL;

                    // Convert to Base64
                    var reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        var base64data = reader.result;
                        console.log(base64data);
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
                        audioData: base64data
                    })
                };
                let url = '/ai-tutor/stt/convert';

                const res = await fetch(url, requestOptions);
                if (res.status === 500) {
                    alert('The tutor can`t answer !!');
                    this.waitForAIresponse = false;
                    return;
                }
            } catch (error) {
                console.error(error);
            }
        }
        // stopRecording() {
        //     const blob = new Blob(this.chunks, {
        //         type: 'audio/wav'
        //     });
        //     this.chunks = [];
        //     const audioURL = URL.createObjectURL(blob);
        //     audio.src = audioURL;
        //     console.log('recorder stopped');
        // }
    }
};
</script>

<template>
    <audio controls id="audio">
        <source src="horse.ogg" type="audio/ogg" />
        <source src="horse.mp3" type="audio/mpeg" />
        Your browser does not support the audio tag.
    </audio>
    <button class="btn" @click="allowMic()">allow microphone</button>
    <button
        v-if="micAllowed"
        class="btn"
        :class="{ recording: recording == true }"
        @click="recordSpeech()"
    >
        <span v-if="!recording">record</span><span v-else>stop</span>
    </button>
</template>

<style scoped>
.recording {
    background-color: red;
}
</style>
