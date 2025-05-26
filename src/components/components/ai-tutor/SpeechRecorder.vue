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
            chunks: [],
            micAllowed: false,
            mediaRecorder: null,
            stream: null,
            recording: false,
            isLoading: false,
            recordingTimer: null,
            recordingDuration: 0
        };
    },
    methods: {
        async allowMic() {
            try {
                if (navigator.mediaDevices) {
                    this.stream = await navigator.mediaDevices.getUserMedia({
                        audio: true
                    });
                    this.mediaRecorder = new MediaRecorder(this.stream);
                    this.setupMediaRecorder();
                    this.micAllowed = true;
                }
            } catch (error) {
                console.error('Error accessing microphone:', error);
                alert(
                    'Could not access your microphone. Please check your browser settings.'
                );
            }
        },

        setupMediaRecorder() {
            if (!this.mediaRecorder) return;

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.chunks.push(e.data);
            };

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.chunks, {
                    type: 'audio/webm; codecs=opus'
                });
                this.chunks = [];
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () =>
                    this.sendAudioDataToServer(reader.result);
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
                this.recordingDuration = 0;
                this.recordingTimer = setInterval(
                    () => this.recordingDuration++,
                    1000
                );
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
                if (this.recordingTimer) {
                    clearInterval(this.recordingTimer);
                    this.recordingTimer = null;
                }
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
                const response = await fetch('/ai-tutor/stt/convert', {
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
                });

                this.isLoading = false;

                if (response.ok) {
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
            this.recordingDuration = 0;
            if (this.recordingTimer) {
                clearInterval(this.recordingTimer);
                this.recordingTimer = null;
            }
        },

        cleanupResources() {
            if (this.recordingTimer) clearInterval(this.recordingTimer);

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
                this.stream.getTracks().forEach((track) => track.stop());
                this.stream = null;
            }

            this.mediaRecorder = null;
            this.micAllowed = false;
            this.recording = false;
            this.isLoading = false;
            this.chunks = [];
        },

        formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${mins}:${secs.toString().padStart(2, '0')}`;
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

        <!-- Recording/Processing Button with Timer -->
        <div v-else class="recording-container">
            <button
                class="voice-btn"
                :class="{ recording, processing: isLoading }"
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

            <!-- Recording Timer and Pulse Effect -->
            <div v-if="recording" class="recording-indicator">
                <div class="recording-pulse"></div>
                <span class="recording-timer">{{
                    formatTime(recordingDuration)
                }}</span>
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
    background: #f8fafc;
    color: #64748b;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.voice-btn:hover:not(:disabled) {
    background: #e0e0e0;
    transform: scale(1.05);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.voice-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.voice-btn.permission {
    background: #dbeafe;
    color: #3b82f6;
}

.voice-btn.permission:hover {
    background: #bbdefb;
}

.voice-btn.recording {
    background: #fef2f2;
    color: #ef4444;
    border: 2px solid #fecaca;
}

.voice-btn.processing {
    background: #fef3c7;
    color: #f59e0b;
    border: 2px solid #fed7aa;
}

.recording-container {
    display: flex;
    align-items: center;
    gap: 12px;
}

.recording-indicator {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background: rgba(239, 68, 68, 0.1);
    border-radius: 12px;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.recording-pulse {
    width: 8px;
    height: 8px;
    background: #ef4444;
    border-radius: 50%;
    animation: pulse 1s ease-in-out infinite;
}

.recording-timer {
    font-size: 12px;
    font-weight: 600;
    color: #ef4444;
    font-family: monospace;
    min-width: 35px;
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
    0%,
    100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.4;
        transform: scale(1.2);
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

@media (max-width: 767px) {
    .voice-btn {
        width: 36px;
        height: 36px;
    }
    .voice-btn svg {
        width: 18px;
        height: 18px;
    }
    .recording-timer {
        font-size: 11px;
        min-width: 30px;
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
