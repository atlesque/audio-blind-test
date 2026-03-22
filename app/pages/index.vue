<template>
  <div class="setup-page">
    <div class="container">
      <div class="header">
        <h1>
          <i class="pi pi-headphones" />
          Audio Blind Test
        </h1>
        <p class="subtitle">
          Upload audio files and test your ear — without seeing the titles!
        </p>
      </div>

      <!-- Step 1: Upload Audio Files -->
      <Card class="step-card">
        <template #title>
          <span class="step-title">
            <span class="step-badge">1</span>
            Upload Audio Files
          </span>
        </template>
        <template #content>
          <div
            class="drop-zone"
            :class="{ 'drop-zone--active': isDragging }"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="onDrop"
            @click="fileInputRef?.click()"
          >
            <i class="pi pi-upload drop-zone__icon" />
            <p class="drop-zone__text">
              Drag & drop audio files here, or click to browse
            </p>
            <p class="drop-zone__hint">
              Supported formats: MP3, WAV, FLAC, OGG, AAC, M4A
            </p>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept="audio/*"
            multiple
            style="display: none"
            @change="onFileInputChange"
          >

          <div
            v-if="selectedFiles.length > 0"
            class="file-list"
          >
            <div class="file-list__header">
              <span>{{ selectedFiles.length }} file(s) selected</span>
              <Button
                label="Clear all"
                severity="secondary"
                size="small"
                text
                @click="clearFiles"
              />
            </div>
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="file-item"
            >
              <i class="pi pi-music file-item__icon" />
              <span class="file-item__name">{{ file.name }}</span>
              <Button
                icon="pi pi-times"
                severity="danger"
                size="small"
                rounded
                text
                @click="removeFile(index)"
              />
            </div>
          </div>
        </template>
      </Card>

      <!-- Step 2: Add Criteria -->
      <Card class="step-card">
        <template #title>
          <span class="step-title">
            <span class="step-badge">2</span>
            Add Criteria
            <span class="step-optional">(optional)</span>
          </span>
        </template>
        <template #content>
          <p class="criteria-hint">
            Add rating criteria (e.g. "Clarity", "Bass", "Warmth"). If none are added, a single
            general rating will be used.
          </p>

          <div class="criteria-input-row">
            <InputText
              v-model="newCriteria"
              placeholder="Enter a criteria..."
              class="criteria-input"
              @keydown.enter="addCriteria"
            />
            <Button
              label="Add"
              icon="pi pi-plus"
              :disabled="!newCriteria.trim()"
              @click="addCriteria"
            />
          </div>

          <div
            v-if="criteria.length > 0"
            class="criteria-list"
          >
            <Chip
              v-for="c in criteria"
              :key="c"
              :label="c"
              removable
              @remove="removeCriteria(c)"
            />
          </div>
          <div
            v-else
            class="criteria-empty"
          >
            <i class="pi pi-info-circle" />
            No criteria added — a general rating will be used.
          </div>
        </template>
      </Card>

      <!-- Start Button -->
      <div class="start-section">
        <Button
          label="Start Blind Test"
          icon="pi pi-play"
          size="large"
          :disabled="selectedFiles.length < 1"
          class="start-button"
          @click="startTest"
        />
        <p
          v-if="selectedFiles.length < 1"
          class="start-hint"
        >
          Upload at least one audio file to begin
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBlindTestStore } from '~/stores/blindTest'

const store = useBlindTestStore()
const router = useRouter()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const selectedFiles = ref<File[]>([])
const criteria = ref<string[]>([])
const newCriteria = ref('')

function onDrop(event: DragEvent) {
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files ?? []).filter((f) =>
    f.type.startsWith('audio/'),
  )
  addFiles(files)
}

function onFileInputChange(event: Event) {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  addFiles(files)
  input.value = ''
}

function addFiles(files: File[]) {
  const existingNames = new Set(selectedFiles.value.map((f) => f.name))
  const newFiles = files.filter((f) => !existingNames.has(f.name))
  selectedFiles.value.push(...newFiles)
}

function removeFile(index: number) {
  selectedFiles.value.splice(index, 1)
}

function clearFiles() {
  selectedFiles.value = []
}

function addCriteria() {
  const trimmed = newCriteria.value.trim()
  if (trimmed && !criteria.value.includes(trimmed)) {
    criteria.value.push(trimmed)
  }
  newCriteria.value = ''
}

function removeCriteria(criteriaToRemove: string) {
  criteria.value = criteria.value.filter((criteria) => criteria !== criteriaToRemove)
}

function startTest() {
  if (selectedFiles.value.length === 0) return
  store.setAudioFiles(selectedFiles.value)
  store.setCriteria(criteria.value)
  store.startTest()
  router.push('/test')
}
</script>

<style scoped>
.setup-page {
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

.header {
  text-align: center;
  padding: 1rem 0;
}

.header h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--p-primary-color);
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  letter-spacing: 0.04em;
}

.header h1 .pi {
  font-size: 1.9rem;
  font-family: 'primeicons', sans-serif;
}

.subtitle {
  color: var(--p-text-muted-color);
  font-size: 1rem;
  font-weight: 400;
  font-family: 'Inter', system-ui, sans-serif;
  letter-spacing: 0.01em;
  margin: 0;
}

.step-card :deep(.p-card-title) {
  font-size: 0.85rem;
}

.step-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.step-badge {
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  border-radius: 50%;
  width: 1.75rem;
  height: 1.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
}

.step-optional {
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--p-text-muted-color);
}

/* Drop zone */
.drop-zone {
  border: 2px dashed var(--p-content-border-color);
  border-radius: 0.75rem;
  padding: 2.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--p-surface-section);
}

.drop-zone:hover,
.drop-zone--active {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50);
}

.drop-zone__icon {
  font-size: 2.5rem;
  color: var(--p-primary-color);
  margin-bottom: 0.75rem;
}

.drop-zone__text {
  font-size: 1rem;
  color: var(--p-text-color);
  margin: 0 0 0.25rem;
}

.drop-zone__hint {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  margin: 0;
}

/* File list */
.file-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--p-surface-section);
  border-radius: 0.5rem;
  border: 1px solid var(--p-content-border-color);
}

.file-item__icon {
  color: var(--p-primary-color);
  flex-shrink: 0;
}

.file-item__name {
  flex: 1;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Criteria */
.criteria-hint {
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
  margin: 0 0 1rem;
}

.criteria-input-row {
  display: flex;
  gap: 0.5rem;
}

.criteria-input {
  flex: 1;
}

.criteria-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
}

.criteria-empty {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Start */
.start-section {
  text-align: center;
  padding: 1rem 0;
}

.start-button {
  font-size: 1.1rem;
  padding: 0.85rem 2.5rem;
}

.start-hint {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
}
</style>
