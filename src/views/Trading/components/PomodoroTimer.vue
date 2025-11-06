<template>
    <div class="pomodoro-timer">
        <v-card-title class="d-flex justify-space-between align-center">
            <span class="text-h6">Pomodoro</span>
            <v-btn icon="mdi-close" size="small" variant="text" @click="$emit('close')"></v-btn>
        </v-card-title>
        <v-card-text class="text-center">
            <div class="timer-display">
                <div class="timer-circle">
                    <div class="timer-text">{{ formattedTime }}</div>
                </div>
            </div>
            <div class="timer-label">Pomodoro clock</div>
            <div class="timer-controls">
                <v-btn icon="mdi-refresh" variant="text" @click="reset"></v-btn>
                <v-btn
                    :icon="isRunning ? 'mdi-pause' : 'mdi-play'"
                    variant="text"
                    @click="toggle"
                ></v-btn>
                <v-btn icon="mdi-skip-next" variant="text" @click="skip"></v-btn>
            </div>
        </v-card-text>
    </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

export default {
    name: 'PomodoroTimer',
    props: {
        theme: {
            type: String,
            default: 'dark',
        },
    },
    emits: ['close'],
    setup() {
        const timeLeft = ref(25 * 60) // 25 minutes in seconds
        const isRunning = ref(false)
        let interval = null

        const formattedTime = computed(() => {
            const minutes = Math.floor(timeLeft.value / 60)
            const seconds = timeLeft.value % 60
            return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        })

        const toggle = () => {
            isRunning.value = !isRunning.value
            if (isRunning.value) {
                interval = setInterval(() => {
                    if (timeLeft.value > 0) {
                        timeLeft.value--
                    } else {
                        reset()
                        // Play notification sound or show alert
                    }
                }, 1000)
            } else {
                if (interval) {
                    clearInterval(interval)
                    interval = null
                }
            }
        }

        const reset = () => {
            timeLeft.value = 25 * 60
            isRunning.value = false
            if (interval) {
                clearInterval(interval)
                interval = null
            }
        }

        const skip = () => {
            reset()
        }

        onBeforeUnmount(() => {
            if (interval) {
                clearInterval(interval)
            }
        })

        return {
            timeLeft,
            isRunning,
            formattedTime,
            toggle,
            reset,
            skip,
        }
    },
}
</script>

<style scoped>
.pomodoro-timer {
    min-width: 300px;
}

.timer-display {
    margin: 24px 0;
}

.timer-circle {
    width: 200px;
    height: 200px;
    border-radius: 50%;
    border: 4px solid rgba(255, 255, 255, 0.12);
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto;
}

.timer-text {
    font-size: 48px;
    font-weight: 600;
}

.timer-label {
    font-size: 14px;
    opacity: 0.7;
    margin-bottom: 16px;
}

.timer-controls {
    display: flex;
    justify-content: center;
    gap: 8px;
}
</style>

