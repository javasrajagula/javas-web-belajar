# Academy OS Ω — Architectural Design

This document details the modular layout and data flow design of the personal learning operating system.

## Structural Design

```
                     +---------------------------------------+
                     |         Next.js Root Layout           |
                     +---------------------------+-----------+
                                                 |
                                                 v
                     +---------------------------+-----------+
                     |         App Layer / Layout View       |
                     +-------+-------------------+-------+---+
                             |                   |       |
                             v                   v       v
                     +-------+---+ +-------------+-+ +---+-------+
                     |  Sidebar  | | Top Navigation| |Mobile Nav|
                     +-----------+ +---------------+ +-----------+
                                         |
                                         v
                     +-------------------+-------------------+
                     |         Zustand State Stores          |
                     |  (User, Materials, Planner, Tutor)    |
                     +-------------------+-------------------+
                                         |
                                         v
                     +-------------------+-------------------+
                     |         Data Storage Wrapper          |
                     |     (Local Storage / Supabase DB)     |
                     +---------------------------------------+
```

## Modular Services
1. **State Store Dispatcher**: Zustand handles atomic updates across views. Any changes to user study durations, XP points, flashcards, or schedules are broadcast instantly, triggering responsive UI updates.
2. **AI Mock Middleware**: Replaces standard Claude API queries to support offline execution, generating realistic summaries, socratic questions, and detailed timelines on-the-fly.
3. **Reactive Canvas Renderer**: React Flow processes node structures for the Knowledge Galaxy topic map, utilizing custom levels and categories.
