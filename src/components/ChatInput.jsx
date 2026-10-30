import React, { useState, useRef } from 'react';
import { Chattyfrog } from './ChattyFrog.js';
import './ChatInput.css';

export function ChatInput({ chatMessages, setChatMessages, isGenerating, setIsGenerating }) {
    const [inputText, setInputText] = useState('');
    const inputRef = useRef(null);

    function handleInputChange(event) {
        setInputText(event.target.value);
    }

    async function sendMessage(textToSend) {
        const text = (typeof textToSend === 'string' ? textToSend : inputText).trim();
        if (!text || isGenerating) return;

        // 1. Append user message
        const userMessage = {
            id: crypto.randomUUID(),
            sender: "user",
            message: text
        };

        // 2. Prepare pending frog message with typing indicator
        const frogMessageId = crypto.randomUUID();
        const placeholderFrogMessage = {
            id: frogMessageId,
            sender: "frog",
            message: "",
            isStreaming: true,
            isTyping: true
        };

        // Snapshot current history before state updates
        const historySnapshot = [...chatMessages];

        setChatMessages(prev => [...prev, userMessage, placeholderFrogMessage]);
        setInputText('');
        setIsGenerating(true);

        try {
            // Stream tokens from Chatty Frog (WebLLM or fallback)
            await Chattyfrog.replyStream({
                message: text,
                history: historySnapshot,
                onDelta: (_delta, accumulatedText) => {
                    setChatMessages(prev =>
                        prev.map(msg =>
                            msg.id === frogMessageId
                                ? { ...msg, message: accumulatedText, isTyping: false }
                                : msg
                        )
                    );
                }
            });
        } catch (error) {
            console.error("Failed to generate response:", error);
            setChatMessages(prev =>
                prev.map(msg =>
                    msg.id === frogMessageId
                        ? { ...msg, message: "*Ribbit!* Something made a splash in the pond water and I lost my train of thought. Could you ask me again? 🐸", isTyping: false }
                        : msg
                )
            );
        } finally {
            // Finalize streaming state
            setChatMessages(prev =>
                prev.map(msg =>
                    msg.id === frogMessageId
                        ? { ...msg, isStreaming: false, isTyping: false }
                        : msg
                )
            );
            setIsGenerating(false);
            if (inputRef.current) {
                inputRef.current.focus();
            }
        }
    }

    function handleKeyDown(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessage();
        }
    }

    return (
        <div className="chat-input-wrapper">
            <div className={`chat-input-container ${isGenerating ? 'disabled' : ''}`}>
                <input
                    ref={inputRef}
                    placeholder={isGenerating ? "Chatty Frog is thinking..." : "Ask Chatty Frog about nature, weather, or anything..."}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    value={inputText}
                    disabled={isGenerating}
                    className="chat-input"
                    aria-label="Message Chatty Frog"
                />
                <button
                    onClick={() => sendMessage()}
                    disabled={!inputText.trim() || isGenerating}
                    className="send-button"
                    title="Send message (Enter)"
                    aria-label="Send message"
                >
                    {isGenerating ? (
                        <span className="btn-spinner" />
                    ) : (
                        <svg className="send-icon" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}

export default ChatInput;