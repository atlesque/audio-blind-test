import { defineStore } from 'pinia'

export interface AudioFile {
  id: string
  name: string
  file: File
  objectUrl: string
  duration: number | null
  order: number
}

export interface Ratings {
  [criteriaId: string]: number
}

export interface AudioRatings {
  [audioId: string]: Ratings
}

export const useBlindTestStore = defineStore('blindTest', {
  state: () => ({
    audioFiles: [] as AudioFile[],
    criteria: [] as string[],
    ratings: {} as AudioRatings,
    currentIndex: 0,
    testStarted: false,
    testFinished: false,
  }),

  getters: {
    currentAudio: (state): AudioFile | null => {
      if (state.audioFiles.length === 0) return null
      return state.audioFiles[state.currentIndex] ?? null
    },

    effectiveCriteria: (state): string[] => {
      if (state.criteria.length === 0) return ['General']
      return state.criteria
    },

    isFirstAudio: (state): boolean => state.currentIndex === 0,

    isLastAudio: (state): boolean =>
      state.currentIndex === state.audioFiles.length - 1,

    rankedResults: (state) => {
      const criteria = state.criteria.length === 0 ? ['General'] : state.criteria
      return state.audioFiles
        .map((audio) => {
          const audioRatings = state.ratings[audio.id] ?? {}
          const total = criteria.reduce((sum, c) => {
            return sum + (audioRatings[c] ?? 0)
          }, 0)
          return {
            audio,
            ratings: audioRatings,
            total,
          }
        })
        .sort((a, b) => b.total - a.total)
    },
  },

  actions: {
    setAudioFiles(files: File[]) {
      // Revoke old object URLs
      for (const af of this.audioFiles) {
        URL.revokeObjectURL(af.objectUrl)
      }

      const audioFiles: AudioFile[] = files.map((file, i) => ({
        id: crypto.randomUUID(),
        name: file.name,
        file,
        objectUrl: URL.createObjectURL(file),
        duration: null,
        order: i,
      }))

      // Shuffle
      for (let i = audioFiles.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[audioFiles[i], audioFiles[j]] = [audioFiles[j]!, audioFiles[i]!]
      }

      this.audioFiles = audioFiles
    },

    setCriteria(criteria: string[]) {
      this.criteria = criteria.filter((c) => c.trim() !== '')
    },

    setDuration(audioId: string, duration: number) {
      const audio = this.audioFiles.find((a) => a.id === audioId)
      if (audio) audio.duration = duration
    },

    setRating(audioId: string, criteria: string, rating: number) {
      if (!this.ratings[audioId]) {
        this.ratings[audioId] = {}
      }
      this.ratings[audioId]![criteria] = rating
    },

    getRating(audioId: string, criteria: string): number {
      return this.ratings[audioId]?.[criteria] ?? 0
    },

    startTest() {
      this.currentIndex = 0
      this.testStarted = true
      this.testFinished = false
      this.ratings = {}
    },

    nextAudio() {
      if (this.currentIndex < this.audioFiles.length - 1) {
        this.currentIndex++
      }
    },

    previousAudio() {
      if (this.currentIndex > 0) {
        this.currentIndex--
      }
    },

    finishTest() {
      this.testFinished = true
    },

    reset() {
      for (const af of this.audioFiles) {
        URL.revokeObjectURL(af.objectUrl)
      }
      this.audioFiles = []
      this.criteria = []
      this.ratings = {}
      this.currentIndex = 0
      this.testStarted = false
      this.testFinished = false
    },
  },
})
