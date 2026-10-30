import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { ChatInput } from './components/ChatInput.jsx';
import ChatMessages from './components/ChatMessages.jsx';
import { Chattyfrog } from './components/ChattyFrog.js';
import webllmService from './services/webllmService.js';
import './App.css';

const THEME_KEY = 'chatty-frog-theme';

function getInitialTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'light' || saved === 'dark') return saved;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function App() {
  const [chatMessages, setChatMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [llmState, setLlmState] = useState(webllmService.getState());
  const [theme, setTheme] = useState(getInitialTheme);
  const [documents, setDocuments] = useState([]);

  // Apply + persist theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    // 1. Subscribe to WebLLM status updates (progress, ready, errors)
    const unsubscribe = webllmService.subscribe((state) => {
      setLlmState(state);
    });

    // 2. Load nature knowledge base and start WebLLM in browser
    async function init() {
      await Chattyfrog.loadKnowledge();
      if (webllmService.isSupported) {
        try {
          await Chattyfrog.initAI();
        } catch (err) {
          console.warn("WebLLM auto-init notice:", err);
        }
      }
    }

    init();

    return () => unsubscribe();
  }, []);

  const handleStartLlm = () => {
    Chattyfrog.initAI().catch(err => {
      console.error("Manual WebLLM start error:", err);
    });
  };

  const handleToggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Read uploaded text files and hand them to Chatty Frog
  const handleUpload = async (files) => {
    const list = Array.from(files || []);
    if (!list.length) return;

    const loaded = [];
    const failed = [];
    for (const file of list) {
      try {
        const content = await file.text();
        if (!content.trim()) throw new Error('empty');
        Chattyfrog.addDocument({ name: file.name, content, size: file.size, uploadedAt: new Date() });
        loaded.push(file.name);
      } catch {
        failed.push(file.name);
      }
    }
    setDocuments(Chattyfrog.listDocuments());

    let message = '';
    if (loaded.length) {
      message = `*Ribbit!* I've read ${loaded.map(n => `"${n}"`).join(', ')}. Ask me anything about ${loaded.length > 1 ? 'them' : 'it'}! 🌿`;
    }
    if (failed.length) {
      message += `${message ? '\n\n' : ''}*Croak...* I couldn't read ${failed.map(n => `"${n}"`).join(', ')}. Please upload plain text files (.txt, .md, .csv, .json).`;
    }

    setChatMessages(prev => [
      ...prev,
      { id: crypto.randomUUID(), sender: 'frog', message }
    ]);
  };

  const handleRemoveDocument = (id) => {
    Chattyfrog.removeDocument(id);
    setDocuments(Chattyfrog.listDocuments());
  };

  return (
    <div className="app-container">
      <Header
        llmState={llmState}
        onStartLlm={handleStartLlm}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        documents={documents}
        onUpload={handleUpload}
        onRemoveDocument={handleRemoveDocument}
      />
      <main className="chat-card-container">
        <ChatMessages chatMessages={chatMessages} onUpload={handleUpload} />
        <ChatInput
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
        />
      </main>
    </div>
  );
}

export default App;
