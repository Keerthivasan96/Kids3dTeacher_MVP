# Kids3dTeacher_MVP

# Spidey Teacher 🕷️✨ – Real-Time 3D AI Avatar for Kids (Classroom Edition)

The coolest, most engaging AI teacher companion ever built for kids aged 5–16.

Spider-Man (PS4 mask) comes to life in glorious 3D, listens to the child, answers in perfect age-appropriate language, moves his head naturally, opens his mouth when speaking, and never breaks the scroll or UI — everything is buttery smooth on desktop, tablet, and phone.

### Why this project?
- Zero lag, zero jank, zero scroll bugs (we killed every single demon)
- Perfectly framed, brightly lit, heroic-looking Spidey mask (real jaw bone animation when talking)
- Grade-specific prompts (Class 3 → super simple & short, Class 10 → proper explanations)
- Quick Class & Subject buttons + dropdowns
- Voice input (Web Speech API) + browser TTS (ready for ElevenLabs/OpenAI Realtime drop-in)
- Kid-safe, pastel candy UI with glass panels and perfect responsiveness
- Works offline-capable (except backend calls)

### Tech Stack
- Frontend: Vite + Vanilla JS (no React bloat — blazing fast)
- 3D Avatar: Three.js + GLTFLoader (PS4 Spider-Man mask GLB)
- Speech: Web Speech API (recognition + synthesis)
- Backend: Node.js/Express local server → calls OpenAI/Groq/Anthropic (your choice)
- Styling: Pure CSS (2025 kid-friendly glassmorphism theme)
- Deployment-ready: Netlify/Vercel in one click

### Features That Already Work 100%
- Mic button → start/stop listening (red pulsating when active)
- Real-time transcription + AI reply in bubbles
- Grade-appropriate responses (Class 3 = 30–70 words, simple questions; Class 10 = proper depth)
- Avatar bobs head, breathes subtly, jaw opens realistically when speaking
- Pause/Resume/Stop TTS buttons
- Test Chat / Clear / Demo Lesson buttons
- Perfect scroll everywhere (even when touching the avatar)
- Mobile + desktop pixel-perfect

### Setup (2 minutes)
```bash
git clone https://github.com/Keerthivasan96/speaking-avatar-mvp-backup.git
cd speaking-avatar-mvp-backup

# Frontend
cd frontend
npm install
npm run dev

# Backend (in another terminal)
cd backend
npm install
node server.js   # or npm run dev
