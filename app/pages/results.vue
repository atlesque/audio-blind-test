<template>
  <div class="results-page">
    <div class="container">
      <!-- Header -->
      <div class="results-header">
        <h1>
          <i class="pi pi-trophy" />
          Results
        </h1>
        <p class="subtitle">
          Ranked by total score (highest first)
        </p>
      </div>

      <!-- Results table -->
      <Card class="results-card">
        <template #content>
          <div
            v-for="(result, index) in store.rankedResults"
            :key="result.audio.id"
            class="result-item"
            :class="{ 'result-item--top': index === 0 }"
          >
            <!-- Rank badge -->
            <div
              class="rank-badge"
              :class="`rank-badge--${index + 1}`"
            >
              <span v-if="index === 0">
                <i class="pi pi-trophy" />
              </span>
              <span v-else>{{ index + 1 }}</span>
            </div>

            <!-- Track info -->
            <div class="track-info">
              <div class="track-name">
                {{ result.audio.name }}
              </div>
              <div class="track-meta">
                <span
                  v-if="result.audio.duration !== null"
                  class="track-duration"
                >
                  <i class="pi pi-clock" />
                  {{ formatDuration(result.audio.duration) }}
                </span>
                <span class="track-score">
                  Total: <strong>{{ result.total }}</strong>/{{ maxPossibleScore }}
                </span>
              </div>

              <!-- Criteria ratings -->
              <div
                v-if="store.effectiveCriteria.length > 1"
                class="criteria-ratings"
              >
                <div
                  v-for="criteria in store.effectiveCriteria"
                  :key="criteria"
                  class="criteria-rating-row"
                >
                  <span class="criteria-name">{{ criteria }}</span>
                  <Rating
                    :model-value="result.ratings[criteria] ?? 0"
                    :stars="5"
                    readonly
                    :cancel="false"
                  />
                  <span class="criteria-score">{{ result.ratings[criteria] ?? 0 }}/5</span>
                </div>
              </div>
              <div
                v-else
                class="single-rating"
              >
                <Rating
                  :model-value="result.ratings['General'] ?? 0"
                  :stars="5"
                  readonly
                  :cancel="false"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>

      <!-- Actions -->
      <div class="actions">
        <Button
          label="Export as TXT"
          icon="pi pi-download"
          severity="secondary"
          @click="exportTxt"
        />
        <Button
          label="Restart Test"
          icon="pi pi-refresh"
          @click="restartQuiz"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlindTestStore } from '~/stores/blindTest'

const store = useBlindTestStore()
const router = useRouter()

onMounted(() => {
  if (!store.testFinished) {
    router.replace('/')
  }
})

const maxPossibleScore = computed(() => store.effectiveCriteria.length * 5)

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60)
  const s = Math.floor(secs % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function exportTxt() {
  const lines: string[] = []
  lines.push('=== Audio Blind Test Results ===')
  lines.push(`Date: ${new Date().toLocaleDateString()}`)
  lines.push(`Criteria: ${store.effectiveCriteria.join(', ')}`)
  lines.push('')
  lines.push('--- Rankings ---')

  store.rankedResults.forEach((result, index) => {
    lines.push('')
    lines.push(`#${index + 1} — ${result.audio.name}`)
    if (result.audio.duration !== null) {
      lines.push(`Duration: ${formatDuration(result.audio.duration)}`)
    }
    lines.push(`Total Score: ${result.total}/${maxPossibleScore.value}`)

    store.effectiveCriteria.forEach((criteria) => {
      const score = result.ratings[criteria] ?? 0
      const stars = '★'.repeat(score) + '☆'.repeat(5 - score)
      lines.push(`  ${criteria}: ${stars} (${score}/5)`)
    })
  })

  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'blind-test-results.txt'
  a.click()
  URL.revokeObjectURL(url)
}

function restartQuiz() {
  store.reset()
  router.push('/')
}
</script>

<style scoped>
.results-page {
  min-height: 100vh;
  background: var(--p-surface-ground);
  padding: 2rem 1rem;
}

.container {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.results-header {
  text-align: center;
  padding: 1rem 0;
}

.results-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--p-primary-color);
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.subtitle {
  color: var(--p-text-muted-color);
  font-size: 1.1rem;
  margin: 0;
}

/* Result items */
.result-item {
  display: flex;
  gap: 1.25rem;
  padding: 1.25rem;
  border-radius: 0.75rem;
  border: 1px solid var(--p-content-border-color);
  margin-bottom: 1rem;
  background: var(--p-surface-card);
  transition: box-shadow 0.2s;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-item--top {
  border-color: var(--p-yellow-400);
  background: var(--p-yellow-50);
}

.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
  background: var(--p-surface-section);
  color: var(--p-text-muted-color);
  border: 2px solid var(--p-content-border-color);
}

.rank-badge--1 {
  background: var(--p-yellow-400);
  color: white;
  border-color: var(--p-yellow-500);
  font-size: 1.2rem;
}

.rank-badge--2 {
  background: var(--p-slate-400);
  color: white;
  border-color: var(--p-slate-500);
}

.rank-badge--3 {
  background: var(--p-orange-400);
  color: white;
  border-color: var(--p-orange-500);
}

.track-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.track-name {
  font-size: 1.05rem;
  font-weight: 600;
  word-break: break-word;
}

.track-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
}

.track-duration {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.criteria-ratings {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-top: 0.25rem;
}

.criteria-rating-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.criteria-name {
  font-size: 0.9rem;
  min-width: 100px;
  color: var(--p-text-muted-color);
}

.criteria-score {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  min-width: 2.5rem;
}

.single-rating {
  margin-top: 0.25rem;
}

/* Actions */
.actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding-bottom: 2rem;
  flex-wrap: wrap;
}
</style>
