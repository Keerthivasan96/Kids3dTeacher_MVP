// frontend/src/app.js
// SPOKEN ENGLISH COACH — FINAL MVP (December 2025)
// Casual / Practice Mode + Memory + No bugs

import { startListening, stopListening } from "./speech.js";
import { avatarStartTalking, avatarStopTalking } from "./threejs-avatar.js";

const API_URL = "http://localhost:4000/api/chat";

// UI Elements
const micBtn = document.getElementById("micBtn");
const testBtn = document.getElementById("testBtn");
const clearBtn = document.getElementById("clearBtn");
const demoLessonBtn = document.getElementById("demoLessonBtn");

const pauseTtsBtn = document.getElementById("pauseTtsBtn");
const resumeTtsBtn = document.getElementById("resumeTtsBtn");
const stopTtsBtn = document.getElementById("stopTtsBtn");

const transcriptBox = document.getElementById("transcript");
const replyBox = document.getElementById("reply");
const statusEl = document.getElementById("status");
const logEl = document.getElementById("log");

const schoolMode = document.getElementById("schoolMode");
const classButtons = document.querySelectorAll(".class-btn");
const modeToggle = document.getElementById("modeToggle");

const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("sendBtn");
const conversationScroll = document.getElementById("conversationScroll");

// State
let isListening = false;
let isSpeaking = false;
let lastSpokenText = "";
let conversationHistory = [];
let isPracticeMode = false; // false = Casual Chat, true = Practice Mode

// -----------------------------------------------------------
// LOGGING
// -----------------------------------------------------------
function log(msg) {
  if (logEl) {
    logEl.innerHTML += `• ${msg}<br>`;
    logEl.scrollTop = logEl.scrollHeight;
  }
  console.log("[Spidey]", msg);
}

// -----------------------------------------------------------
// RENDER MARKDOWN
// -----------------------------------------------------------
function renderReplyMarkdown(md) {
  const html = marked?.parse(md) || md;
  const safe = DOMPurify?.sanitize(html, { ADD_ATTR: ["target"] }) || html;
  replyBox && (replyBox.innerHTML = safe);

  const div = document.createElement("div");
  div.innerHTML = safe;
  return (div.textContent || div.innerText || "").replace(/\s+/g, " ").trim();
}

// -----------------------------------------------------------
// AUTO SCROLL
// -----------------------------------------------------------
function scrollToBottom() {
  conversationScroll?.scrollTo({ top: conversationScroll.scrollHeight, behavior: "smooth" });
}

// -----------------------------------------------------------
// SPOKEN ENGLISH PROMPT — MODE + GRADE AWARE
// -----------------------------------------------------------
function buildPrompt(userText) {
  const currentClass = schoolMode?.value || "class7";

  const modeInstruction = isPracticeMode
    ? "PRACTICE MODE ACTIVE: Always praise first, then correct 1–2 things (grammar/pronunciation/word choice), give better phrasing, ask kid to repeat the sentence."
    : "CASUAL CHAT MODE: Be super fun and friendly. Only tiny gentle suggestions if mistake is huge. Mostly just chat and build confidence.";

  const gradeConfig = {
    class3: "Super simple words, lots of excitement, Indian kid examples (mango, cricket, school tiffin). Short sentences.",
    class7: "Friendly teen coach, clear corrections with why, relatable examples (exams, friends, Instagram).",
    class10: "Confident public speaking mentor, fix filler words, natural fluency, interview tips."
  }[currentClass];

  const history = conversationHistory
    .map(m => `${m.role === "user" ? "Student" : "Spidey"}: ${m.content}`)
    .join("\n");

  return `
You are Spidey — the coolest Spoken English coach for Indian kids.
Always positive, fun, encouraging — like a big brother.

${modeInstruction}

Grade level: ${currentClass === "class3" ? "Class 3 (8 years old)" : currentClass === "class7" ? "Class 7 (13 years old)" : "Class 10 (15-16 years old)"}
${gradeConfig}

Previous conversation:
${history || "First message"}

Student just said: "${userText}"

Respond now — warm, exciting, full of energy!
  `.trim();
}

