import { useState } from 'react'
import { Chattyfrog } from './ChattyFrog.js'
import './ChatInput.css'

export function ChatInput({ chatMessages, setChatMessages }) {
    const [inputText, setInputText] = useState('');

    function saveInputText(event) {
        setInputText(event.target.value);
    }

    function sendMessage() {
        if (!inputText.trim()) return; // prevent empty messages

        const newChatMessages = [...chatMessages, { message: inputText, sender: "user", id: crypto.randomUUID() }];

        setChatMessages(newChatMessages);

        const response = Chattyfrog.getResponse(inputText);
        setChatMessages([
            ...newChatMessages,
            { message: response, sender: "frog", id: crypto.randomUUID() }
        ]);

        setInputText('');
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