# QA Checklist

Run these checks before production deploy.

## Auth

- Register a new user.
- Login with email/password.
- Login demo user: `alex@academy.os` / `academy123`.
- Confirm unauthenticated app routes redirect to `/login`.

## Materi

- Open `/materi`.
- Search a mata pelajaran.
- Filter by kelas.
- Expand a mata pelajaran.
- Open a bab via `Buka Materi Bab`.
- Confirm text, video, PDF, and ringkasan materi render.
- Mark materi as complete and confirm progress/XP feedback.
- Open Tutor AI drawer from materi.

## Bank Soal

- Open `/bank-soal`.
- Change jurusan and mata pelajaran.
- Filter by kelas, difficulty, type, topic, and status.
- Expand a question and confirm pembahasan is visible only in bank browsing mode.
- Start `Mulai Latihan`.
- Start `Mode Ujian`.
- Generate AI questions with a topic.

## Ujian

- Open `/ujian/mulai`.
- Select a mata pelajaran and mode.
- Confirm latihan santai shows pembahasan only after checking an answer.
- Confirm ujian mode has timer, navigation grid, flagging, submit validation, and no answer key before submit.
- Refresh during ujian and confirm draft answers are restored.
- Submit and verify `/ujian/hasil/[id]` shows score, review, pembahasan, and AI coach.

## AI Tutor

- Open `/tutor`.
- Send a normal question.
- Send a prompt from hasil ujian.
- Confirm loading state appears.
- Confirm response appears or a clear fallback/error appears.
- Confirm no API key is exposed in the browser.

## PDF Summary

- Open `/brain`.
- Upload a readable text PDF under 10 MB.
- Confirm summary, quiz, flashcards, and timeline are based on document content.
- Upload a non-PDF binary file and confirm it is rejected.
- Upload a scanned/unreadable PDF and confirm honest extraction error.
- Paste text in text mode and confirm it is summarized.

## Build

```bash
npx tsc --noEmit --pretty false
npm run lint
npm run build
```
