# 🐸 Chatty Frog

A friendly and interactive chatbot web application built with **React** and **Vite**. Chatty Frog can chat with you, answer nature trivia, flip coins, roll dice, and integrate with modern AI models such as **Google Gemini** or **OpenAI ChatGPT**.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (version 18+ recommended) and `npm` installed on your machine.

---

### 1. Installation

Clone or open the repository and install project dependencies:

```bash
npm install
```

---

### 2. Configure Environment Variables

1. Copy the sample environment file to create your local `.env`:

   ```bash
   # On Windows (PowerShell)
   Copy-Item .env-test .env

   # On macOS/Linux or Git Bash
   cp .env-test .env
   ```

2. Open [.env](file:///.env) and insert your API key:
   - **Google Gemini API Key**: Obtain one from [Google AI Studio](https://aistudio.google.com/) and set `VITE_GEMINI_API_KEY`.
   - **OpenAI API Key**: Obtain one from [OpenAI Platform](https://platform.openai.com/) and set `VITE_OPENAI_API_KEY`.

> [!NOTE]
> `.env` is listed in `.gitignore` to prevent secret API keys from being committed to source control.

---

### 3. Run the Development Server

Start the local Vite development server:

```bash
npm run dev
```

Open your browser at the local URL shown in the terminal (usually `http://localhost:5173`).

---

## 💬 How to Use Chatty Frog

1. **Type a message** into the input box at the bottom.
2. Press **Enter** or click the **Send** button.
3. Chatty Frog will respond in real time!

### Built-in Quick Actions:
- **Greetings**: `"Hello"`, `"Hi"`, or `"Hey"`
- **Mood**: `"How are you?"`
- **Games**:
  - `"Flip a coin"` &rarr; Flips heads or tails
  - `"Roll a dice"` &rarr; Rolls a number from 1 to 6
- **Date**: `"What is today's date?"`
- **Nature Trivia**: Ask questions based on the built-in nature knowledge base.
- **AI Chat**: When connected to Gemini or ChatGPT, ask Chatty Frog anything!

---

## 🛠️ Other Available Scripts

- **`npm run build`**: Build the optimized production bundle into the `dist/` folder.
- **`npm run preview`**: Locally preview the production build.
- **`npm run lint`**: Run ESLint to inspect code quality.

---

## 📁 Project Structure

```text
chatty-frog/
├── public/                 # Static assets (nature knowledge data, etc.)
├── src/
│   ├── assets/             # Images and icons (frog.png, user.png)
│   ├── components/         # React components
│   │   ├── ChatInput.jsx   # Input box & send logic
│   │   ├── ChatMessage.jsx # Individual chat bubble
│   │   ├── ChatMessages.jsx# Scrollable chat message list
│   │   └── ChattyFrog.js   # Chatbot response engine & logic
│   ├── App.jsx             # Main application component
│   ├── main.jsx            # React root entry point
│   └── styles.css          # Styling rules
├── .env-test               # Example environment variables template
├── .gitignore              # Git ignore rules (protects .env)
├── package.json            # Project dependencies & scripts
└── vite.config.js          # Vite build configuration
```
