import { useState } from 'react'
import { ChatInput } from './components/ChatInput.jsx'
import ChatMessages from './components/ChatMessages.jsx'
import './App.css'

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
