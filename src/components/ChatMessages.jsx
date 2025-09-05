import { useRef, useEffect } from 'react'
import { ChatMessage } from './ChatMessage.jsx'
import './ChatMessages.css'

function ChatMessages({ chatMessages }) {
    /*
    // Original data
    const chatMessages = array[0];            
    // Function to copy the original data and update the state
    const setChatMessages = array[1];
    
    const [chatMessages, setChatMessages] = array;
    */

    const chatMessagesRef = useRef(null);
    useEffect(() => {
        const containerElement = chatMessagesRef.current;
        if (containerElement) {
            containerElement.scrollTop = containerElement.scrollHeight;
        }
    }, [chatMessages]);

    return (
        <div className="chat-messages-container" ref={chatMessagesRef}>
            {chatMessages.map((msg) => (
                <ChatMessage
                    key={msg.id}
                    message={msg.message}
                    sender={msg.sender}
                />
            ))}
        </div>
    );
}

export default ChatMessages;