// -----------------------------------------------------------
// TTS WITH JAW SYNC
// -----------------------------------------------------------
function speak(text) {
  if (!text?.trim()) return;

  window.speechSynthesis.cancel();
  avatarStopTalking?.();

  lastSpokenText = text;

  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = "en-IN";
  utter.rate = 0.95;
  utter.pitch = 1.25;
  utter.volume = 1;

  const voices = window.speechSynthesis.getVoices();
  const bestVoice = voices.find(v => v.lang.startsWith("en-IN")) ||
                    voices.find(v => v.lang.startsWith("en") && /male/i.test(v.name)) ||
                    voices.find(v => v.lang.startsWith("en"));

  if (bestVoice) utter.voice = bestVoice;

  utter.onstart = () => {
    isSpeaking = true;
    avatarStartTalking?.();
    statusEl && (statusEl.textContent = "Spidey is speaking...");
  };

  utter.onend = utter.onerror = () => {
    isSpeaking = false;
    avatarStopTalking?.();
    statusEl && (statusEl.textContent = "Your turn!");
  };

  window.speechSynthesis.speak(utter);
}

// -----------------------------------------------------------
// BACKEND CALL
// -----------------------------------------------------------
async function sendToBackend(text) {
  if (!text.trim()) return;

  conversationHistory.push({ role: "user", content: text });
  transcriptBox && (transcriptBox.textContent = text);
  transcriptBox && (transcriptBox.style.display = "block");

  statusEl && (statusEl.textContent = "Spidey is thinking...");

  const currentClass = schoolMode?.value || "class7"; // ← FIXED: defined here

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: buildPrompt(text),
        temperature: currentClass === "class3" ? 0.2 : 0.35,
        max_tokens: currentClass === "class3" ? 120 : currentClass === "class10" ? 300 : 200
      })
    });

    if (!res.ok) throw new Error("Backend error");

    const data = await res.json();
    const reply = data.reply || "Wow, you're awesome! Keep going! ⭐";

    conversationHistory.push({ role: "assistant", content: reply });

    const speakable = renderReplyMarkdown(reply);
    scrollToBottom();
    speak(speakable);

  } catch (err) {
    console.error(err);
    replyBox.innerHTML = `<p style="color:red">Network error — is backend running on port 4000?</p>`;
    statusEl && (statusEl.textContent = "Error");
  }
}

// -----------------------------------------------------------
// MODE TOGGLE
// -----------------------------------------------------------
modeToggle?.addEventListener("click", () => {
  isPracticeMode = !isPracticeMode;
  modeToggle.classList.toggle("active", isPracticeMode);
  log(isPracticeMode ? "Practice Mode ON" : "Casual Chat mode");
});

// -----------------------------------------------------------
// BUTTONS & INPUT
// -----------------------------------------------------------
micBtn?.addEventListener("click", () => {
  if (isListening) {
    stopListening();
    isListening = false;
    micBtn.textContent = "🎤 Start Speaking Practice";
    statusEl && (statusEl.textContent = "Your turn!");
  } else {
    window.speechSynthesis.cancel();
    avatarStopTalking?.();
    isListening = true;
    micBtn.textContent = "🛑 Stop Listening";
    statusEl && (statusEl.textContent = "Listening...");
    startListening(sendToBackend);
  }
});

testBtn?.addEventListener("click", () => {
  sendToBackend("Hello Spidey! Let's practice English.");
});

clearBtn?.addEventListener("click", () => {
  transcriptBox && (transcriptBox.style.display = "none");
  replyBox && (replyBox.innerHTML = "");
  conversationHistory = [];
  window.speechSynthesis.cancel();
  avatarStopTalking?.();
  log("New session started");
});

pauseTtsBtn?.addEventListener("click", () => window.speechSynthesis.pause());
resumeTtsBtn?.addEventListener("click", () => window.speechSynthesis.resume());
stopTtsBtn?.addEventListener("click", () => {
  window.speechSynthesis.cancel();
  avatarStopTalking?.();
});

// Class buttons
classButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    classButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    schoolMode && (schoolMode.value = btn.dataset.class);
    log(`Class changed to ${btn.textContent}`);
  });
});

// Typed input
sendBtn?.addEventListener("click", () => {
  const text = chatInput.value.trim();
  if (text) {
    chatInput.value = "";
    sendToBackend(text);
  }
});

chatInput?.addEventListener("keydown", e => {
  if (e.key === "Enter") sendBtn.click();
});

// Init
log("Spidey Spoken English Coach ready!");
statusEl && (statusEl.textContent = "Your turn!");

// Default class
document.querySelector('[data-class="class7"]')?.classList.add("active");
