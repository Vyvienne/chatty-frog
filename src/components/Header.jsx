import React from 'react';
import frogImg from '../assets/frog.png';
import './Header.css';

export function Header({ llmState, onStartLlm, onPromptClick }) {
    const { isSupported, isLoading, isReady, progress, activeModel, error } = llmState;

    const quickPrompts = [
        "🌧️ Why does it rain?",
        "🦋 How do caterpillars become butterflies?",
        "💻 Chatty Frog, what is the internet?",
        "🪰 What is your favorite bug to eat?",
        "🪙 Flip a coin for me!"
    ];

    return (
        <header className="chatty-header">
            <div className="header-top">
                <div className="frog-brand">
                    <div className="frog-avatar-wrapper">
                        <img src={frogImg} alt="Chatty Frog" className="header-frog-img" />
                        <span className={`status-dot ${isReady ? 'online' : isLoading ? 'busy' : 'offline'}`} />
                    </div>
                    <div className="frog-title-area">
                        <h1 className="header-title">Chatty Frog 🐸</h1>
                        <p className="header-tagline">
                            Nature scholar & pond enthusiast • Clueless about human technology
                        </p>
                    </div>
                </div>

                <div className="model-badge-container">
                    {!isSupported ? (
                        <div className="model-badge unsupported" title="WebGPU is not enabled in this browser. Running with rule-based knowledge.">
                            <span className="badge-icon">⚠️</span>
                            <span>Classic Mode (No WebGPU)</span>
                        </div>
                    ) : isLoading ? (
                        <div className="model-badge loading">
                            <div className="badge-spinner" />
                            <div className="progress-details">
                                <span className="progress-label">Loading Qwen2.5-0.5B...</span>
                                <div className="progress-bar-bg">
                                    <div
                                        className="progress-bar-fill"
                                        style={{ width: `${Math.max(5, progress?.progress || 0)}%` }}
                                    />
                                </div>
                                <span className="progress-text">{progress?.text || "Downloading model..."}</span>
                            </div>
                        </div>
                    ) : isReady ? (
                        <div className="model-badge ready" title={`Running locally in browser via WebGPU: ${activeModel}`}>
                            <span className="badge-pulse" />
                            <div className="badge-content">
                                <span className="badge-title">WebLLM (Qwen 0.5B)</span>
                                <span className="badge-subtitle">100% Free & In-Browser</span>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="model-badge error" title={error}>
                            <span className="badge-icon">⚠️</span>
                            <span>AI Failed • Fallback Active</span>
                        </div>
                    ) : (
                        <button className="init-llm-btn" onClick={onStartLlm}>
                            ⚡ Load In-Browser AI
                        </button>
                    )}
                </div>
            </div>

            {/* Quick question suggestion chips */}
            <div className="quick-prompts-bar">
                <span className="quick-prompt-label">Try asking:</span>
                <div className="quick-prompt-chips">
                    {quickPrompts.map((promptText, idx) => (
                        <button
                            key={idx}
                            className="prompt-chip"
                            onClick={() => onPromptClick && onPromptClick(promptText)}
                        >
                            {promptText}
                        </button>
                    ))}
                </div>
            </div>
        </header>
    );
}

export default Header;
