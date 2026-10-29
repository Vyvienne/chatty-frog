# 🐸 Chatty Frog

A friendly, delightful, and interactive chatbot web application built with **React**, **Vite**, and **WebLLM**.

Chatty Frog runs **100% locally in your browser** using **WebGPU** — **no API keys, no external endpoints, and no server costs required!**

---

## 🌟 Key Features

- **🧠 In-Browser AI with WebLLM**:
  - Powered by **Qwen2.5-0.5B-Instruct** running client-side on your device's GPU.
  - Model weights download directly into the browser cache and stay cached locally for instant future loads.
- **🐸 Custom Frog Persona**:
  - **Nature Scholar**: Deeply knowledgeable and passionate about animals, amphibians, insects, plants, pond ecology, the water cycle, and weather phenomena.
  - **Clueless about Human Tech**: Innocently confused by modern human gadgets, the internet, slang, and office work (wondering if "the web" is a spider's silk trap or why humans don't just eat "software bugs").
  - **Warm & Friendly**: Always greets you as a beloved pond visitor with cheerful croaks and pond humor.
- **⚡ Real-time Token Streaming**:
  - Responses stream in real-time as the in-browser model generates each word.
- **🛡️ Robust Offline Fallback**:
  - If WebGPU is not supported by the browser, Chatty Frog automatically runs in classic mode using its local regex patterns and nature knowledge base ([nature_knowledge.json](file:///public/nature_knowledge.json)).
- **🎮 Built-in Minigames & Quick Actions**:
  - Coin flips (`"Flip a coin"`)
  - Dice rolls (`"Roll a dice"`)
  - Date & nature trivia

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- A modern browser with **WebGPU** support enabled (e.g., Google Chrome, Microsoft Edge, Brave, or Safari 18+).

---

### 1. Installation

```bash
npm install
```

---

### 2. Run the Development Server

No API keys or `.env` configuration needed! Simply run:

```bash
npm run dev
```

Open your browser at the local URL shown in your terminal (typically `http://localhost:5173`).

---

## 💬 How It Works

1. When you open the app, WebLLM loads the lightweight **Qwen2.5-0.5B** model into your browser's local WebGPU cache. A status bar at the top displays download and compilation progress.
2. Once loaded, the status badge turns green (`🟢 WebLLM Active • 100% Free & In-Browser`).
3. Type a message or click one of the quick prompt suggestions:
   - *"🌧️ Why does it rain?"*
   - *"🦋 How do caterpillars become butterflies?"*
   - *"💻 Chatty Frog, what is the internet?"*
   - *"🪰 What is your favorite bug to eat?"*
   - *"🪙 Flip a coin for me!"*
4. Chatty Frog will respond in real time with its signature pond charm!

---

## 📁 Project Structure

```text
chatty-frog/
├── public/                 # Static assets (nature knowledge data, etc.)
│   └── nature_knowledge.json
├── src/
│   ├── assets/             # Images and icons (frog.png, user.png)
│   ├── components/         # React components
│   │   ├── ChatInput.jsx   # Input box, streaming trigger & send logic
│   │   ├── ChatInput.css
│   │   ├── ChatMessage.jsx # Message bubble with streaming cursor & typing indicator
│   │   ├── ChatMessage.css
│   │   ├── ChatMessages.jsx# Scrollable chat list with empty pond state
│   │   ├── ChatMessages.css
│   │   ├── ChattyFrog.js   # Response engine (WebLLM + local persona fallback)
│   │   ├── Header.jsx      # Top bar with model download progress & prompt chips
│   │   └── Header.css
│   ├── services/
│   │   └── webllmService.js# WebLLM engine singleton & nature persona prompt
│   ├── App.jsx             # Main application orchestrator
│   ├── App.css
│   ├── main.jsx            # React root entry point
│   └── index.css           # Global pond-themed styles & typography
├── index.html              # HTML shell with Google Fonts & SEO tags
├── package.json            # Dependencies (@mlc-ai/web-llm, React, Vite)
└── vite.config.js          # Vite build configuration
```

---

## 🛠️ Available Scripts

- **`npm run dev`**: Start the Vite local development server.
- **`npm run build`**: Build the optimized production bundle into `dist/`.
- **`npm run preview`**: Locally preview the production build.
- **`npm run lint`**: Run ESLint to check code quality.
