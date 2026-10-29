import React from 'react';
import ChattyfrogImg from '../assets/frog.png';
import UserImg from '../assets/user.png';
import './ChatMessage.css';

export function ChatMessage({ message, sender, isStreaming, isTyping }) {
    const isFrog = sender === 'frog';

    return (
        <div className={`chat-message-row ${isFrog ? "chat-message-frog" : "chat-message-user"}`}>
            {isFrog && (
                <div className="avatar-container">
                    <img src={ChattyfrogImg} alt="Chatty Frog" className="chat-message-image" />
                </div>
            )}
            <div className={`chat-message-bubble ${isFrog ? "bubble-frog" : "bubble-user"}`}>
                <div className="sender-tag">
                    {isFrog ? "Chatty Frog" : "You"}
                </div>
                
                {isTyping && !message ? (
                    <div className="typing-indicator" aria-label="Chatty Frog is thinking">
                        <span className="dot dot-1" />
                        <span className="dot dot-2" />
                        <span className="dot dot-3" />
                        <span className="typing-text">croaking...</span>
                    </div>
                ) : (
                    <div className="chat-message-text">
                        {message}
                        {isStreaming && <span className="stream-cursor">▌</span>}
                    </div>
                )}
            </div>
            {!isFrog && (
                <div className="avatar-container">
                    <img src={UserImg} alt="You" className="chat-message-image" />
                </div>
            )}
        </div>
    );
}

export default ChatMessage;