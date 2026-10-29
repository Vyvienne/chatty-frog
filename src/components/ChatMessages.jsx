import React, { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage.jsx';
import frogImg from '../assets/frog.png';
import './ChatMessages.css';

function ChatMessages({ chatMessages }) {
    const chatMessagesRef = useRef(null);

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
                        I love explaining things about plants, rain, animals, and ecosystems!
                    </p>
                    <p className="empty-hint">
                        Just don't ask me too much about computers or "Wi-Fi"... humans say it's like an invisible spider web, but I haven't seen one yet!
                    </p>
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