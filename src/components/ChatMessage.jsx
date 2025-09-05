import ChattyfrogImg from '../assets/frog.png'
import UserImg from '../assets/user.png'
import './ChatMessage.css'

export function ChatMessage({ message, sender }) {
    return (
        <div className={
            sender === 'frog' ?
                "chat-message-frog" :
                "chat-message-user"
        }>
            {sender === 'frog' ? (
                <img src={ChattyfrogImg}
                    className="chat-message-image" />
            ) : null}
            <div className="chat-message-text">
                {message}
            </div>
            {sender === 'user' ? (
                <img src={UserImg}
                    className="chat-message-image" />
            ) : null}
        </div>
    );
}