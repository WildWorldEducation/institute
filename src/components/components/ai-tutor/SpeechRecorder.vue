<script>
export default {
    props: [
        'tutorType',
        'skill',
        'skillLevel',
        'learningObjectives',
        'isAITokenLimitReached'
    ],
    emits: ['recording-started', 'recording-stopped', 'message-sent'],
    data() {
        return {
            constraints: { audio: true },
            chunks: [],
            micAllowed: false,
            mediaRecorder: null,
            stream: null,
            recording: false,
            isLoading: false,
            recordingTimer: null,
            audioLevel: 0
        };
    },
    methods: {
        async allowMic() {
            try {
                if (navigator.mediaDevices) {
                    const stream = await navigator.mediaDevices.getUserMedia(
                        this.constraints
                    );
                    this.stream = stream;
                    this.mediaRecorder = new MediaRecorder(stream);
                    this.setupMediaRecorder();
                    this.setupAudioLevelDetection(stream);
                    this.micAllowed = true;
                }
            } catch (error) {
                console.error('Error accessing microphone:', error);
                alert(
                    'Could not access your microphone. Please check your browser settings.'
                );
            }
        },

        setupAudioLevelDetection(stream) {
            const audioContext = new (window.AudioContext ||
                window.webkitAudioContext)();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            microphone.connect(analyser);
            analyser.fftSize = 256;

            const updateAudioLevel = () => {
                if (this.recording) {
                    analyser.getByteFrequencyData(dataArray);
                    const average =
                        dataArray.reduce((a, b) => a + b) / dataArray.length;
                    this.audioLevel = Math.min(100, (average / 128) * 100);
                    requestAnimationFrame(updateAudioLevel);
                } else {
                    this.audioLevel = 0;
                }
            };
            updateAudioLevel();
        },

        setupMediaRecorder() {
            if (!this.mediaRecorder) return;

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    this.chunks.push(e.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.chunks, {
                    type: 'audio/webm; codecs=opus'
                });
                this.chunks = [];

                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    this.sendAudioDataToServer(reader.result);
                };
            };
        },

        async startRecording() {
            if (!this.mediaRecorder) {
                await this.allowMic();
                if (!this.mediaRecorder) return;
            }

            try {
                this.mediaRecorder.start();
                this.recording = true;
                this.$emit('recording-started');
            } catch (error) {
                console.error('Error starting recording:', error);
                this.resetRecorder();
            }
        },

        stopRecording() {
            if (!this.mediaRecorder || !this.recording) return;

            try {
                this.mediaRecorder.stop();
                this.recording = false;
                this.isLoading = true;
                this.$emit('recording-stopped');
            } catch (error) {
                console.error('Error stopping recording:', error);
                this.resetRecorder();
            }
        },

        recordSpeech() {
            if (!this.recording) {
                this.startRecording();
            } else {
                this.stopRecording();
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
                        skillLevel: this.englishSkillLevel || this.skillLevel,
                        learningObjectives: this.learningObjectives,
                        audioData: base64data,
                        tutorType: this.tutorType
                    })
                };

                let url = '/ai-tutor/stt/convert';
                let res = await fetch(url, requestOptions);

                this.isLoading = false;

                if (res.ok) {
                    await this.$parent.getChatHistory();
                    this.$emit('message-sent');

                    this.$nextTick(() => {
                        if (this.$parent.scrollToMessageInput) {
                            this.$parent.scrollToMessageInput();
                        }
                    });
                } else {
                    throw new Error('Server error');
                }
            } catch (error) {
                console.error('Error sending audio data:', error);
                this.isLoading = false;
                alert('Failed to send your recording. Please try again.');
            }
        },

        resetRecorder() {
            this.recording = false;
            this.isLoading = false;
            this.chunks = [];
        },

        cleanupResources() {
            if (this.mediaRecorder && this.recording) {
                try {
                    this.mediaRecorder.stop();
                } catch (error) {
                    console.error(
                        'Error stopping media recorder during cleanup:',
                        error
                    );
                }
            }

            if (this.stream) {
                this.stream.getTracks().forEach((track) => {
                    track.stop();
                });
                this.stream = null;
            }

            this.mediaRecorder = null;
            this.micAllowed = false;
            this.recording = false;
            this.isLoading = false;
            this.chunks = [];
        }
    },

    mounted() {
        this.visibilityHandler = () => {
            if (document.visibilityState === 'hidden' && this.recording) {
                this.stopRecording();
            }
        };
        document.addEventListener('visibilitychange', this.visibilityHandler);
    },
    beforeUnmount() {
        document.removeEventListener(
            'visibilitychange',
            this.visibilityHandler
        );
        window.removeEventListener('beforeunload', this.cleanupResources);
        this.cleanupResources();
    }
};
</script>

