# audio-blind-test

A blind test app for comparing and rating audio files without seeing their names.

## Features

- **Upload audio files** — drag & drop or click to browse (MP3, WAV, FLAC, OGG, AAC, M4A)
- **Custom criteria** — add rating criteria (e.g. "Clarity", "Bass", "Warmth") or use a general rating
- **Blind playback** — audio files are shuffled and played without revealing titles or total duration
- **Star ratings** — rate each file 1–5 stars per criteria; navigate back to adjust scores
- **Ranked results** — files are ranked by total score; view per-criteria breakdown and actual filenames with duration
- **Export** — download results as a `.txt` file

## Tech Stack

- [Nuxt 4](https://nuxt.com/) with [pnpm](https://pnpm.io/)
- [PrimeVue](https://primevue.org/) for UI components (Aura theme)
- [Pinia](https://pinia.vuejs.org/) for state management
- [@nuxt/eslint](https://eslint.nuxt.com/) for linting

## Setup

```bash
pnpm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
pnpm dev
```

## Production

Build the application for production:

```bash
pnpm build
pnpm preview
```

## Lint

```bash
pnpm lint
```

Check out the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
