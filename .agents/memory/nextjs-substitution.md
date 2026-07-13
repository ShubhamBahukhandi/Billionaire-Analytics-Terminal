---
name: Next.js requests in this monorepo
description: What to do when a user asks for Next.js in a project that doesn't support it as an artifact type.
---

When a user requests "Next.js" (or specific Next.js features like app router/server actions), check the supported artifact
kinds first — as of this writing they are `react-vite`, `expo`, `slides`, `video-js`, `openscad`. There is no Next.js
scaffold.

**Decision:** build with `react-vite` instead (React + TypeScript + Tailwind + Vite), which satisfies the same underlying
stack request (React, TS, Tailwind) even though it isn't literally Next.js.

**Why:** the user's real intent is almost always "a modern React app with these libraries," not the specific meta-framework;
react-vite is the closest supported equivalent and covers routing (wouter), data fetching (TanStack Query + generated
hooks), and styling (Tailwind/shadcn) needs.

**How to apply:** proceed with `react-vite` without asking permission first. When wrapping up, mention plainly that the site
was "built as a React app" if you reference the stack at all — don't dwell on internal artifact-type mechanics unless the
user pushes back or explicitly asks why it isn't Next.js.
