import React, { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage.jsx';
import frogImg from '../assets/frog.png';
import './ChatMessages.css';

function ChatMessages({ chatMessages, onUpload }) {
    const chatMessagesRef = useRef(null);
    const fileInputRef = useRef(null);

    // Auto-scroll on new messages or streaming updates
    useEffect(() => {
        const container = chatMessagesRef.current;
        if (container) {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [chatMessages]);

    const handleFileChange = (event) => {
        if (onUpload) onUpload(event.target.files);
        event.target.value = '';
    };

    return (
        <div className="chat-messages-container" ref={chatMessagesRef}>
            {chatMessages.length === 0 ? (
                <div className="empty-pond-state">
                    <div className="empty-frog-icon">
                        <img src={frogImg} alt="Chatty Frog" />
                    </div>
                    <h2>*Ribbit!* Welcome to the Pond! 🌿</h2>
                    <p>
                        I'm <strong>Chatty Frog</strong>, your friendly amphibian companion.
                        Ask me anything related to the documents that you have uploaded
                    </p>
                    <input
                        ref={fileInputRef}
                        id="document-upload-input"
                        type="file"
                        multiple
                        accept=".txt,.md,.markdown,.csv,.json,text/plain"
                        onChange={handleFileChange}
                        hidden
                    />
                    <button
                        id="document-upload-btn"
                        className="upload-button"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload
                    </button>
                </div>
            ) : (
                chatMessages.map((msg) => (
                    <ChatMessage
                        key={msg.id}
                        message={msg.message}
                        sender={msg.sender}
                        isStreaming={msg.isStreaming}
                        isTyping={msg.isTyping}
                    />
                ))
            )}
        </div>
    );
}

export default ChatMessages;