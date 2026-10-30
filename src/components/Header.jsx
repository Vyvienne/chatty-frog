import React, { useState, useCallback } from 'react';
import frogImg from '../assets/frog.png';
import { DocumentsPanel } from './DocumentsPanel.jsx';
import './Header.css';

export function Header({ llmState, onStartLlm, theme, onToggleTheme, documents = [], onUpload, onRemoveDocument }) {
    const { isSupported, isLoading, isReady, error } = llmState;
    const isDark = theme === 'dark';
    const [showDocs, setShowDocs] = useState(false);
    const closeDocs = useCallback(() => setShowDocs(false), []);

    return (
        <header className="chatty-header">
            <div className="header-top">
                <div className="frog-brand">
                    <div className="frog-avatar-wrapper">
                        <img src={frogImg} alt="Chatty Frog" className="header-frog-img" />
                    </div>
                    <div className="frog-title-area">
                        <h1 className="header-title">Chatty Frog</h1>
                    </div>
                </div>

                <div className="header-actions">
                    {!isSupported ? (
                        <div className="model-badge unsupported" title="WebGPU is not enabled in this browser. Running with rule-based knowledge.">
                            <span className="badge-icon">⚠️</span>
                            <span>Classic Mode (No WebGPU)</span>
                        </div>
                    ) : error ? (
                        <div className="model-badge error" title={error}>
                            <span className="badge-icon">⚠️</span>
                            <span>AI Failed • Fallback Active</span>
                        </div>
                    ) : !isLoading && !isReady ? (
                        <button className="init-llm-btn" onClick={onStartLlm}>
                            ⚡ Load In-Browser AI
                        </button>
                    ) : null}

                    <button
                        id="documents-toggle"
                        className={`header-circle-btn ${showDocs ? 'active' : ''}`}
                        onClick={() => setShowDocs(v => !v)}
                        aria-label="View uploaded documents"
                        aria-expanded={showDocs}
                        title="Uploaded documents"
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                            <line x1="8" y1="13" x2="16" y2="13" />
                            <line x1="8" y1="17" x2="13" y2="17" />
                        </svg>
                        {documents.length > 0 && (
                            <span className="docs-count">{documents.length}</span>
                        )}
                    </button>

                    <button
                        id="theme-toggle"
                        className="header-circle-btn theme-toggle"
                        onClick={onToggleTheme}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                        {isDark ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>

                    {showDocs && (
                        <DocumentsPanel
                            documents={documents}
                            onClose={closeDocs}
                            onUpload={onUpload}
                            onRemove={onRemoveDocument}
                        />
                    )}
                </div>
            </div>
        </header>
    );
}

export default Header;
