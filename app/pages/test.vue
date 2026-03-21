<template>
  <div class="test-page">
    <div class="container">
      <!-- Header -->
      <div class="test-header">
        <h1>
          <i class="pi pi-headphones" />
          Blind Test
        </h1>
        <div class="progress-info">
          <span class="progress-label">
            Track {{ store.currentIndex + 1 }} of {{ store.audioFiles.length }}
          </span>
          <ProgressBar
            :value="progressPercent"
            :show-value="false"
            class="progress-bar"
          />
        </div>
      </div>

      <!-- Audio Player -->
      <Card
        v-if="currentAudio"
        class="player-card"
      >
        <template #content>
          <div class="player-content">
            <div class="track-badge">
              <i class="pi pi-music" />
              <span>Track {{ store.currentIndex + 1 }}</span>
            </div>

            <div class="audio-controls">
              <audio
                ref="audioRef"
                :src="currentAudio.objectUrl"
                preload="auto"
                @play="onPlay"
                @pause="onPause"
                @timeupdate="onTimeUpdate"
                @loadedmetadata="onLoadedMetadata"
                @ended="onEnded"
              />

              <!-- Play/Pause -->
              <Button
                :icon="isPlaying ? 'pi pi-pause' : 'pi pi-play'"
                :aria-label="isPlaying ? 'Pause' : 'Play'"
                rounded
                size="large"
                class="play-btn"
                @click="togglePlay"
              />

              <!-- Progress Slider -->
              <div class="seek-row">
                <span class="time-current">{{ formatTime(currentTime) }}</span>
                <Slider
                  v-model="sliderValue"
                  class="seek-slider"
                  :max="100"
                  :step="0.1"
                  @change="onSeek"
                />
                <!-- Total duration hidden intentionally -->
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Ratings -->
      <Card class="ratings-card">
        <template #title>
          <span class="ratings-title">
            <i class="pi pi-star" />
            Your Ratings
          </span>
        </template>
        <template #content>
          <div class="ratings-grid">
            <div
              v-for="criteria in store.effectiveCriteria"
              :key="criteria"
              class="rating-row"
            >
              <span class="criteria-label">{{ criteria }}</span>
              <Rating
                :model-value="getRating(criteria)"
                :stars="5"
                @update:model-value="(val) => setRating(criteria, val ?? 0)"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Navigation -->
      <div class="nav-buttons">
        <Button
          label="Previous"
          icon="pi pi-arrow-left"
          severity="secondary"
          :disabled="store.isFirstAudio"
          @click="goToPrevious"
        />

        <Button
          v-if="!store.isLastAudio"
          label="Next Track"
          icon="pi pi-arrow-right"
          icon-pos="right"
          @click="goToNext"
        />
        <Button
          v-else
          label="Finish & See Results"
          icon="pi pi-flag-fill"
          icon-pos="right"
          severity="success"
          @click="finishTest"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlindTestStore } from '~/stores/blindTest'

const store = useBlindTestStore()
const router = useRouter()

// Redirect if test not started
onMounted(() => {
  if (!store.testStarted || store.audioFiles.length === 0) {
    router.replace('/')
    return
  }
  // Auto-play first track
  nextTick(() => {
    audioRef.value?.play().catch(() => {})
  })
})

const audioRef = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const sliderValue = ref(0)

const currentAudio = computed(() => store.currentAudio)

const progressPercent = computed(() => {
  if (store.audioFiles.length === 0) return 0
  return Math.round(((store.currentIndex + 1) / store.audioFiles.length) * 100)
})

function togglePlay() {
  if (!audioRef.value) return
  if (isPlaying.value) {
    audioRef.value.pause()
  } else {
    audioRef.value.play().catch(() => {})
  }
}

function onPlay() {
  isPlaying.value = true
}

function onPause() {
  isPlaying.value = false
}

function onTimeUpdate() {
  if (!audioRef.value) return
  currentTime.value = audioRef.value.currentTime
  if (duration.value > 0) {
    sliderValue.value = (audioRef.value.currentTime / duration.value) * 100
  }
}

function onLoadedMetadata() {
  if (!audioRef.value) return
  duration.value = audioRef.value.duration
  if (currentAudio.value) {
    store.setDuration(currentAudio.value.id, audioRef.value.duration)
  }
}

function onEnded() {
  isPlaying.value = false
}

function onSeek(value: number | number[]) {
  if (!audioRef.value || duration.value === 0) return
  const val = Array.isArray(value) ? (value[0] ?? 0) : value
  audioRef.value.currentTime = (val / 100) * duration.value
}

function formatTime(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function getRating(criteria: string): number {
  if (!currentAudio.value) return 0
  return store.getRating(currentAudio.value.id, criteria)
}

function setRating(criteria: string, value: number) {
  if (!currentAudio.value) return
  store.setRating(currentAudio.value.id, criteria, value)
}

async function switchTrack() {
  isPlaying.value = false
  currentTime.value = 0
  sliderValue.value = 0
  duration.value = 0
  await nextTick()
  audioRef.value?.load()
  audioRef.value?.play().catch(() => {})
  isPlaying.value = true
}

function goToNext() {
  store.nextAudio()
  switchTrack()
}

function goToPrevious() {
  store.previousAudio()
  switchTrack()
}

function finishTest() {
  store.finishTest()
  router.push('/results')
}
</script>

<style scoped>
.test-page {
  min-height: 100vh;
  background: var(--p-surface-ground);
  padding: 2rem 1rem;
}

.container {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Header */
.test-header {
  text-align: center;
}

.test-header h1 {
  font-size: 1.9rem;
  font-weight: 700;
  color: var(--p-primary-color);
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  letter-spacing: 0.04em;
}

.progress-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.progress-label {
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
}

.progress-bar {
  height: 8px;
}

/* Player */
.player-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 0.5rem 0;
}

.track-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--p-primary-50);
  color: var(--p-primary-color);
  border: 1px solid var(--p-primary-200);
  border-radius: 2rem;
  padding: 0.4rem 1.2rem;
  font-weight: 600;
  font-size: 1rem;
}

.audio-controls {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.play-btn {
  width: 4rem;
  height: 4rem;
  min-width: 4rem;
  max-width: 4rem;
  flex: 0 0 4rem;
  aspect-ratio: 1;
  padding: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-size: 1.5rem;
}

.seek-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.time-current {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  font-variant-numeric: tabular-nums;
  min-width: 2.5rem;
}

.seek-slider {
  flex: 1;
}

/* Ratings */
.ratings-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.ratings-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rating-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.criteria-label {
  font-size: 1rem;
  font-weight: 500;
  min-width: 100px;
}

/* Nav */
.nav-buttons {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 2rem;
}
</style>
