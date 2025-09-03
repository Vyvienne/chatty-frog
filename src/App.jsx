import { useState, useRef, useEffect } from 'react'
import { Chattyfrog } from 'supersimpledev'
import './App.css'

function ChatInput({ chatMessages, setChatMessages }) {
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

function ChatMessage({ message, sender }) {
  return (
    <div className={
      sender === 'frog' ?
        "chat-message-frog" :
        "chat-message-user"
    }>
      {sender === 'frog' ? (
        <img src="frog.png"
          className="chat-message-image" />
      ) : null}
      <div className="chat-message-text">
        {message}
      </div>
      {sender === 'user' ? (
        <img src="user.png"
          className="chat-message-image" />
      ) : null}
    </div>
  );
}

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


function App() {

  // Using React.useState to convert data to state
  // Array destructuring to get the state variable and the function to update it
  const [chatMessages, setChatMessages] = useState([
  ]);
  return (
    <div className="app-container">
      <ChatMessages chatMessages={chatMessages} />
      <ChatInput chatMessages={chatMessages} setChatMessages={setChatMessages} />
    </div>
  );
}

export default App
