import { useState } from 'react'
import { Chattyfrog } from './ChattyFrog.js'
import './ChatInput.css'

export function ChatInput({ setChatMessages }) {
    const [inputText, setInputText] = useState('');

    function saveInputText(event) {
        setInputText(event.target.value);
    }

    async function sendMessage() {
        if (!inputText.trim()) return; // prevent empty messages

        // Add user message immediately
        const userMessage = { message: inputText, sender: "user", id: crypto.randomUUID() };
        setChatMessages(prev => [...prev, userMessage]);

        // clear input
        setInputText('');

        // Optional: show a placeholder for Chattyfrog
        const typingMessage = { message: "Processing...", sender: "frog", id: crypto.randomUUID(), typing: true };
        setChatMessages(prev => [...prev, typingMessage]);

        // Wait for Chattyfrog's response (with natural delay)
        const response = await Chattyfrog.getResponseAsync(inputText);

        // Replace the typing placeholder with real response
        setChatMessages(prev =>
            prev.map(msg =>
                msg.id === typingMessage.id
                    ? { ...msg, message: response, typing: false }
                    : msg
            )
        );
    }


    function handleKeyDown(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // prevent line break
            sendMessage();
        }
    }

    return (
        <div className="chat-input-container">
            <input
                placeholder="Enter your message"
                size="30"
                onChange={saveInputText}
                onKeyDown={handleKeyDown}
                value={inputText}
                className="chat-input"
            />
            <button
                onClick={sendMessage}
                className="send-button"
            >
                Send
            </button>
        </div>
    );
}