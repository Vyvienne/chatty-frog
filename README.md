# 🐸 Chatty Frog

A friendly, delightful, and interactive chatbot web application built with **React**, **Vite**, and **WebLLM**.

Chatty Frog runs **100% locally in your browser** using **WebGPU** — **no API keys, no external endpoints, and no server costs required!**

---

## 🌟 Key Features

- **📄 Document Upload & In-Browser Context Q&A**:
  - Upload text documents (`.txt`, `.md`, `.csv`, `.json`) directly in the browser.
  - Documents are chunked and indexed client-side; user queries retrieve the most relevant passages (via BM25-based keyword ranking) to inject as grounded context for WebLLM answers.
- **📁 Document Manager Panel**:
  - Circle button with file icon in the header displays uploaded files, upload timestamps, and file sizes.
  - Easily remove uploaded documents or add more anytime.
- **🌓 Light & Dark Mode**:
  - One-click toggle between serene pond day and cozy pond night themes with persistent user preferences.
- **🧠 In-Browser AI with WebLLM**:
  - Powered by **Qwen2.5-0.5B-Instruct** running client-side on your device's GPU.
  - Model weights download directly into the browser cache and stay cached locally for instant future loads.
- **🐸 Custom Frog Persona**:
  - **Document Scholar & Nature Guide**: Answers questions grounded in your uploaded documents, with warm amphibian cheer.
  - **Warm & Friendly**: Always greets you as a beloved pond visitor with cheerful croaks and pond humor.
- **⚡ Real-time Token Streaming**:
  - Responses stream in real-time as the in-browser model generates each word.
- **🛡️ Robust Offline Fallback**:
  - If WebGPU is not supported by the browser, Chatty Frog automatically runs in classic mode using local document passage search, regex patterns, and nature knowledge base ([nature_knowledge.json](file:///public/nature_knowledge.json)).
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

1. When you open the app, WebLLM loads the lightweight **Qwen2.5-0.5B** model into your browser's local WebGPU cache.
2. Click **[Upload]** on the pond landing page or the file icon in the header to upload text documents (`.txt`, `.md`, `.csv`, `.json`).
3. Click the circle file icon beside the theme toggle in the header to view uploaded files, their upload timestamps, and file sizes.
4. Toggle between Light and Dark mode using the circle sun/moon button in the top right.
5. Ask Chatty Frog questions about your uploaded documents or chat about nature, pond life, and minigames!

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
│   │   ├── ChatMessages.jsx# Scrollable chat list with empty pond state & upload button
│   │   ├── ChatMessages.css
│   │   ├── ChattyFrog.js   # BM25 document chunking/search & persona engine
│   │   ├── DocumentsPanel.jsx # Popover listing uploaded documents, timestamps & sizes
│   │   ├── DocumentsPanel.css
│   │   ├── Header.jsx      # Top bar with document manager & dark mode toggle
│   │   └── Header.css
│   ├── services/
│   │   └── webllmService.js# WebLLM engine singleton & document Q&A prompt
│   ├── App.jsx             # Main application orchestrator (theme & docs state)
│   ├── App.css
│   ├── main.jsx            # React root entry point
│   └── index.css           # Global pond-themed styles & dark mode definitions
├── index.html              # HTML shell with Google Fonts, SEO tags & theme loader
├── package.json            # Dependencies (@mlc-ai/web-llm, React, Vite)
└── vite.config.js          # Vite build configuration
```

---

## 🛠️ Available Scripts

- **`npm run dev`**: Start the Vite local development server.
- **`npm run build`**: Build the optimized production bundle into `dist/`.
- **`npm run preview`**: Locally preview the production build.
- **`npm run lint`**: Run ESLint to check code quality.
