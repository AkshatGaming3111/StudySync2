# StudySync – AI Interactive Classroom 🎓✨

A modern, full-stack, responsive web application and virtual learning environment for teachers and students featuring real-time AI pedagogical assistance, smart digital whiteboard, homework management with AI auto-grading, an interactive examination arena with diagnostic breakdown, dynamic leaderboards, and gamified study tools.

---

## 🌟 Key Features

### 1. 👥 Multi-Role Authentication & 1-Click Persona Switcher
- **Teacher & Student Roles**: Experience the platform from both perspectives.
- **1-Click Quick Demo Bar**: Instant switching between:
  - *Dr. Alan Turing* (Professor of Computer Science & Discrete Math)
  - *Prof. Rosalind Franklin* (Biophysicist & Molecular Biology Lead)
  - *Alex Rivera* (Top Ranker #1 Student, 12th Grade)
  - *Maya Chen* (Bio-engineering Student Explorer)
  - *Liam, Sophia, Ethan* (Students with varying ranks & specialties)
- **Custom Registration & Login**: Full custom account creation with avatars and bios.

### 2. 🏛️ Virtual Classroom Management
- **Classroom Hub**: Create classes with custom subjects, room codes, schedule, and cover themes.
- **6-Character Room Codes**: Instant student enrollment (e.g. `CS101X`, `BIO102`, `AI2020`).
- **Interactive Stream**: Announcements, rich discussion threads, markdown formatting, LaTeX equations, emojis reactions, and comments.
- **Class Roster**: View enrolled classmates, levels, XP scores, and attendance.

### 3. 🤖 AI Classroom Co-Pilot ("StudyBot 3.0")
- **Multi-Persona AI Engine**: Switch between *Socratic Coding Mentor*, *Visual Science Explainer*, *Exam Cram Coach*, and *ELI5 Simplifier*.
- **LaTeX Math & Code Formatting**: Step-by-step mathematical reasoning and syntax highlighting.
- **Interactive Prompt Suggestions**: Instant follow-up queries and practice checks.
- **Hybrid AI Architecture**: Works 100% out of the box with built-in pedagogical intelligence, and supports live Google Gemini API keys via Settings.

### 4. 🎨 SyncBoard – Interactive Smart Whiteboard
- **Canvas Drawing Suite**: Freehand pencil, shapes (rectangles, circles, lines, arrows), eraser, color palette, and stroke width.
- **Grid Modes**: Switch between Grid, Dotted, and Clean Slate.
- **Undo / Redo & PNG Export**: Full stroke history and high-res image download.
- **AI Board Vision & Synthesis**: One-click **"AI Analyze Board"** to extract key concepts, LaTeX equations, and lecture notes directly from your canvas!

### 5. 📝 Homework & AI Auto-Grading Studio
- **Teacher Assignment Creation**: Set rubrics, point values, XP rewards, and due dates.
- **Student Submission Studio**: Submit solutions with LaTeX math and code blocks.
- **Student AI Pre-Check**: Provides clarity feedback and hints before final submission without giving away answers.
- **Teacher AI Rubric Auto-Grading**: One-click evaluation comparing submission against rubric criteria, with editable scores and constructive feedback.

### 6. 🧠 AI Examination Arena & Quizzes
- **AI Test Generator**: Generate tests on any subject (difficulty levels: Easy, Medium, Hard/Olympiad, custom question counts).
- **Timed Exam Simulator**: Full-screen focus mode with live countdown timer, question navigator, and flag-for-review toggle.
- **Instant Diagnostic Breakdown**: Question-by-question answer key with step-by-step reasoning, score percentages, and AI remediation tips.

### 7. 🏆 Dynamic Leaderboards & Gamification
- **Global & Class Leaderboards**: Live rankings by XP, streaks, levels, and quiz win-rates.
- **Top 3 Podium**: Gold, Silver, and Bronze badges for top scholars.
- **Unlockable Badges & Achievements**: 12+ badges (*"Grand Champion #1"*, *"Math Maverick"*, *"Streak Titan"*, *"Perfect 100%"*, *"Speed Demon"*, etc.).
- **Level Up Micro-Celebrations**: Animated XP notifications and confetti explosions.

### 8. 📚 AI Lecture Summarizer & 3D Flashcards
- **Lecture Summarizer**: Paste notes or lecture transcripts to generate executive summaries and key takeaways.
- **3D Interactive Flashcards**: Spaced-repetition review mode with difficulty rating (*Again, Hard, Good, Easy*).

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher)
- npm / npm.cmd

### 1. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
npm --prefix client install
```

### 2. Build Frontend
```bash
npm run build
```

### 3. Run the Application
```bash
npm start
```
Open **[http://localhost:5001](http://localhost:5001)** in your browser!

*(Optional: For live hot-reloading frontend development, run `npm run client` and visit `http://localhost:3000`)*

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, KaTeX (Math rendering), Canvas Confetti, Canvas API, Web Audio API
- **Backend**: Node.js, Express.js, CORS, Morgan, Local Persistent JSON Database Store (`server/data/studysync_db.json`)
- **AI Engine**: Google Gemini API integration with Pedagogical Fallback Intelligence Engine

---

## 📄 License
MIT License • Created for StudySync Educational Platform.
