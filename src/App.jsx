import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.jsx';
import { ChatInput } from './components/ChatInput.jsx';
import ChatMessages from './components/ChatMessages.jsx';
import { Chattyfrog } from './components/ChattyFrog.js';
import webllmService from './services/webllmService.js';
import './App.css';

function App() {
  const [chatMessages, setChatMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prefillInput, setPrefillInput] = useState('');
  const [llmState, setLlmState] = useState(webllmService.getState());

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

  const handlePromptClick = (prompt) => {
    setPrefillInput(prompt);
  };

  return (
    <div className="app-container">
      <Header
        llmState={llmState}
        onStartLlm={handleStartLlm}
        onPromptClick={handlePromptClick}
      />
      <main className="chat-card-container">
        <ChatMessages chatMessages={chatMessages} />
        <ChatInput
          chatMessages={chatMessages}
          setChatMessages={setChatMessages}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          prefillInput={prefillInput}
        />
      </main>
    </div>
  );
}

export default App;
