import React, { useState, useEffect, useRef } from 'react';
import api from '../axios'; // Use your configured axios instance

// A new component for the loading skeleton
const ChatSkeleton = () => (
  <>
    <div className="message model skeleton">
      <p>Loading...</p>
    </div>
    <div className="message user skeleton">
      <p>Please wait</p>
    </div>
    <div className="message model skeleton">
      <p>while we retrieve your history.</p>
    </div>
  </>
);


const ChatScreen = ({ sessionConfig, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState(null);
  // --- FIX: Added the missing useState for userInput ---
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // --- UPDATED: Fetch context instead of full history ---
    const loadContext = async () => {
      if (!sessionConfig.sessionId) return;
      setIsHistoryLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/api/ai/chat/${sessionConfig.sessionId}/context`);
        setSummary(data.summary);
        setMessages(data.recentMessages);
      } catch (err) {
        console.error("Context fetch error:", err);
        setError("Could not load chat context.");
      } finally {
        setIsHistoryLoading(false);
      }
    };
    loadContext();
  }, [sessionConfig.sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isSending) return;

    const tempId = Date.now();
    const userMessage = { id: tempId, role: 'user', content: userInput };
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = userInput;
    setUserInput('');
    setIsSending(true);
    setError(null);

    try {
      const { data } = await api.post(`/api/ai/chat/${sessionConfig.sessionId}`, { userInput: currentInput });
      const botMessage = { role: 'model', content: data.text };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Send message error:", err);
      setError("Failed to send message. Please try again.");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button onClick={onBack} className="back-button">←</button>
        <h2>Chat with {sessionConfig.botName}</h2>
      </div>
      <div className={`chat-messages ${!isHistoryLoading ? 'loaded' : ''}`}>
        {isHistoryLoading ? (
          <ChatSkeleton />
        ) : (
          <>
            {/* --- NEW: Render the summary message --- */}
            {summary && (
              <div className="summary-message">
                <p>✨ {summary}</p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={msg.id || idx} className={`message ${msg.role}`}>
                <p>{msg.content}</p>
              </div>
            ))}
          </>
        )}
        
        {isSending && (
            <div className="message model typing-indicator">
                <p>{sessionConfig.botName} is typing...</p>
            </div>
        )}

        {error && <div className="message error"><p>{error}</p></div>}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Say something..."
          disabled={isSending || isHistoryLoading}
        />
        <button type="submit" disabled={isSending || isHistoryLoading}>Send</button>
      </form>
    </div>
  );
};

export default ChatScreen;