<template>
    <div class="voice-recorder">
        <!-- Permission Button -->
        <button
            v-if="!micAllowed"
            class="voice-btn permission"
            @click="allowMic()"
            :disabled="isAITokenLimitReached"
            title="Allow microphone access"
        >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path
                    d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2M19 11C19 15.4 15.4 19 11 19V21H13C13.6 21 14 21.4 14 22S13.6 23 13 23H11C10.4 23 10 22.6 10 22S10.4 21 11 21V19C6.6 19 3 15.4 3 11H5C5 14.3 7.7 17 11 17S17 14.3 17 11H19Z"
                />
            </svg>
        </button>

        <!-- Recording/Processing Button with Audio Visualization -->
        <div v-else class="recording-container">
            <button
                class="voice-btn"
                :class="{
                    recording: recording,
                    processing: isLoading
                }"
                @click="recordSpeech()"
                :disabled="isAITokenLimitReached || isLoading"
                :title="recording ? 'Stop recording' : 'Start recording'"
            >
                <!-- Microphone Icon -->
                <svg
                    v-if="!recording && !isLoading"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path
                        d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2M19 11C19 15.4 15.4 19 11 19V21H13C13.6 21 14 21.4 14 22S13.6 23 13 23H11C10.4 23 10 22.6 10 22S10.4 21 11 21V19C6.6 19 3 15.4 3 11H5C5 14.3 7.7 17 11 17S17 14.3 17 11H19Z"
                    />
                </svg>

                <!-- Stop Icon -->
                <svg
                    v-else-if="recording"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path d="M6,6H18V18H6V6Z" />
                </svg>

                <!-- Processing Spinner -->
                <div v-else-if="isLoading" class="spinner"></div>
            </button>

            <!-- Audio Visualization (only when recording) -->
            <div v-if="recording" class="audio-viz">
                <div
                    v-for="i in 4"
                    :key="i"
                    class="audio-bar"
                    :class="{ active: audioLevel > i * 25 }"
                ></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.voice-recorder {
    display: flex;
    align-items: center;
    gap: 8px;
}

.voice-btn {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: #f5f5f5;
    color: #666;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.voice-btn:hover:not(:disabled) {
    background: #e0e0e0;
    transform: scale(1.05);
}

.voice-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.voice-btn.permission {
    background: #e3f2fd;
    color: #1976d2;
}

.voice-btn.permission:hover {
    background: #bbdefb;
}

.voice-btn.recording {
    background: #ff4444;
    color: white;
    animation: pulse 1.5s infinite;
}

.voice-btn.processing {
    background: #ffa726;
    color: white;
}

.recording-container {
    display: flex;
    align-items: center;
    gap: 8px;
}

.audio-viz {
    display: flex;
    align-items: flex-end;
    gap: 2px;
    height: 20px;
}

.audio-bar {
    width: 3px;
    background: #ddd;
    border-radius: 2px;
    transition: all 0.1s ease;
}

.audio-bar:nth-child(1) {
    height: 8px;
}
.audio-bar:nth-child(2) {
    height: 14px;
}
.audio-bar:nth-child(3) {
    height: 20px;
}
.audio-bar:nth-child(4) {
    height: 14px;
}

.audio-bar.active {
    background: #4caf50;
}

.spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes pulse {
    0% {
        box-shadow: 0 0 0 0 rgba(255, 68, 68, 0.4);
    }
    70% {
        box-shadow: 0 0 0 6px rgba(255, 68, 68, 0);
    }
    100% {
        box-shadow: 0 0 0 0 rgba(255, 68, 68, 0);
    }
}

@keyframes spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

/* Responsive sizing */
@media (max-width: 767px) {
    .voice-btn {
        width: 36px;
        height: 36px;
    }

    .voice-btn svg {
        width: 18px;
        height: 18px;
    }

    .audio-viz {
        height: 18px;
    }

    .audio-bar:nth-child(1) {
        height: 6px;
    }
    .audio-bar:nth-child(2) {
        height: 12px;
    }
    .audio-bar:nth-child(3) {
        height: 18px;
    }
    .audio-bar:nth-child(4) {
        height: 12px;
    }
}

@media (min-width: 768px) {
    .voice-btn {
        width: 44px;
        height: 44px;
    }

    .voice-btn svg {
        width: 22px;
        height: 22px;
    }
}
</style>
